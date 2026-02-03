/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Cloudflare bindings configured in wrangler.jsonc. Only relevant once you
 * add Worker code via `main`. Regenerate with `npm run cf-typegen` after
 * editing bindings in wrangler.jsonc.
 */
interface Env {
  ENVIRONMENT: string;
}
