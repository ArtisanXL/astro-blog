/// <reference types="astro/client" />

/* CSS-only `@fontsource` packages ship no TypeScript types, but Vite is fine
   with the side-effect import. Tell TS the modules exist. */
declare module "@fontsource-variable/*";
declare module "@fontsource/*";
