import type { Strings } from "./tr";

export const en: Strings = {
  htmlLang: "en",
  ogLocale: "en_US",
  intlLocale: "en-US",
  dirName: "en",
  skipLink: "Skip to content",
  nav: {
    primary: "Primary",
    home: "Home",
    blog: "Writing",
    tags: "Tags",
    about: "About",
    cv: "CV",
    colophon: "Colophon",
    search: "Search",
    rss: "RSS",
    themeToggle: "Toggle theme",
    languageSwitch: "Türkçe",
    languageSwitchLabel: "Switch language",
  },
  footer: {
    pages: "Pages",
    connect: "Connect",
    behind: "Behind the scenes",
    stack: ["Astro 6 · Cloudflare Workers", "Geist · JetBrains Mono"],
    copyrightSuffix: "All posts CC BY 4.0",
  },
  post: {
    breadcrumbBlog: "blog",
    readingMinutes: "min read",
    minutesShort: "min",
    toc: "Contents",
    share: "Share",
    shareTwitter: "Share on Twitter",
    shareCopy: "Copy link",
    shareCopied: "Copied ✓",
    prev: "← Previous",
    next: "Next →",
    atStart: "You're at the top of the list",
    atEnd: "You're at the end of the list",
    featuredEyebrow: "FEATURED",
  },
  blogIndex: {
    title: "Writing",
    descriptionMeta: "All writing — notes on Laravel, edge, and architecture.",
    eyebrow: (n: number) => `/writing — ${n} posts`,
    heading: "Archive",
    lede: "Everything I've written, in one place. Filter by tag, search by title, or just scroll.",
    filterAll: "All",
    filterAllMore: "all →",
    searchPlaceholder: "Search by title or tag...",
    emptyState: "// 0 results. Adjust your search or clear the filter.",
  },
  tagsIndex: {
    title: "Tags",
    descriptionMeta: "Posts grouped by tag.",
    eyebrow: (n: number) => `/tags — ${n} tags`,
    heading: "By topic.",
    lede: "I tried to be honest with myself while sorting these. A handful of tags, no more.",
    postsSuffix: "posts",
  },
  tagDetail: {
    breadcrumb: "tags",
    eyebrow: (n: number) => `/tag — ${n} posts`,
    lede: (label: string) => `All posts tagged "${label}". Newest first.`,
    descriptionMeta: (label: string) => `Posts tagged ${label}.`,
  },
  notFound: {
    title: "404 · Page not found",
    descriptionMeta: "The page you're looking for isn't here.",
    eyebrow: "/404 — no such page",
    heading: "Nothing here.",
    bodyHtml: (homeHref: string, blogHref: string) =>
      `The page you're looking for may have moved, been deleted, or never existed. To start over, try the <a href="${homeHref}">home page</a>, or browse the <a href="${blogHref}">archive</a>.`,
  },
  home: {
    eyebrow: "/INDEX — hi, I'm mert",
    headline: "Laravel dev. Got into the edge. Notes live here.",
    intro: (name: string) =>
      `Hi, I'm ${name}. I've been chewing on edge computing for a while now. This is mostly notes from whatever I'm working on — what worked, what didn't.`,
    ctaAll: "All writing",
    ctaAbout: "About",
    featuredEyebrow: "Picks",
    featuredHeading: "Featured",
    featuredLink: "See all",
    feedEyebrow: "Feed",
    feedHeading: "Recent posts",
    feedLink: "Archive",
    nowEyebrow: "/lately",
    nowHeading: "Moving some projects to the edge.",
    nowBody: "Rewriting them to run on Workers. There are stateful bits left to wrestle with.",
    stackEyebrow: "/stack",
    stack: [
      ["Backend", "Laravel 13 · PHP 8.4"],
      ["Frontend", "Livewire · React"],
      ["Edge", "V8 isolates"],
      ["Editor", "PhpStorm"],
    ],
  },
  about: {
    title: "About",
    descriptionMeta: "About Mert: how it started, what's here, how to reach me.",
    eyebrow: "/about — hi, I'm mert",
    heading: "I got into programming in middle school.",
    introHtml: `In middle school I was playing Silkroad Online; the login queue took hours. I found <a class="link" href="https://www.autoitscript.com/site/autoit/">AutoIt</a> and wrote a script to log in automatically. Once it worked I started wondering what else I could automate. I never stopped asking.`,
    sections: [
      {
        h: "Briefly",
        ps: [
          "Then I put up my first personal site. The content was basic, the design was bad, nobody visited. But it was mine, and that was enough.",
          "In the years since I've touched PHP, Python, C#, Dart/Flutter, React Native, Arduino — a long list. Saying I 'know' any of them is still hard; I learn what I need, finish the job, then forget some of it. (I don't recommend this.)",
        ],
      },
      {
        h: "What's here",
        ps: [
          "Mostly notes from whatever I'm working on; what worked and what didn't. Occasionally a longer piece on something that's been chewing on my brain.",
          "I don't write on a schedule. It happens when it happens.",
        ],
      },
      {
        h: "How I work",
        ps: [
          "I learned most of this on my own. It started as a hobby and turned into work. When I hit a problem I poke at it. I research, try things, keep iterating until it gives. Mistakes have been my only real teacher.",
          "I care about delivering on time (with the occasional small slip). I like working calmly; I enjoy planning carefully before starting something — sometimes too carefully.",
        ],
      },
      {
        h: "Lately",
        ps: [
          "I've been deep into edge and serverless — Cloudflare Workers and similar. Mostly researching, trying things, understanding how it all fits.",
        ],
      },
    ],
    contact: {
      h: "Contact",
      bodyHtml: (email: string) =>
        `For work, consulting, or just to say "I read your post" — <a href="mailto:${email}">${email}</a>. Don't hesitate to write.`,
      colophonHtml: (lang: string) =>
        `How this site is built lives in the <a href="/${lang}/colophon">colophon</a>.`,
    },
  },
  cv: {
    title: "CV",
    descriptionMeta: "Education, a few projects, a few awards — the short version.",
    eyebrow: "/cv — what I've done",
    heading: "CV",
    ledeHtml: (lang: string) =>
      `A bit of education, a few projects, a few awards. Not exhaustive — a short summary. For a more personal version, see <a class="link" href="/${lang}/about">about</a>.`,
    education: {
      h: "Education",
      items: [
        {
          html: `<strong>Computer Education and Instructional Technology</strong> <em>(B.Sc., 2015–2019)</em> — Hatay Mustafa Kemal University, Faculty of Education. GPA 3.13 / 4.`,
        },
        {
          html: `<strong>Web Design and Coding</strong> <em>(Associate, 2019–2021)</em> — Anadolu University Open Education Faculty. GPA 2.60 / 4.`,
        },
      ],
    },
    projects: {
      h: "Projects",
      lede: "Some finished, some half-done. These are the longer-lived ones.",
      items: [
        {
          html: `<strong>Eller Konuşsun</strong> <em>(2019)</em> — An alternative communication method for the hearing impaired, with hardware and a mobile app. Developed under TÜBİTAK 2242.`,
        },
        {
          html: `<strong>Flutter Advanced Share</strong> <em>(2018)</em> — Advanced share library for the Flutter framework (Android only). <a href="https://github.com/MertcanDinler/Flutter-Advanced-Share">Source</a>.`,
        },
        {
          html: `<strong>DEĞER-QR</strong> <em>(2017)</em> — A QR-based web evaluation tool for events and organisations. Built with Python and Django.`,
        },
        {
          html: `<strong>MKÜ Yemekhane</strong> <em>(2016)</em> — Daily and monthly menu app for the Mustafa Kemal University canteen. <a href="https://github.com/MertcanDinler/Mku-Yemekhane">Source</a>.`,
        },
      ],
    },
    awards: {
      h: "Awards",
      items: [
        {
          html: `<strong>Encouragement Award — TÜBİTAK 2242 / TEKNOFEST</strong> <em>(2019)</em> — University Students Research Project Competitions, Turkey Finals, "Social Innovation and Entrepreneurship" category.`,
        },
        {
          html: `<strong>First Prize — TÜBİTAK 2242</strong> <em>(2019)</em> — University Students Research Project Competitions, Kayseri Region, "Social Innovation and Entrepreneurship" category.`,
        },
        {
          html: `<strong>Certificate of Honor</strong> <em>(2019)</em> — Hatay Mustafa Kemal University Faculty of Education, Computer Education and Instructional Technology program achievement.`,
        },
      ],
    },
  },
  colophon: {
    title: "Colophon",
    descriptionMeta: "How this site was built — tools, hosting, and small details.",
    eyebrow: "/colophon — how this site was built",
    heading: "Behind the scenes",
    ledeHtml: (lang: string) =>
      `A short note on how everything here fits together. If you're curious, read on; if not, no offence taken if you head back to the <a class="link" href="/${lang}/">home page</a>.`,
    code: {
      h: "Code",
      items: [
        `Written with <a href="https://astro.build">Astro</a>, using content collections and typed frontmatter.`,
        `Every page is generated at build time. There's no client-side JavaScript by default; a handful of <code>is:inline</code> snippets where needed.`,
        `<a href="https://tailwindcss.com">Tailwind CSS v4</a> for styling; theme tokens live in CSS (<code>@theme</code>) — there is no separate <code>tailwind.config.js</code>.`,
      ],
    },
    hosting: {
      h: "Hosting",
      items: [
        `Deployed on <a href="https://workers.cloudflare.com">Cloudflare Workers</a> Static Assets. Pages are served from the nearest data centre, with no cold-start cost.`,
        `No Worker code, no adapter — just static files. If I ever need a dynamic edge, the path back is documented at the top of <code>wrangler.jsonc</code>.`,
        `Deploys go through <a href="https://developers.cloudflare.com/workers/wrangler/">Wrangler</a>.`,
      ],
    },
    typography: {
      h: "Typography",
      items: [
        `Text: <strong>Geist</strong>`,
        `Code and mono details: <strong>JetBrains Mono</strong>`,
        `Accents: <strong>Instrument Serif</strong> (italic)`,
      ],
    },
    seo: {
      h: "SEO and feeds",
      body: `Sitemap, Open Graph, and Twitter Cards are produced at build time. All SEO meta tags flow through a single <code>BaseHead</code> component; pages only provide a title and a description.`,
    },
    writing: {
      h: "Writing process",
      body: `Posts live under <code>src/content/blog</code> as Markdown or MDX. The frontmatter schema is defined in <code>src/content.config.ts</code> — I check there before adding a new field.`,
    },
    source: {
      h: "Source",
      bodyHtml: (sourceHref: string, email: string) =>
        `Curious about the source code? You can <a href="${sourceHref}">browse it here</a>. If you spot something broken, write me at <a href="mailto:${email}">${email}</a>.`,
    },
    thanks: {
      h: "Thanks",
      body: `To Astro, Cloudflare, and the countless open-source projects that make my life easier. This site rests on the freely-given work of all those people.`,
    },
  },
  rss: {
    title: "mert.gg — Writing",
    description: "Notes on Laravel and edge. What worked, what didn't.",
  },
};
