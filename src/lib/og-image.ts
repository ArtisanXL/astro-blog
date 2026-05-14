/**
 * Per-post Open Graph image renderer.
 *
 * Satori turns a React-element-shaped tree (here built as plain objects so we
 * don't need a JSX runtime in `.ts` files) into an SVG. resvg rasterises the
 * SVG into a 1200×630 PNG suitable for og:image and twitter:image.
 *
 * Used by:
 *   - src/pages/[lang]/blog/[...slug]/og.png.ts   (per-post)
 *   - scripts/generate-og-default.mjs              (static fallback)
 */

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SITE } from "~/consts";
import { tagLabel } from "~/consts";
import { type Locale } from "~/i18n";

const require = createRequire(import.meta.url);

/** Lazy font cache — loaded once per build process, reused across posts.
 * Satori reads classic WOFF directly via opentype.js. Variable fonts have an
 * `fvar` table the bundled parser stumbles on, so the OG pipeline uses static
 * single-weight WOFFs (@fontsource/geist) rather than the variable build used
 * in the browser bundle. */
let _fonts: { name: string; data: Uint8Array; weight: number; style: "normal" }[] | null =
  null;

async function loadFonts() {
  if (_fonts) return _fonts;
  const geist500Path = require.resolve(
    "@fontsource/geist/files/geist-latin-500-normal.woff",
  );
  const geist600Path = require.resolve(
    "@fontsource/geist/files/geist-latin-600-normal.woff",
  );
  const geist700Path = require.resolve(
    "@fontsource/geist/files/geist-latin-700-normal.woff",
  );
  const monoPath = require.resolve(
    "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff",
  );
  const [g5, g6, g7, monoWoff] = await Promise.all([
    readFile(geist500Path),
    readFile(geist600Path),
    readFile(geist700Path),
    readFile(monoPath),
  ]);
  _fonts = [
    { name: "Geist", data: g5, weight: 500, style: "normal" },
    { name: "Geist", data: g6, weight: 600, style: "normal" },
    { name: "Geist", data: g7, weight: 700, style: "normal" },
    { name: "JetBrains Mono", data: monoWoff, weight: 600, style: "normal" },
  ];
  return _fonts;
}

const BRAND_ACCENT = SITE.themeColor; // #ff5c1f
const BG = "#0a0a0a";
const FG = "#f5f5f5";
const MUTED = "#9a9a9a";
const BORDER = "#1f1f1f";

export interface OgRenderInput {
  title: string;
  tags: string[];
  locale: Locale;
}

/** Picks a title font size that keeps the headline within 3 lines. */
function titleSize(title: string): number {
  const len = title.length;
  if (len <= 40) return 76;
  if (len <= 60) return 64;
  if (len <= 90) return 54;
  return 46;
}

/**
 * Compose the satori-shaped element tree. Satori only honours a flexbox
 * subset of CSS — every container needs `display: 'flex'`.
 */
function buildNode({ title, tags, locale }: OgRenderInput) {
  const fontSize = titleSize(title);

  const tagChip = (slug: string) => ({
    type: "div",
    props: {
      style: {
        display: "flex",
        padding: "8px 16px",
        borderRadius: 999,
        border: `1px solid ${BORDER}`,
        background: "#141414",
        fontFamily: "JetBrains Mono",
        fontSize: 22,
        color: MUTED,
        marginRight: 12,
      },
      children: tagLabel(slug, locale),
    },
  });

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: BG,
        color: FG,
        fontFamily: "Geist",
        padding: "64px 72px",
        position: "relative",
      },
      children: [
        // Top stripe accent
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 6,
              background: BRAND_ACCENT,
              display: "flex",
            },
          },
        },
        // Header row: brand mark + host, locale chip on the right
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 56,
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          background: BRAND_ACCENT,
                          color: "#ffffff",
                          fontFamily: "JetBrains Mono",
                          fontSize: 30,
                          fontWeight: 600,
                          marginRight: 18,
                        },
                        children: "m",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontFamily: "JetBrains Mono",
                          fontSize: 26,
                          color: FG,
                        },
                        children: [
                          { type: "span", props: { children: "mert" } },
                          {
                            type: "span",
                            props: { style: { color: MUTED }, children: ".gg" },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontFamily: "JetBrains Mono",
                    fontSize: 22,
                    color: MUTED,
                    letterSpacing: 2,
                  },
                  children: locale.toUpperCase(),
                },
              },
            ],
          },
        },
        // Title
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: FG,
              maxWidth: "100%",
              flexGrow: 1,
            },
            children: title,
          },
        },
        // Footer row: tags + author
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 56,
              paddingTop: 32,
              borderTop: `1px solid ${BORDER}`,
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex" },
                  children: tags.slice(0, 2).map((t) => tagChip(t)),
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 44,
                          height: 44,
                          borderRadius: 999,
                          border: `2px solid ${BRAND_ACCENT}`,
                          background: "#2a1409",
                          color: BRAND_ACCENT,
                          fontFamily: "JetBrains Mono",
                          fontWeight: 600,
                          fontSize: 18,
                          marginRight: 14,
                        },
                        children: SITE.author.initials,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", fontSize: 24, color: FG },
                        children: SITE.author.name,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * Render an OG image to PNG. Returns a Buffer suitable for an Astro
 * `Response`. Cached fonts mean per-post calls are cheap once warmed up.
 */
export async function renderOgPng(input: OgRenderInput): Promise<Buffer> {
  const fonts = await loadFonts();
  // Cast to `any` — satori's React types don't apply to our object form.
  const svg = await satori(buildNode(input) as any, {
    width: 1200,
    height: 630,
    fonts: fonts as any,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  return resvg.render().asPng();
}
