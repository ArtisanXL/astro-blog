---
title: "Astro view transitions analytics'imi yedi"
description: "View transitions'ı shipledim, pageview yarıya düştü, ad blocker suçladım, yanlıştım. Çözüm iki event listener."
pubDate: 2026-04-10
tags: ["astro", "performans"]
translationKey: "view-transitions-analytics"
---

Pazartesi Astro'nun `<ClientRouter />`'ını shipledim. Salı sabahı haftalık pageview önceki haftanın yaklaşık yarısı tempoda gidiyordu. Server log'larda aynı traffic. RSS click'leri aynı. Sadece analytics provider'ın sayıları daha düşük.

İlk içgüdü tembel olandı: ad blocker. Bir saatimi onların pazar payı raporlarını okuyarak harcadım. Matematik tutmuyordu. Ad blocker oranı bir gecede ikiye katlanmıyor, üstelik düşüş deploy'a tam hizalı bir step function'dı.

Asıl sebep her sayfanın head'inde duruyordu:

```html
<script defer src="https://example.com/script.js" data-site="SITE"></script>
```

Normal bir script tag. Bir kere yüklenir, bir kere çalışır, yüklendiği sayfa için pageview register eder. Bitti.

View transitions öncesi her navigation tam sayfa yüklemesiydi, script her sayfada baştan çalışıyordu. View transitions sonrası script ilk landing sayfasında çalışıyor, ondan sonra bir daha çalışmıyor, çünkü Astro document'i bozmadan body'yi swap ediyor. Script bellekte hâlâ var, pageview fonksiyonu callable... sadece kimse çağırmıyor.

Event'ler `astro:page-load` ve `astro:after-swap`. `page-load` ilk yüklemede ve her navigation tamamlandığında firelanır. `after-swap` daha erken, yeni document eskisinin yerine geçtikten hemen sonra ama yeni script'ler çalışmadan önce. Analytics için istediğin `page-load`.

Çözüm snippet'i inline koyup event'i bağlamak:

```html
<script is:inline>
  function trackPageview() {
    if (window.plausible) {
      window.plausible('pageview');
    }
  }
  document.addEventListener('astro:page-load', trackPageview);
</script>
<script defer src="https://example.com/script.js" data-site="SITE"></script>
```

`is:inline` önemli. Astro yoksa script'i bundle edip scope ediyor ve view transitions ile kötü etkileşime giriyor. Inline script olduğu gibi geçer, swap'lar arasında hayatta kalır.

`if (window.plausible)` koruması orada çünkü ilk page load'da third-party script hâlâ yükleniyor olabiliyor. İlk hit düşer, ama script kendi init'inde zaten bir pageview register ediyor. Sonra her navigation event'i firler.

Sayılar ertesi gün geri geldi. Tamamen değil; iki günlük veri kaybetmiştim. Ama trend line doğruydu ve deploy günü step'i gitti.

İçerideyken view transitions'ın kırdığı iki şey daha gördüm. Üçüncü taraf chat widget'ı `DOMContentLoaded` üzerine mount oluyordu, navigation'da kayboluyordu çünkü yeni body'de inject ettiği iframe yoktu, `DOMContentLoaded` da yeniden firelanmıyor. Aynı fix şekli: `astro:page-load`'a bağla, yeniden init et. Bir de `<meta name="theme-color">`'u okuyup CSS değişkeni set eden ufak bir script vardı, bir kere çalışıyor sonra farklı renk isteyen sayfada değişken bayat kalıyordu. Aynı fix.

Yani şu: view transitions açıkken "load üzerine" çalışan her kod, "load" derken ilk seferi mi her transition'ı mı kastettiğine karar vermek zorunda. Default ilk seferi. İstediğin genellikle her transition.

View transitions açıyorsan ve analytics, üçüncü taraf widget ya da theme global'leri varsa, her script tag'ini gez ve "swap'tan sonra tekrar çalışması gerekir mi" diye sor. Bende cevap çoğu zaman evetti, framework de bunu senin yerine yapmıyor.
