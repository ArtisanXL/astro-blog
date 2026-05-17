#!/usr/bin/env node
/**
 * IndexNow ping — submits all URLs from dist/sitemap-0.xml to Bing + Yandex.
 * Run after every build: npm run indexnow
 * Or chain with build: npm run build:deploy
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

const HOST = "mert.gg";
const KEY = "fabe9483060aba4001aae47eb2121d6d";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function extractUrls(xmlPath) {
  let xml;
  try {
    xml = readFileSync(xmlPath, "utf8");
  } catch {
    return [];
  }
  const urls = [];
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    urls.push(match[1].trim());
  }
  return urls;
}

async function pingIndexNow(urlList) {
  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  return res.status;
}

const sitemapPath = join(ROOT, "dist", "sitemap-0.xml");
const urls = extractUrls(sitemapPath);

if (urls.length === 0) {
  console.error("No URLs found in dist/sitemap-0.xml. Did you run npm run build first?");
  process.exit(1);
}

console.log(`IndexNow: submitting ${urls.length} URLs from sitemap…`);
const status = await pingIndexNow(urls);
if (status === 200 || status === 202) {
  console.log(`IndexNow: OK (${status}). Bing + Yandex queued.`);
} else {
  console.error(`IndexNow: unexpected status ${status}.`);
  process.exit(1);
}
