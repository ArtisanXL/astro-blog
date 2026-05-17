---
title: "Adapter koymadan Astro deploy ettim"
description: "Bu blog Cloudflare'de Static Assets olarak yayında. Adapter yok, Worker yok. Niye böyle yaptım."
pubDate: 2026-04-21
updatedDate: 2026-05-17
tags: ["edge", "mimari", "astro", "cloudflare"]
translationKey: "no-adapter"
---

Birine bu blogu nasıl deploy ettiğimi anlattım, "adapter koymadın mı" dedi. Yok. `wrangler.jsonc`'ta `main` satırı yok, `astro.config.mjs`'de adapter satırı yok. Build çıktısı CDN'e doğrudan statik dosya olarak gidiyor. Çalışıyor.

Çoğu tutorial adapter ile başlıyor çünkü SSR çoğu uygulamanın varsayılan ihtiyacı. Bir blogun değil. Sayfaları derleme zamanında üretiliyor zaten. 2026-02-18'den beri — bu blogun kendisi — hiçbir şey patlamadı.

`wrangler.jsonc` şuna benziyor:

```jsonc
{
  "name": "mert-gg",
  "compatibility_date": "2026-04-01",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "404-page"
  }
}
```

`main` yok, yani Worker yok. Astro tarafında her `.astro` sayfasının üstünde `export const prerender = true`, `output: 'static'` (varsayılan ama açıkça yazıyorum, görünür olsun). Build sonrası `dist/` içinde HTML, CSS, font ve view transitions için minik bir runtime. Cloudflare CDN'ine yükleniyor, oradan servis ediliyor.

Adapter koysam `@astrojs/cloudflare` ile dinamik sayfalar, API endpoint'leri, `Astro.locals.runtime.env` üzerinden binding erişimi, middleware kazanırdım. SaaS yazıyorsan bunlar şart. Blog için şu an hiçbirini istemiyorum.

Prensip değil. İhtiyacım yok. Yorum sistemi, view sayacı, newsletter formu bir gün gelebilir. Geldiğinde adapter'ı geri koymak üç dört satır. Bugün koymak, bugün karmaşıklık var ama fayda yok demek. YAGNI gerçek.

İki sessiz kazanç var. Trafik patlasa Static Assets pratik olarak limitsiz, Worker tier'ında günlük request cap var (free planda). Bir de tooling sade kalıyor: `astro build`, `wrangler deploy`, bitti. Worker olsaydı preview deployment binding'leri, secret yönetimi, dev/preview/prod paritesi gelirdi. Gerçek problemler, ama benim problemim değil şu an.

Geri dönüş yolu tek diff. Yorum eklersem `wrangler.jsonc`'a `main` yazılır, `astro.config.mjs` şuna döner:

```js
import cloudflare from '@astrojs/cloudflare';

adapter: cloudflare({ mode: 'directory' }),
output: 'hybrid',
```

Asıl önemli olan `output: 'hybrid'`. Varsayılan prerender, istediğim sayfayı dinamik yapabilirim. Mevcut `prerender = true` satırları yerinde kalır.

Bu yolun açık olduğunu bildiğim sürece, başta koymamak rahat. Geri alınabilir bir karar. Özür dilemen gerekmeyen cinsten.

Bir dahaki sefer "Cloudflare'de Astro adapter şart" diyene ne diyeceğim emin değilim. Herhalde susacağım.
