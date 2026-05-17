---
title: "Bir byte görmeden önce üç cache"
description: "Bir öğleden sonrayı Cloudflare cache'ini invalidate etmeye çalışarak geçirdim, sürekli yanlış katmana vuruyordum. En az üç tane var."
pubDate: 2026-04-02
updatedDate: 2026-05-17
tags: ["cloudflare", "edge", "performans"]
translationKey: "three-edge-caches"
---

Çarşamba öğleden sonra bir içerik güncelledim. Deploy. Sayfayı açtım. Eski içerik. Cloudflare dashboard'da "Purge" butonuna bastım. Eski. "Purge Everything." Eski. Network değiştirdim, browser değiştirdim, incognito açtım. Eski.

Origin'imle gözüm arasında üç şey vardı, ben tek birini purge ediyordum.

Cloudflare'ın caching yüzeyi "cache" kelimesinin söylediğinden daha geniş. CDN edge cache var, çoğu insanın "cache" derken kastettiği bu. Worker içinde `caches.default` olarak erişilen Cache API var. Dashboard'da Cache Rules var, edge cache'in üstünde duruyor ve neyin ne kadar cache'leneceğine karar veriyor. İsimleri birbirine benziyor. Üçü ayrı yerlerde cache'liyor, ayrı mekanizmalarla invalidate ediliyor, ayrı TTL semantiği var. Worker'ı static asset'lerin önüne koyduysan üçü de aynı anda devrede.

CDN edge cache `cf-cache-status` header'ının bahsettiği şey. `HIT` edge cache'ten geldi demek, `MISS` origin'e gitti, `BYPASS` bir cache rule ya da `no-store` engelledi. "Purge Everything" butonu bunu purge'ler. Çoğu blog yazısının bahsettiği bu. O öğleden sonra benim purge'lediğim de buydu.

Cache API ayrı bir hayvan. Worker içinden:

```ts
const cache = caches.default;
const cached = await cache.match(request);
if (cached) return cached;
const fresh = await fetch(originUrl);
await cache.put(request, fresh.clone());
return fresh;
```

Bu response'u data center'a yerel bir cache'e koyar, request URL'ine göre keyli. CDN edge cache *değil*. "Purge Everything" butonu dokunmuyor. Dashboard view yok. Üstelik `cache.delete(request)` da sadece Worker'ın çalıştığı data center'da geçerli, başka colo'lar haberdar olmuyor. Yani bir entry'yi her yerden silmenin pratik yolu ya tüm colo'larda TTL'in dolmasını beklemek, ya da Cache Tag tabanlı purge gibi global bir kanala bağlamak. Aylarca Cache API entry'lerini CDN cache'in parçası sanmıştım. Değil.

Cache Rules her ikisinin üstünde. Bir URL pattern için davranışı override edebiliyorsun: daha uzun TTL, bypass, edge ve browser TTL'i ayrı. Önemli olan şu: rule önce çalışır, origin "cache'leme" dese bile rule "bu path'i bir saat cache'le" diyebilir, edge bir saat cache'ler. Aylar önce eklediğim bir kural, güncellemeye çalıştığım path'e bir saatlik edge TTL koyuyordu. Purge cache'i temizledi, sonraki request rule'a uğradı, origin'den çekti, tekrar bir saatliğine cache'ledi.

O öğleden sonra olan şuydu: Worker önümde, `caches.default` JSON response'larını beş dakika tutuyordu. Aynı path için bir saatlik edge TTL veren bir Cache Rule vardı. Purge ettiğimde edge boşaldı, bir sonraki request Worker'a girdi, Worker `caches.default`'tan eski response'u döndü (purge ona dokunmamıştı), edge eski response'u tekrar bir saatliğine cache'ledi.

Üç katlı bir merdiven yaratmıştım, her kat bir altından yanlış içerikle doluyordu.

Çözüm tek bir katmanı daha iyi öğrenmek değildi. O request için staleness'in hangi katmandan geldiğini bilip ona göre hareket etmekti. Tanı response header'larından başlar. Worker path'teyse `cf-cache-status: DYNAMIC` döner ve Worker içeride `caches.default`'tan serve ediyor olabilir, sana söyleyen bir header yok. Birkaç satırla `x-cache-layer: worker-hit` debug header'ı koymak değiyor:

```ts
const cached = await cache.match(request);
if (cached) {
  const headers = new Headers(cached.headers);
  headers.set("x-cache-layer", "worker-hit");
  return new Response(cached.body, { ...cached, headers });
}
// ... miss path normal akıyor; sadece hit'te header eklemek yetiyor.
```

Katmanlar invalidation kanalını paylaşmıyor. Tutarlılık istiyorsan her birini kendin invalidate etmen gerek, origin'den dışarı doğru. Ya da TTL'leri umursamayacağın kadar kısa tut, staleness penceresini kabul et.
