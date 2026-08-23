import { Link as AriakitLink } from "@ariakit/react-components/link/link";
import type { LinkProps as AriakitLinkProps } from "@ariakit/react-components/link/link";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { MouseEventHandler } from "react";
import {
  HashRouter,
  useHref,
  useLinkClickHandler,
  useLocation,
  useNavigate,
} from "react-router-dom";

interface RouterLinkProps extends Omit<AriakitLinkProps, "href"> {
  to: string;
}

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink({ to, onClick, target, ...props }, ref) {
    const href = useHref(to);
    const handleClick = useLinkClickHandler(to, { target });
    const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleClick(event);
    };

    return (
      <AriakitLink
        ref={ref}
        {...props}
        href={href}
        target={target}
        onClick={handleLinkClick}
      />
    );
  },
);

const entries = [
  {
    eyebrow: "Entry one · Atlantic edge",
    title: "The lighthouse after rain",
    description:
      "Salt hangs in the air while the final cloud bank moves beyond the headland.",
    readingTime: "4 minute read",
  },
  {
    eyebrow: "Entry two · Inland road",
    title: "A market under striped awnings",
    description:
      "Peaches, paper maps, and a narrow street that keeps turning toward the hills.",
    readingTime: "6 minute read",
  },
  {
    eyebrow: "Entry three · Night train",
    title: "Last light from the dining car",
    description:
      "Fields become silhouettes as the carriage settles into its evening rhythm.",
    readingTime: "5 minute read",
  },
];

const pageLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-stone-900/10 bg-white/70 px-3 text-sm font-semibold text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 aria-disabled:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:bg-stone-200/60 aria-disabled:text-stone-400 aria-disabled:shadow-none sm:px-5";

function RouteJournal() {
  const location = useLocation();
  const navigate = useNavigate();
  const previousRef = useRef<HTMLAnchorElement>(null);
  const [guardMessage, setGuardMessage] = useState(
    "No navigation was intercepted.",
  );
  const routePage = Number(location.pathname.match(/\d+$/)?.[0] || 1);
  const page = Math.min(Math.max(routePage, 1), entries.length);
  const entry = entries[page - 1];
  if (!entry) {
    throw new Error(`Journal entry ${page} was not found`);
  }
  const previousPage = page > 1 ? page - 1 : undefined;
  const nextPage = page < entries.length ? page + 1 : undefined;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#efe9dc] px-4 py-10 text-stone-900 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#7c5b3e_0.7px,transparent_0.7px)] [background-size:14px_14px]" />
      <div className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-stone-900/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-800">
              React Router field journal
            </p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-none tracking-tight sm:text-6xl">
              A route can change without replacing its anchor.
            </h1>
          </div>
          <output
            aria-label="Current route"
            className="w-fit rounded-full border border-stone-900/10 bg-white/50 px-4 py-2 font-mono text-xs text-stone-600"
          >
            {location.pathname}
          </output>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
          <article className="overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[#fbf8f1] shadow-2xl shadow-stone-900/10">
            <div className="relative min-h-80 overflow-hidden bg-[linear-gradient(145deg,#292524,#7c2d12)] p-8 text-white sm:p-10">
              <div className="absolute -right-16 -top-16 size-64 rounded-full border border-white/15" />
              <div className="absolute right-10 top-12 size-24 rounded-full bg-orange-200/20 blur-sm" />
              <div className="relative flex min-h-60 max-w-xl flex-col justify-end">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-200">
                  {entry.eyebrow}
                </p>
                <h2 className="mt-3 text-balance font-serif text-4xl leading-tight">
                  {entry.title}
                </h2>
                <p className="mt-4 max-w-lg text-pretty leading-7 text-stone-200">
                  {entry.description}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                <span>
                  Page {page} of {entries.length}
                </span>
                <span>{entry.readingTime}</span>
              </div>
              <nav
                aria-label="Journal pages"
                className="grid grid-cols-2 gap-3"
              >
                <RouterLink
                  ref={previousRef}
                  to={`/page/${previousPage || 1}`}
                  disabled={!previousPage}
                  accessibleWhenDisabled
                  className={pageLinkClass}
                >
                  <span aria-hidden="true">←</span> Previous entry
                </RouterLink>
                <RouterLink
                  to={`/page/${nextPage || entries.length}`}
                  disabled={!nextPage}
                  className={pageLinkClass}
                >
                  Next entry <span aria-hidden="true">→</span>
                </RouterLink>
              </nav>
            </div>
          </article>

          <aside className="flex flex-col gap-6">
            <section className="rounded-[2rem] bg-stone-900 p-6 text-stone-100 shadow-xl shadow-stone-900/10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                Stable node check
              </p>
              <h2 className="mt-3 text-xl font-semibold">
                Move the route while focus stays put.
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                The router supplies a changing href to Ariakit. Link owns that
                href, so one native anchor survives the state transition.
              </p>
              <button
                type="button"
                className="mt-5 min-h-11 w-full rounded-xl bg-orange-300 px-4 text-sm font-bold text-stone-950 transition hover:bg-orange-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
                onClick={() => {
                  previousRef.current?.focus();
                  navigate(page === 1 ? "/page/2" : "/page/1");
                }}
              >
                Move route with previous focused
              </button>
            </section>

            <section className="rounded-[2rem] border border-stone-900/10 bg-white/55 p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-800">
                Consumer control
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                The adapter calls the consumer first and respects a prevented
                event before it hands navigation to React Router.
              </p>
              <RouterLink
                to="/page/3"
                className="mt-5 inline-flex min-h-11 items-center rounded-full border border-stone-900/15 px-4 text-sm font-semibold underline decoration-orange-700/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                onClick={(event) => {
                  event.preventDefault();
                  setGuardMessage("The consumer kept this route in place.");
                }}
              >
                Try guarded navigation
              </RouterLink>
              <output
                aria-label="Navigation guard"
                className="mt-4 block rounded-xl bg-stone-900/5 px-3 py-2 text-xs text-stone-600"
              >
                {guardMessage}
              </output>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function Example() {
  const [mounted, setMounted] = useState(false);
  // HashRouter reads document while it creates its history, so wait until the
  // Astro preview is mounted in the browser.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#efe9dc] text-sm font-semibold text-stone-600">
        Preparing the route journal…
      </main>
    );
  }

  return (
    <HashRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <RouteJournal />
    </HashRouter>
  );
}
