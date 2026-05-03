---
title: "D1 ile bir hafta sonra"
description: "Bir Laravel'cinin Cloudflare D1'le ilk haftası. Replica davranışı, transaction sınırı ve bırakılan alışkanlıklar."
pubDate: 2026-05-03
tags: ["veritabani", "cloudflare", "laravel", "edge"]
translationKey: "d1-first-week"
---

Hafta başı küçük bir API için D1 kullanmaya karar verdim. Bir Worker, bir KV bucket, bir D1, az hız, az maliyet. Haftayı başladığım kafayla bitirmedim. D1 bir SQLite, evet, ama SQLite'tan beklediğim şeylerin bir kısmı yok, beklemediğim bir kısmı var.

Sadece "SQLite" demek yetmiyor. Altta SQLite var, doğru. Ama "SQLite on edge" aslında üç şeyi aynı anda söylüyor: storage motoru SQLite, erişim HTTP üzerinden Cloudflare API'sine (lokal disk değil), bir de primary + opsiyonel read replica modeli. Üçüncüsü beni en çok şaşırtan oldu. Default kurulumda her şey primary'ye gidiyor, sorun yok. Ama Sessions API'ye geçtiğin anda (`env.DB.withSession(...)`) okumalar bölgesel read replica'lara düşebiliyor. MySQL'de hangi connection'ı seçtiğimi ben kontrol ediyordum (`DB::connection('read')`). D1'in Sessions API'sinde bookmark mantığı var, "şu noktadan sonra tutarlı oku" diyebiliyorsun. İlk gördüğümde duraksadım: bookmark vermezsen ve `first-unconstrained` ile başlarsan, yazdığın bir satırın hemen ardından gelen okuma replica'ya düşüp eski state'i dönebiliyor.

```js
await db.prepare("INSERT INTO posts (slug, body) VALUES (?, ?)")
  .bind("hello", "world")
  .run();

const row = await db.prepare("SELECT * FROM posts WHERE slug = ?")
  .bind("hello")
  .first();

// row null olabilir
```

Çözüm birkaç yönlü. Sessions API kullanmıyorsan zaten primary'den okursun, mesele yok. Kullanıyorsan yazmadan dönen bookmark'ı bir sonraki `withSession(bookmark)` çağrısına geçir, ya da yazma + okumayı `db.batch([...])` içinde tut. Alışkanlık değişikliği.

Migration tarafında `php artisan migrate` rahatlığı yok. D1'in kendi sistemi var: SQL dosyaları, sıralı isimlendirme, `wrangler d1 migrations apply`. Bir Laravel migration'da yapabileceğin şeylerin yarısını burada yapamıyorsun. `dropColumn` SQLite'ta zaten her zaman tehlikeliydi (tablo recreate). `enum` yok, `CHECK` constraint ile yapıyorsun ya da app tarafında validasyon. `JSON` sütun olarak desteklenmiyor, TEXT'e yaz, parse et.

İlk gün bir saatimi ENUM bulamamaya harcadım. CHECK'le çözdüm. Yeni bir status eklemek artık migration istiyor. Laravel'de string column tutar, validasyonu app tarafında yapardım. D1'de DB seviyesinde yapmak doğal hissetti, çünkü replication yok, yazma noktası tek, validasyon ucuz.

Transaction desteği var ama tek bir request içinde. `db.batch([s1, s2, s3])` atomik çalışıyor, hepsi olur ya da hiçbiri. "Uzun süre açık tutulan transaction" yok. Workers'ın istek başına CPU time'ı sınırlı, açık tutamazsın. Laravel'de `DB::transaction(function () { ... })` ile blok içine sarmaya alışıktım. D1'de bunu request boyunca tek bir batch olarak düşünmek gerekiyor. İki request arasında transaction tutman gereken yerlerde tuhaf. Ben oraya gelince Durable Object'lere geçtim. DO içindeki SQLite single-writer garantisi veriyor, "transaction'da state tutma" kavramı geri geliyor. Bu artık D1 değil tabi, başka bir hikaye.

Eloquent gibi bir query builder yok. Worker tarafında ya raw SQL (`db.prepare(...).bind(...)`) ya Drizzle adapter gibi bir şey. Ben başta raw kullandım, hızla küçük bir helper class yazdım:

```ts
class Posts {
  constructor(private db: D1Database) {}

  findBySlug(slug: string) {
    return this.db
      .prepare("SELECT * FROM posts WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first<Post>();
  }
}
```

Üç günde Eloquent'in sana ne kadar şey ucuza verdiğini fark ediyorsun. Pagination, scopes, relations, casting, mutators. Hepsi sıfırdan ya da elle.

Bir tarafı seçmem gerekirse: D1, Laravel'de yaptığın işin %90'ı için doğru araç değil. CRUD-yoğun uygulama, karmaşık raporlama, çoklu ilişkili veri; MySQL ya da PostgreSQL hala doğru cevap. Tooling olgun, dökümantasyon zengin, Eloquent yok ama benzeri her dilde var.

D1'in gerçekten doğru olduğu yerler: edge-first uygulamalar, okuma ağırlıklı ve yazmanın az olduğu workload (blog metadata, feature flag, küçük telemetri), statik site + minik API kombinasyonu, maliyeti çok düşük tutmak isteyen küçük projeler.

Bir Laravel monoliti'ni D1'e taşımak için iyi bir sebep göremedim. Ama bir SaaS'ın "marketing site + lead capture" parçasını D1'de tutmak, ana DB'yi MySQL'de bırakmak; bu bana mantıklı geldi.

Bir hafta yetmedi tabi. Tutuk noktalarını fark ettim, hangi alışkanlıkları bırakmam gerektiğini gördüm. İkinci hafta için planım `db.batch` ile çalışan bir mini-ORM yazmak. Bakalım o ne kadar dayanır…
