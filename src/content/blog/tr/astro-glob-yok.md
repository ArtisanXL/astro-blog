---
title: "Astro.glob gitti, import.meta.glob bire bir karşılığı değil"
description: "Codemod birini diğeriyle değiştiriyor, build yine çalışıyor. Build aynı zamanda iki kat sürüyor, sebep eksik tek bir seçenek."
pubDate: 2026-04-13
tags: ["astro", "performans"]
translationKey: "astro-glob-gone"
---

Sessiz bir sabah Astro 6'ya upgrade ettim. Release notes `Astro.glob`'un kaldırıldığını, yerine `import.meta.glob`'ın geldiğini söylüyordu. Codemod işin çoğunu yaptı. Build çalıştı, site render oldu. Sekmeyi kapadım, başka şeye geçtim.

İki gün sonra deploy süreleri yukarı kaymıştı. Build soğuktan 22 saniyeden 45'e çıkmıştı. CI artık responsive hissetmiyordu. Küçük bir içerik değişikliği push'ladım, build log'unu izledim. "Transforming 320 modules" satırı hatırladığımdan daha uzun sürüyordu.

Sebep, değiştirme çağrısında eksik kalan tek bir seçenekti.

`Astro.glob` array'e resolve olan bir Promise döndürürdü. Eager. Sonuç elinde olduğunda eşleşen her dosya import edilmiş, evalue edilmiş, bellekte:

```ts
const posts = await Astro.glob('./posts/*.md');
// posts[0] frontmatter, default export, hepsi yüklü
```

`import.meta.glob`, Vite-native versiyonu, farklı bir şey döndürür. Default'ta file path'lerden *loader fonksiyonlarına* bir map. Lazy. Module'ü almak için loader'ı çağırman lazım:

```ts
const loaders = import.meta.glob('./posts/*.md');
// { './posts/a.md': () => import('./posts/a.md'), ... }
const posts = await Promise.all(Object.values(loaders).map(l => l()));
```

Codemod bana şuna benzer bir şey verdi:

```ts
const posts = Object.values(import.meta.glob('./posts/*.md', { eager: true }));
```

Doğru. `eager` flag çağrıyı `Astro.glob` gibi davrandırıyor: eşleşen dosyalar hemen import ediliyor, sonuç file path'lerden module object'lerine bir map.

Benim yaptığım, bir call site'ı elden düzenlemekti çünkü codemod dinamik glob pattern'e takılmıştı. El düzenleme `{ eager: true }`'yu düşürmüştü. Çoğu kodum yine çalıştı çünkü sonucu await ediyordum, Vite de yeterince kibardı; await'i loader map'i üzerinden resolve edilmiş module'lere zincirledi. Fark build zamanında ortaya çıktı. Transformation sırasında bir kez resolve etmek yerine Vite her dosya için async loader stub'ları üretiyor, glob'a dokunan her sayfada runtime'da import ediyordu. ~80 markdown'lı bir content collection için bu bir sürü gereksiz round trip.

Düzeltme `{ eager: true }`'yu geri koymaktı. Build ~25 saniyeye düştü.

İkinci, daha az belli olan fark: relative path. `Astro.glob`'un proje root'una göre dostça çalışan kendi resolution mantığı vardı. `import.meta.glob` Vite'ın resolution'unu kullanıyor, dosyaya göre. `import.meta.glob` kullanan bir dosyayı taşırsan, glob match etmemeye başlayabilir.

Helper'lar için çözüm: glob sonucunu *içeri ver*, helper'ın içinde hesaplama. Ya da `/` ile absolute-from-root path:

```ts
import.meta.glob('/src/content/posts/*.md', { eager: true });
```

Baştaki slash proje root'u anlamına geliyor. Her dosyadan çalışır.

Neyse. Codemod sözdizimsel kısmı yakalar, semantik kısım sende kalır. Yeni API'nin aynı call site'larda aynı şekilde davranıp davranmadığını bilen tek kişi sensin. Upgrade'den sonra build yavaş hissediyorsa, önce `import.meta.glob`'a bak. Codemod call site konusunda haklı, seçenek konusunda her zaman değil.
