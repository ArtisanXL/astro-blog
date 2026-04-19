export const tr = {
  htmlLang: "tr",
  ogLocale: "tr_TR",
  intlLocale: "tr-TR",
  dirName: "tr",
  skipLink: "İçeriğe atla",
  nav: {
    primary: "Birincil",
    home: "Anasayfa",
    blog: "Yazılar",
    tags: "Etiketler",
    about: "Hakkımda",
    cv: "Özgeçmiş",
    colophon: "Perde arkası",
    search: "Ara",
    rss: "RSS",
    themeToggle: "Tema değiştir",
    languageSwitch: "English",
    languageSwitchLabel: "Dili değiştir",
  },
  footer: {
    pages: "Sayfalar",
    connect: "Bağlantı",
    behind: "Perde arkası",
    stack: ["Astro 6 · Cloudflare Workers", "Geist · JetBrains Mono"],
    copyrightSuffix: "Tüm yazılar CC BY 4.0",
  },
  post: {
    breadcrumbBlog: "blog",
    readingMinutes: "dk okuma",
    minutesShort: "dk",
    toc: "İçindekiler",
    share: "Paylaş",
    shareTwitter: "Twitter'da paylaş",
    shareCopy: "Linki kopyala",
    shareCopied: "Kopyalandı ✓",
    prev: "← Önceki",
    next: "Sonraki →",
    atStart: "Listenin başındasın",
    atEnd: "Listenin sonundasın",
    featuredEyebrow: "ÖNE ÇIKAN",
  },
  blogIndex: {
    title: "Yazılar",
    descriptionMeta: "Tüm yazılar — Laravel, edge ve mimari notları.",
    eyebrow: (n: number) => `/yazılar — ${n} adet`,
    heading: "Arşiv",
    lede: "Yazdığım her şey burada. Etiketle daralt, başlıkta ara, ya da sadece kaydırarak gez.",
    filterAll: "Hepsi",
    filterAllMore: "hepsi →",
    searchPlaceholder: "Başlık veya etikette ara...",
    emptyState: "// 0 sonuç. Aramayı değiştir veya filtreyi kaldır.",
  },
  tagsIndex: {
    title: "Etiketler",
    descriptionMeta: "Yazıların etiketlere göre dağılımı.",
    eyebrow: (n: number) => `/etiketler — ${n} adet`,
    heading: "Konuya göre.",
    lede: "Yazıları sınıflandırırken kendime dürüst olmaya çalıştım. Üç beş etiket, çok değil.",
    postsSuffix: "yazı",
  },
  tagDetail: {
    breadcrumb: "etiketler",
    eyebrow: (n: number) => `/etiket — ${n} yazı`,
    lede: (label: string) => `"${label}" etiketli yazıların tamamı. En yeni en üstte.`,
    descriptionMeta: (label: string) => `${label} etiketli yazılar.`,
  },
  notFound: {
    title: "404 · Sayfa bulunamadı",
    descriptionMeta: "Aradığın sayfa burada değil.",
    eyebrow: "/404 — yok böyle bir sayfa",
    heading: "Burada bir şey yok.",
    bodyHtml: (homeHref: string, blogHref: string) =>
      `Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir. Sıfırdan başlamak istersen <a href="${homeHref}">ana sayfaya</a> dönebilir, ya da <a href="${blogHref}">arşive</a> göz atabilirsin.`,
  },
  home: {
    eyebrow: "/INDEX — selam, ben mert",
    headline: "Laravel yazıyorum. Edge'e bulaştım. Notlarım burada.",
    intro: (name: string) =>
      `Selam, ben ${name}. Bir süredir edge üstüne kafa yoruyorum. Burada çoğunlukla uğraştığım şeyin notları var; ne işe yaradı, ne yaramadı.`,
    ctaAll: "Tüm yazılar",
    ctaAbout: "Hakkımda",
    featuredEyebrow: "Seçkiler",
    featuredHeading: "Öne çıkanlar",
    featuredLink: "Hepsini gör",
    feedEyebrow: "Akış",
    feedHeading: "Son yazılar",
    feedLink: "Arşiv",
    nowEyebrow: "/şu sıralar",
    nowHeading: "Bazı projelerimi edge ile donatıyorum.",
    nowBody: "Workers'ta çalışacak şekilde yeniden yazıyorum. Stateful kalan kısımlar var, onlarla boğuşuyorum.",
    stackEyebrow: "/teknoloji",
    stack: [
      ["Backend", "Laravel 13 · PHP 8.4"],
      ["Frontend", "Livewire · React"],
      ["Edge", "V8 isolates"],
      ["Editör", "PhpStorm"],
    ] as [string, string][],
  },
  about: {
    title: "Hakkımda",
    descriptionMeta: "Mert hakkında: nasıl başladı, burada ne paylaşıyor, nasıl ulaşılır.",
    eyebrow: "/hakkımda — selam, ben mert",
    heading: "Yazılıma ortaokulda bulaştım.",
    introHtml: `Ortaokulda Silkroad Online oynuyordum; giriş sırası saatlerce sürüyordu. <a class="link" href="https://www.autoitscript.com/site/autoit/">AutoIt</a>'i bulup otomatik giriş için bir script yazdım. Çalışınca başka ne otomatikleştirebileceğimi düşündüm. O soruyu sormayı bırakmadım.`,
    sections: [
      {
        h: "Kısaca",
        ps: [
          "Sonra ilk kişisel sitemi açtım. İçeriği basitti, tasarımı kötüydü, ziyaretçisi yoktu. Ama benim sitemdi ve bu yeterliydi.",
          'Aradan geçen yıllarda PHP, Python, C#, Dart/Flutter, React Native, Arduino derken bir sürü teknolojiyle haşır neşir oldum. Hangisini "biliyorum" demek hâlâ zor; ihtiyaç olunca öğreniyorum, işim bitince bir kısmını unutuyorum. (Bence böyle yapmamalısınız.)',
        ],
      },
      {
        h: "Burada ne var",
        ps: [
          "Çoğunlukla uğraştığım bir şeyin notları; neyin işe yarayıp neyin yaramadığı. Ara sıra kafamı yeterince yiyen bir konu üzerine uzun bir yazı.",
          "Düzenli yazmıyorum. Olunca oluyor.",
        ],
      },
      {
        h: "Nasıl çalışıyorum",
        ps: [
          "Çoğu şeyi kendi kendime öğrendim. Hobi olarak başladı, işe döndü. Bir problemle karşılaşınca kurcalıyorum. Takıldığım yerde araştırıyorum, deniyorum, çözene kadar bu döngü devam ediyor. Hatadan başka öğretmen olmadı zaten.",
          "Söz verdiğim işi vaktinde bitirmeyi önemsiyorum (ama genelde bazı ufak tefek gecikmeler yaşanıyor). Rahat çalışmayı seviyorum; bir işe başlamadan önce detaylı planlamaktan zevk alıyorum — bazen de fazla planlıyorum.",
        ],
      },
      {
        h: "Şu sıralar",
        ps: [
          "Edge ve serverless teknolojilere sardım kendimi; Cloudflare Workers ve benzeri şeyler. Çoğunlukla araştırıyorum, bir şeyler deniyorum, nasıl çalıştığını anlıyorum.",
        ],
      },
    ],
    contact: {
      h: "İletişim",
      bodyHtml: (email: string) =>
        `İş, danışmanlık ya da "şu yazını okudum" demek için <a href="mailto:${email}">${email}</a>. Mail atmaktan çekinme.`,
      colophonHtml: (lang: string) =>
        `Sitenin nasıl yapıldığı <a href="/${lang}/colophon">Perde arkası</a>'nda.`,
    },
  },
  cv: {
    title: "Özgeçmiş",
    descriptionMeta: "Eğitim, birkaç proje, birkaç ödül — özet halinde.",
    eyebrow: "/özgeçmiş — neler yaptım",
    heading: "Özgeçmiş",
    ledeHtml: (lang: string) =>
      `Birkaç eğitim, birkaç proje, birkaç ödül. Tam liste değil, kısa bir özet. Daha kişisel bir anlatımı <a class="link" href="/${lang}/about">hakkımda</a> sayfasında bulabilirsin.`,
    education: {
      h: "Eğitim",
      items: [
        {
          html: `<strong>Bilgisayar ve Öğretim Teknolojileri Öğretmenliği</strong> <em>(Lisans, 2015–2019)</em> — Hatay Mustafa Kemal Üniversitesi, Eğitim Fakültesi. Diploma notu 3.13 / 4.`,
        },
        {
          html: `<strong>Web Tasarımı ve Kodlama</strong> <em>(Önlisans, 2019–2021)</em> — Anadolu Üniversitesi Açıköğretim Fakültesi. Not ortalaması 2.60 / 4.`,
        },
      ],
    },
    projects: {
      h: "Projeler",
      lede: "Bir kısmı bitti, bir kısmı yarım kaldı. Aşağıdakiler uzun ömürlü olanlardan.",
      items: [
        {
          html: `<strong>Eller Konuşsun</strong> <em>(2019)</em> — İşitme engelliler için alternatif iletişim yöntemi; elektronik ve mobil uygulama destekli. TÜBİTAK 2242 kapsamında geliştirildi.`,
        },
        {
          html: `<strong>Flutter Advanced Share</strong> <em>(2018)</em> — Flutter framework için (yalnızca Android) gelişmiş paylaşım kütüphanesi. <a href="https://github.com/MertcanDinler/Flutter-Advanced-Share">Kaynak</a>.`,
        },
        {
          html: `<strong>DEĞER-QR</strong> <em>(2017)</em> — Etkinlik ve organizasyonlarda kullanılmak üzere QR kod tabanlı web değerlendirme uygulaması. Python ve Django ile yazıldı.`,
        },
        {
          html: `<strong>MKÜ Yemekhane</strong> <em>(2016)</em> — Mustafa Kemal Üniversitesi yemekhanesi için günlük/aylık menü uygulaması. <a href="https://github.com/MertcanDinler/Mku-Yemekhane">Kaynak</a>.`,
        },
      ],
    },
    awards: {
      h: "Ödüller",
      items: [
        {
          html: `<strong>Teşvik Ödülü — TÜBİTAK 2242 / TEKNOFEST</strong> <em>(2019)</em> — Üniversite Öğrencileri Araştırma Proje Yarışmaları, Türkiye Finali, "Sosyal Yenilikçilik ve Girişimcilik" kategorisi.`,
        },
        {
          html: `<strong>Birincilik Ödülü — TÜBİTAK 2242</strong> <em>(2019)</em> — Üniversite Öğrencileri Araştırma Proje Yarışmaları, Kayseri Bölgesi, "Sosyal Yenilikçilik ve Girişimcilik" kategorisi.`,
        },
        {
          html: `<strong>Onur Belgesi</strong> <em>(2019)</em> — Hatay Mustafa Kemal Üniversitesi Eğitim Fakültesi, Bilgisayar ve Öğretim Teknolojileri Öğretmenliği programı başarısı.`,
        },
      ],
    },
  },
  colophon: {
    title: "Kolofon",
    descriptionMeta: "Bu site nasıl yapıldı — kullanılan araçlar, barındırma ve küçük detaylar.",
    eyebrow: "/colophon — bu site nasıl yapıldı",
    heading: "Perde arkası",
    ledeHtml: (lang: string) =>
      `Buradaki her şeyin nasıl bir araya geldiğine dair kısa bir not. İlgini çekiyorsa devam et; çekmiyorsa <a class="link" href="/${lang}/">ana sayfaya</a> dönmek de seni kırmaz.`,
    code: {
      h: "Kod",
      items: [
        `<a href="https://astro.build">Astro</a> ile yazıldı; içerik koleksiyonları ve tipli frontmatter kullanılıyor.`,
        `Tüm sayfalar build sırasında üretiliyor. Varsayılan olarak istemci tarafı JavaScript yok; ihtiyaç olan üç beş yerde <code>is:inline</code> küçük betikler var.`,
        `Stil için <a href="https://tailwindcss.com">Tailwind CSS v4</a>; tema tokenları doğrudan CSS'te (<code>@theme</code>) tanımlı, ayrı bir <code>tailwind.config.js</code> yok.`,
      ],
    },
    hosting: {
      h: "Barındırma",
      items: [
        `<a href="https://workers.cloudflare.com">Cloudflare Workers</a> Static Assets üzerinde yayında. Sayfalar size en yakın veri merkezinden, soğuk başlatma maliyeti olmadan geliyor.`,
        `Worker kodu yok, adaptör yok — sadece statik dosyalar. Bir gün dinamik bir uca ihtiyaç olursa adaptörü geri eklemek <code>wrangler.jsonc</code>'da anlatılmış.`,
        `Deploy <a href="https://developers.cloudflare.com/workers/wrangler/">Wrangler</a> ile yapılıyor.`,
      ],
    },
    typography: {
      h: "Tipografi",
      items: [
        `Metin: <strong>Geist</strong>`,
        `Kod ve mono detaylar: <strong>JetBrains Mono</strong>`,
        `Vurgular: <strong>Instrument Serif</strong> (italik)`,
      ],
    },
    seo: {
      h: "SEO ve beslemeler",
      body: `Sitemap, Open Graph ve Twitter Cards build çıktısında geliyor. Tüm SEO meta etiketleri tek bir <code>BaseHead</code> bileşeninden geçiyor; sayfalar sadece başlık ve açıklama veriyor.`,
    },
    writing: {
      h: "Yazı yazma süreci",
      body: `Yazılar <code>src/content/blog</code> altında Markdown veya MDX olarak duruyor. Frontmatter şeması <code>src/content.config.ts</code> içinde tanımlı — yeni bir alan eklemeden önce oraya bakıyorum.`,
    },
    source: {
      h: "Kaynak kod",
      bodyHtml: (sourceHref: string, email: string) =>
        `Sitenin kaynak kodunu merak ediyorsan <a href="${sourceHref}">buradan inceleyebilirsin</a>. Bir şey kırıkken görürsen, bana <a href="mailto:${email}">${email}</a> adresinden yazabilirsin.`,
    },
    thanks: {
      h: "Teşekkür",
      body: `Astro, Cloudflare ve hayatımı kolaylaştıran sayısız açık kaynak projeye. Bu sitenin omurgası bu insanların ücretsiz dağıttığı emek üzerine kurulu.`,
    },
  },
  rss: {
    title: "mert.gg — Yazılar",
    description: "Laravel ve edge üzerine notlar. Ne işe yaradı, ne yaramadı.",
  },
};

export type Strings = typeof tr;
