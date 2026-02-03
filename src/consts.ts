/**
 * Single source of truth for site-wide metadata.
 * Edit these values to brand your blog.
 */
export const SITE = {
  url: "https://example.com",
  title: "ArtisanXL — Notes from the edge",
  description:
    "A fast, edge-native personal blog on engineering, performance, and the craft of shipping software.",
  author: {
    name: "ArtisanXL",
    email: "hello@example.com",
    twitter: "@artisanxl",
    github: "artisanxl",
    bio: "Software engineer writing about edge computing, web performance, and developer experience.",
    avatar: "/avatar.svg",
  },
  locale: "en",
  language: "en-US",
  themeColor: "#0ea5e9",
  ogImage: "/og-default.svg",
  postsPerPage: 10,
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/tags", label: "Tags" },
    { href: "/about", label: "About" },
    { href: "/search", label: "Search" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com/artisanxl" },
    { label: "Twitter", href: "https://twitter.com/artisanxl" },
    { label: "RSS", href: "/rss.xml" },
  ],
} as const;

export type SiteConfig = typeof SITE;
