import { Component } from "react";
import { PROJECT } from "../../lib/site.js";
import { track } from "../../lib/analytics.js";

/**
 * Ch. 87 — the last line of defence.
 *
 * A class component because only class components can implement
 * getDerivedStateFromError / componentDidCatch; there is no hook equivalent,
 * so this cannot be written as a function component.
 *
 * What it buys us: a render error anywhere below it produces a branded
 * recovery screen instead of React unmounting the tree and leaving a white
 * page — the single worst thing a luxury site can show.
 *
 * HOW TO WIRE IT (src/App.jsx / src/main.jsx are not this file's to edit):
 *
 *   import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
 *   …
 *   <ErrorBoundary resetKey={pathname}>{ …the routed page… }</ErrorBoundary>
 *
 * Wrapping <Routes> (rather than the whole app) keeps the navbar and footer
 * alive when a single page blows up. Passing the current pathname as
 * `resetKey` clears the error automatically on navigation, so a visitor is
 * never stuck on the recovery screen after moving to a working page.
 *
 * Deliberately plain: the fallback uses no router, no GSAP, no framer-motion
 * and no media components. It renders when something else has already failed,
 * so it depends on as little as possible — and it links with a real <a> rather
 * than <Link> so it still works if the boundary is ever mounted outside the
 * Router.
 *
 * Prerender safety: nothing here touches window, document or storage during
 * render; the handlers that do are only ever called from a click.
 */

/** Pull a printable message out of whatever was thrown, without ever throwing. */
function describe(error) {
  try {
    if (!error) return "Unknown error";
    if (typeof error === "string") return error;
    return String(error.message || error.toString?.() || "Unknown error");
  } catch {
    return "Unknown error";
  }
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // `seq` is used as the key on children: bumping it forces a full remount
    // of the failed subtree, so "Try again" genuinely retries rather than
    // re-rendering the same broken state.
    this.state = { error: null, info: null, seq: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Report it, but never let reporting be the thing that breaks. track()
    // is already a no-op when GA4 is unconfigured.
    try {
      track("app_error", {
        message: describe(error).slice(0, 300),
        page_path: typeof window !== "undefined" ? window.location.pathname : "",
        fatal: true,
      });
    } catch { /* swallow — a crash screen must not crash */ }

    if (import.meta.env.DEV) console.error("[ErrorBoundary]", error, info);
  }

  componentDidUpdate(prevProps) {
    // Clear automatically when the caller's reset key changes (e.g. the route).
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState((s) => ({ error: null, info: null, seq: s.seq + 1 }));
    }
  }

  handleRetry = () => {
    this.setState((s) => ({ error: null, info: null, seq: s.seq + 1 }));
  };

  handleReload = () => {
    try {
      window.location.reload();
    } catch { /* nothing more we can do from here */ }
  };

  render() {
    const { error, info, seq } = this.state;
    const { children } = this.props;

    if (!error) return <div key={seq}>{children}</div>;

    const isDev = Boolean(import.meta.env.DEV);
    const wa = `https://wa.me/${PROJECT.whatsapp}?text=${encodeURIComponent(
      `Hello — I hit an error on the ${PROJECT.name} website. Could you help?`,
    )}`;

    return (
      <section
        role="alert"
        className="relative flex min-h-[80vh] items-center overflow-hidden bg-canvas"
      >
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-brass/[0.07] blur-[130px]" />

        <div className="container-lux relative py-[clamp(4rem,12vh,7rem)]">

          <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(2.4rem,6.5vw,4.8rem)] font-light leading-[1] tracking-[-0.03em] text-ink">
            Something went <span className="font-serif italic text-brass">wrong.</span>
          </h1>

          <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            This part of the site failed to load. It is our fault, not yours, and nothing you
            entered has been sent anywhere. Trying again usually settles it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={this.handleRetry}
              className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
              <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                Try again
              </span>
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="mono rounded-full border border-line px-6 py-4 text-[0.66rem] tracking-[0.18em] text-ink-soft transition-colors hover:border-brass/50 hover:text-brass"
            >
              Reload the page
            </button>

            {/* plain anchor, not <Link>: works even outside the Router */}
            <a
              href="/"
              className="mono text-[0.66rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
            >
              Back to home
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6">
            <a
              href={`tel:${PROJECT.phone}`}
              className="mono text-[0.7rem] tracking-[0.18em] text-ink transition-colors hover:text-brass"
            >
              Call {PROJECT.phone}
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[0.7rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-brass"
            >
              WhatsApp the team
            </a>
          </div>

          {/* The actual error is shown to developers only — visitors get the
              branded message, never a stack trace. */}
          {isDev && (
            <pre className="mono mt-10 max-w-full overflow-x-auto whitespace-pre-wrap rounded-[1rem] border border-oxblood/40 bg-paper p-5 text-[0.66rem] normal-case leading-relaxed tracking-normal text-ink-soft">
              {describe(error)}
              {info?.componentStack ? `\n${info.componentStack}` : ""}
            </pre>
          )}
        </div>
      </section>
    );
  }
}
