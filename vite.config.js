import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Build configuration.
 *
 * Vite 8 bundles with Rolldown, not Rollup, so the chunking knob is
 * `build.rolldownOptions.output.codeSplitting` — `output.manualChunks` is
 * deprecated here and is ignored outright whenever `codeSplitting` is an
 * object. Copying a Rollup `manualChunks` recipe into this file would look
 * correct and do nothing, which is why the groups below use Rolldown's shape.
 */

/* Vendor groups, highest priority first.
 *
 * Path separators are written `[\\/]` rather than `/` so the regexes still
 * match if the site is ever built on Windows.
 *
 * WHY split at all: every one of these libraries is on a different release
 * cadence to our copy. Kept in one bundle, a one-line copy edit invalidates
 * 500 kB of gzipped JS for every returning visitor; split, it invalidates
 * only the app chunk. It also lets the browser parse the chunks in parallel
 * instead of blocking on a single 1.8 MB script.
 *
 * WHAT IT DOES NOT DO: because src/App.jsx imports all 30 pages eagerly,
 * every chunk below is a static import of the entry and is still fetched on
 * first paint. Splitting improves caching and parallelism — it does not
 * reduce first-load bytes. That needs React.lazy() on the routes, which
 * lives in App.jsx, not here.
 */
const VENDOR_GROUPS = [
  // The framework floor. Never changes between our deploys, so it earns the
  // longest-lived cache entry on the site.
  {
    name: 'react',
    test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
    priority: 50,
  },
  // Animation. gsap + @gsap/react are imported by ~57 files; split-type and
  // lenis are their constant companions and share the same churn profile.
  {
    name: 'gsap',
    test: /node_modules[\\/](gsap|@gsap[\\/]react|split-type|lenis)[\\/]/,
    priority: 40,
  },
  // framer-motion ships its own runtime (motion-dom / motion-utils).
  {
    name: 'motion',
    test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
    priority: 40,
  },
  // Leaflet is used by exactly one component (sections/LivingMap.jsx). Its own
  // chunk is the precondition for ever loading it lazily.
  {
    name: 'leaflet',
    test: /node_modules[\\/]leaflet[\\/]/,
    priority: 40,
  },
  // The brochure reader. pdfjs-dist + page-flip are import()ed lazily inside
  // ui/BrochureBook.jsx so only a visitor who opens the book pays for them —
  // ~400 kB raw of PDF/flip code. But the priority-10 catch-all below matches
  // node_modules too, and would fold both into the eager `vendor` chunk that
  // the entry modulepreloads, silently defeating the lazy boundary and
  // shipping pdfjs to every homepage visitor. A dedicated higher-priority
  // group keeps them as their own async chunks, fetched only on open.
  {
    name: 'brochure',
    test: /node_modules[\\/](pdfjs-dist|page-flip)[\\/]/,
    priority: 40,
  },
  // lucide-react is imported by ~44 files but is thousands of tiny icon
  // modules — isolating it keeps that noise out of the app chunk's hash.
  {
    name: 'icons',
    test: /node_modules[\\/]lucide-react[\\/]/,
    priority: 40,
  },
  // Everything else from node_modules.
  {
    name: 'vendor',
    test: /node_modules[\\/]/,
    priority: 10,
  },
]

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    /* Vite 8's default already targets Baseline Widely Available
       (Chrome 111+, Edge 111+, Firefox 114+, Safari 16.4+). Stated explicitly
       so it is a decision rather than an accident: this audience is heavily
       iOS, and 'esnext' would drop Safari 16 for a negligible byte saving. */
    target: 'baseline-widely-available',

    /* One stylesheet per entry rather than one for the whole app. Today the
       app has a single entry and no dynamic imports, so this emits one CSS
       file either way — it starts paying the moment a route is lazy-loaded. */
    cssCodeSplit: true,

    /* 4 kB. Anything smaller costs more as a request than as base64; anything
       larger would be inlined into the render-blocking stylesheet, which is
       exactly the wrong place for it. The woff2 files are 33–85 kB and so are
       always emitted as separate, individually cacheable files. */
    assetsInlineLimit: 4096,

    /* Deliberately left at Vite's default rather than raised to silence the
       warning. The app chunk is still over this line and should keep saying
       so until the routes are code-split. */
    chunkSizeWarningLimit: 500,

    /* modulepreload is native in every browser in the target above, so the
       polyfill is dead weight in the entry chunk. */
    modulePreload: { polyfill: false },

    rolldownOptions: {
      output: {
        codeSplitting: { groups: VENDOR_GROUPS },
      },
    },
  },
})
