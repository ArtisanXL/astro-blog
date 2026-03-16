---
title: "--pretend temizdi, production'da öldü"
description: "Temiz bir dry-run, temiz bir staging deploy, ve 2019'dan kalma tek bir soft-delete satırı tüm deploy'u durdurdu."
pubDate: 2026-03-16
tags: ["laravel", "veritabani", "devops"]
translationKey: "pretend-migration-lied"
---

Perşembe sabahı bir Laravel migration'ı deploy ettim. Sahip olduğum bütün güvenlik kontrollerinden geçirmiştim. `php artisan migrate --pretend` temiz SQL bastı. Staging deploy migration'ı şikayet etmeden çalıştırdı. Production deploy çalıştırdı ve kırıldı:

```
SQLSTATE[23000]: Integrity constraint violation: 1048
Column 'billing_email' cannot be null
(SQL: ALTER TABLE users MODIFY billing_email VARCHAR(255) NOT NULL)
```

Migration `users.billing_email`'i nullable olmayan yapıyordu. Savunulabilir gerekçeler vardı. Uygulama bir yıldır bu alanı zorunlu davranıyordu, validation her yerde zorunlu kılıyordu, hiçbir UI o alan boş kullanıcı oluşturamıyordu. Sonra constraint'i ekledim. `--pretend` ne SQL koşacağını söyledi. Staging aynı SQL'i koştu, geçti. Production aynı SQL'i koştu ve 47.219'uncu satırda durdu. 2019'da soft-delete edilmiş, `billing_email` değeri NULL olan bir kullanıcı. Silindiğinde o sütun zorunlu değildi, validation eklenmemişti, kimsenin umurunda değildi.

`--pretend`'in yaptığı şey migration'ın üreteceği SQL'i basmak. SQL'i koşmuyor. SQL'i gerçek veriye karşı kontrol etmiyor. Şema farkındalığı olan bir sözdizimi kontrolü. Güvenlik kontrolü değil.

Asıl başarısızlık staging'di. Staging'de altı ay önceki bir production şema dump'ı vardı, üzerine seed data ekleniyordu. Seed data construction itibarıyla temiz. Şema-only kopya, 2019'daki satırın staging'de hiç var olmadığını söylüyordu çünkü seed script kullanıcıları sıfırdan oluşturuyordu. Migration staging'de herkesin `billing_email`'i set edilmiş satırlara karşı çalıştı.

Prod snapshot'a karşı migration koşmanın bir maliyeti var. Disk, restore süresi, PII (anonymizer script'iyle). Bu pipeline'ı 90 dakikalık ilk kurulum yüzünden hiç oturup yapmamıştım, staging seed üzerindeydi. Bozulan deploy'un maliyeti o 90 dakikadan yüksekti. Bende öyle oldu, bir sonraki sefer de muhtemelen aynı şekilde.

Şimdi migration'da bir varsayım varsa, deploy script o varsayımı önceden sayıyor. Bu migration için varsayım "her satırın non-null `billing_email`'i var" idi. Kontrol:

```sql
SELECT COUNT(*) FROM users WHERE billing_email IS NULL;
```

Sıfır değilse deploy abort, count basılır. Üç satır bash. "Eklediğimiz constraint mevcut veriyle çelişiyor" sınıfının tümünü prod snapshot olmadan yakalıyor.

Sıkıştıran migration kuralı: bir constraint ekliyorsan önce satır say. Sıfır değilse, iş constraint değil, backfill. Sıfırsa, constraint güvenli ve migration tek satır. Her halükarda `--pretend`'e dokunmadan ne yaptığını biliyorsun.
