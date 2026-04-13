---
title: "Astro.glob is gone. import.meta.glob is not a drop-in"
description: "The codemod replaces one with the other and your build keeps running. The build also takes twice as long, and the reason is a single missing option."
pubDate: 2026-04-13
tags: ["astro", "performans"]
translationKey: "astro-glob-gone"
---

Upgraded to Astro 6 on a quiet morning. Release notes flagged `Astro.glob` as removed, with `import.meta.glob` as the replacement. The codemod did most of the work. Build ran, site rendered. Closed the tab, moved on.

Two days later the deploy times had crept up. Build had been around 22 seconds cold and was sitting closer to 45. CI had stopped feeling responsive. Pushed a small content change, watched the build log, noticed "transforming 320 modules" was taking longer than I remembered.

The cause was one missing option in the replacement call.

`Astro.glob` returned a Promise that resolved to an array of fully-loaded modules. Eager. By the time you had the result, every matched file had been imported, evaluated, in memory:

```ts
const posts = await Astro.glob('./posts/*.md');
// posts[0] is a full module with frontmatter, default export
```

`import.meta.glob`, the Vite-native version, returns something different. By default it's a map of file paths to *loader functions*. Lazy. You have to call the loader to import the module:

```ts
const loaders = import.meta.glob('./posts/*.md');
// { './posts/a.md': () => import('./posts/a.md'), ... }
const posts = await Promise.all(Object.values(loaders).map(l => l()));
```

The codemod gave me something like:

```ts
const posts = Object.values(import.meta.glob('./posts/*.md', { eager: true }));
```

Which is correct. The eager flag makes it behave like `Astro.glob`: matched files get imported immediately, and the result is a map of paths to module objects.

What I'd done was hand-edit one call site because the codemod had choked on a dynamic glob pattern. The hand-edited version dropped `{ eager: true }`. Most of the code still worked because I was awaiting the result, and Vite was kind enough to let `await` chain through a map of loaders into resolved modules. The difference showed up at build time. Instead of resolving the imports once during transformation, Vite was generating async loader stubs for each file and importing them at runtime on every page that touched that glob. For a content collection with ~80 markdown files, that's a lot of round trips that don't need to happen.

The fix was adding `{ eager: true }` back. Build time dropped to about 25 seconds.

Second, less obvious difference: relative paths. `Astro.glob` had its own resolution logic that worked from anywhere in the project. `import.meta.glob` uses Vite's, which is per-file. Move a file that uses `import.meta.glob` and the glob may stop matching.

The fix shape for helpers: pass the glob result *in*, don't compute it inside the helper. Or use a project-root absolute path with `/`:

```ts
import.meta.glob('/src/content/posts/*.md', { eager: true });
```

The leading slash means project root. Works from any file.

Anyway. Codemods catch the syntactic part. The semantic part, whether the new API behaves the same at the same call sites, is on you. If your build feels slower after an upgrade, check `import.meta.glob` first. The codemod is right about the call site. It's not always right about the option.
