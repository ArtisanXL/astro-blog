#!/usr/bin/env node
/**
 * Generate `public/og-default.png` — the static OG fallback for any page
 * that isn't a blog post (home, blog index, tags, about, cv, colophon, 404).
 *
 * Run manually after brand / copy changes:
 *   node scripts/generate-og-default.mjs
 *
 * Per-post OG images are generated automatically at build time by
 * `src/pages/[lang]/blog/[...slug]/og.png.ts` and shipped into `dist/`.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const publicDir = resolve(__dirname, "..", "public");

const geist600Path = require.resolve(
  "@fontsource/geist/files/geist-latin-600-normal.woff",
);
const geist700Path = require.resolve(
  "@fontsource/geist/files/geist-latin-700-normal.woff",
);
const monoPath = require.resolve(
  "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff",
);
const [geist600, geist700, mono] = await Promise.all([
  readFile(geist600Path),
  readFile(geist700Path),
  readFile(monoPath),
]);

const ACCENT = "#ff5c1f";
const BG = "#0a0a0a";
const FG = "#f5f5f5";
const MUTED = "#9a9a9a";
const BORDER = "#1f1f1f";

const node = {
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
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 6,
            background: ACCENT,
            display: "flex",
          },
        },
      },
      {
        type: "div",
        props: {
          style: { display: "flex", alignItems: "center", marginBottom: 80 },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: ACCENT,
                  color: "#fff",
                  fontFamily: "JetBrains Mono",
                  fontSize: 36,
                  fontWeight: 600,
                  marginRight: 22,
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
                  fontSize: 32,
                  color: FG,
                },
                children: [
                  { type: "span", props: { children: "mert" } },
                  { type: "span", props: { style: { color: MUTED }, children: ".gg" } },
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
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 76,
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: -2,
                  color: FG,
                  marginBottom: 24,
                  maxWidth: 900,
                },
                children: "Notes on Laravel and the edge.",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 30,
                  color: MUTED,
                  lineHeight: 1.4,
                  maxWidth: 900,
                },
                children: "Mertcan Dinler — what worked, what didn't, with concrete numbers.",
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
            alignItems: "center",
            paddingTop: 32,
            borderTop: `1px solid ${BORDER}`,
            fontFamily: "JetBrains Mono",
            fontSize: 22,
            color: MUTED,
          },
          children: "Laravel · PHP · Cloudflare Workers · D1 · Queues",
        },
      },
    ],
  },
};

const fonts = [
  { name: "Geist", data: geist600, weight: 600, style: "normal" },
  { name: "Geist", data: geist700, weight: 700, style: "normal" },
  { name: "JetBrains Mono", data: mono, weight: 600, style: "normal" },
];

const svg = await satori(node, { width: 1200, height: 630, fonts });
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
await writeFile(resolve(publicDir, "og-default.png"), png);
console.log(`✓ og-default.png (1200×630, ${png.length} bytes)`);
