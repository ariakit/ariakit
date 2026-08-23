import * as Ariakit from "@ariakit/react";
import { Link, useLink } from "@ariakit/react-components/link/link";
import { useRef, useState } from "react";

const destinationAttributes = {
  href: "#destination-contract",
  itemProp: "url",
  target: "_blank",
  download: "contract.html",
  ping: "/analytics/link",
  rel: "next",
  hrefLang: "en",
  referrerPolicy: "no-referrer" as const,
  type: "text/html",
};

function getChapter(page: number) {
  if (page === 2) {
    return {
      eyebrow: "Field note 02",
      title: "A path through the cloud forest",
      description:
        "The trail rises past tree ferns and quiet pools before opening onto the ridge.",
    };
  }
  if (page === 3) {
    return {
      eyebrow: "Field note 03",
      title: "Where the river meets the basalt",
      description:
        "Black rock, silver water, and a final crossing before the road returns.",
    };
  }
  return {
    eyebrow: "Field note 01",
    title: "Before the valley wakes",
    description:
      "A native link keeps every browser gesture available while the next page exists.",
  };
}

export function ServerLinks() {
  return (
    <>
      <Link href="#server-enabled">Server-enabled link</Link>
      <Link {...destinationAttributes} disabled>
        Server-skipped link
      </Link>
      <Link {...destinationAttributes} disabled accessibleWhenDisabled>
        Server-reachable link
      </Link>
      <Link href="#conflicting-state" disabled aria-disabled={false}>
        Disabled wins conflicting ARIA
      </Link>
    </>
  );
}

export function WarningLinks() {
  return (
    <>
      <Link disabled render={<a href="#render-owned" />}>
        Render-owned destination
      </Link>
      <Link render={<div />}>Non-anchor action</Link>
    </>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const chapter = getChapter(page);
  const previousPage = page > 1 ? page - 1 : undefined;
  const nextPage = page < 3 ? page + 1 : undefined;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="relative min-h-80 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.38),transparent_42%),linear-gradient(145deg,#182039,#090d18_72%)] p-8 sm:p-10">
        <div className="absolute -right-16 -top-20 size-64 rounded-full border border-white/10" />
        <div className="absolute -right-4 top-8 size-28 rounded-full border border-white/10" />
        <div className="relative flex min-h-60 max-w-xl flex-col justify-end">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
            {chapter.eyebrow}
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {chapter.title}
          </h2>
          <p className="mt-4 max-w-lg text-pretty leading-7 text-slate-300">
            {chapter.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div aria-live="polite">
          <p className="text-sm font-medium text-white">Chapter {page} of 3</p>
          <p className="mt-1 text-xs text-slate-400">
            Disabled destinations disappear from the anchor.
          </p>
        </div>
        <nav aria-label="Field note pages" className="flex items-center gap-3">
          <Link
            href={previousPage ? `#chapter-${previousPage}` : undefined}
            disabled={!previousPage}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 aria-disabled:cursor-not-allowed aria-disabled:text-slate-500"
            onClick={() => {
              if (previousPage) {
                setPage(previousPage);
              }
            }}
          >
            <span aria-hidden="true">←</span>
            Previous page
          </Link>
          <Link
            href={nextPage ? `#chapter-${nextPage}` : "#chapter-4"}
            disabled={!nextPage}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-indigo-400 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 aria-disabled:bg-slate-800 aria-disabled:text-slate-500"
            onClick={() => {
              if (nextPage) {
                setPage(nextPage);
              }
            }}
          >
            Next page
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}

function DestinationAttributeDemo() {
  const [disabled, setDisabled] = useState(true);

  return (
    <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Destination attribute probe
        </h3>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
          Use the button to inspect omission and restoration without activating
          a download, ping, or new browsing context.
        </p>
        <Link
          {...destinationAttributes}
          disabled={disabled}
          tabIndex={-1}
          className="pointer-events-none mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-indigo-200 aria-disabled:text-slate-500"
        >
          Raw destination attribute probe
        </Link>
      </div>
      <button
        type="button"
        className="min-h-11 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        onClick={() => setDisabled((value) => !value)}
      >
        {disabled
          ? "Restore destination attributes"
          : "Withhold destination attributes"}
      </button>
    </div>
  );
}

function KeyboardDemo() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-300/10 text-lg text-emerald-200">
          ⌨
        </span>
        <div>
          <h2 className="font-semibold text-white">One deliberate tab stop</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Start here and press Tab. In Safari on macOS, use Option+Tab if Tab
            skips links and buttons. The ordinary disabled link is skipped,
            while the explainable link stays reachable.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="min-h-11 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-left text-sm font-medium text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        >
          Before links
        </button>
        <Link
          href="#unavailable-report"
          disabled
          className="flex min-h-20 flex-col justify-center rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-slate-500"
        >
          Skipped disabled link
          <span className="mt-1 text-xs">No keyboard stop</span>
        </Link>

        <Ariakit.TooltipProvider timeout={0}>
          <Ariakit.TooltipAnchor
            render={
              <Link
                href="#analytics"
                disabled
                accessibleWhenDisabled
                className="flex min-h-20 flex-col justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 text-sm font-medium text-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              />
            }
          >
            Reachable disabled link
            <span
              aria-hidden="true"
              className="mt-1 text-xs font-normal text-emerald-200/60"
            >
              Focus for the reason
            </span>
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip className="z-50 max-w-64 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-xl">
            Analytics unlocks after the first published report.
          </Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
        <button
          type="button"
          className="min-h-11 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-left text-sm font-medium text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        >
          After links
        </button>
      </div>
    </section>
  );
}

function StateTransitionDemo() {
  const [disabled, setDisabled] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-indigo-300/10 text-indigo-200">
          ↻
        </span>
        <div>
          <h2 className="font-semibold text-white">Stable through change</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Link owns the destination, so disabling it updates one anchor
            instead of remounting the element.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <Link
          ref={linkRef}
          href="#release-notes"
          disabled={disabled}
          accessibleWhenDisabled
          className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 aria-disabled:bg-slate-800 aria-disabled:text-slate-400"
        >
          Release notes
        </Link>
        <p className="mt-3 text-xs text-slate-400" aria-live="polite">
          {disabled
            ? "Destination withheld; focus remains on the same anchor."
            : "Destination available as a native link."}
        </p>
      </div>

      <button
        type="button"
        className="mt-4 min-h-11 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        onClick={() => {
          linkRef.current?.focus();
          setDisabled((value) => !value);
        }}
      >
        {disabled ? "Enable while focused" : "Disable while focused"}
      </button>
    </section>
  );
}

function CompositionDemo() {
  const enterpriseDisabled = true;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-300/10 text-amber-200">
          ◫
        </span>
        <div>
          <h2 className="font-semibold text-white">
            Composition keeps context
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Inside a menu, the outer component keeps its menu item role. Both
            owners receive the same disabled state so the store and link agree.
          </p>
        </div>
      </div>

      <Ariakit.MenuProvider>
        <Ariakit.MenuButton className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
          Workspace menu <span aria-hidden="true">•••</span>
        </Ariakit.MenuButton>
        <Ariakit.Menu
          gutter={8}
          className="z-50 min-w-64 rounded-2xl border border-white/10 bg-slate-900 p-2 text-sm text-white shadow-2xl outline-none"
        >
          <Ariakit.MenuItem className="flex min-h-10 cursor-default items-center rounded-xl px-3 data-active-item:bg-white/10">
            Overview
          </Ariakit.MenuItem>
          <Ariakit.MenuItem
            disabled={enterpriseDisabled}
            render={
              <Link
                href="#enterprise-settings"
                disabled={enterpriseDisabled}
                accessibleWhenDisabled
                className="flex min-h-10 cursor-default items-center justify-between rounded-xl px-3 text-slate-400 data-active-item:bg-white/10"
              />
            }
          >
            Enterprise settings <span aria-hidden="true">🔒</span>
          </Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Consumer ARIA parity
        </p>
        <Link
          href="#billing"
          aria-disabled="true"
          className="mt-3 inline-flex text-sm font-medium text-amber-100 underline decoration-amber-300/40 underline-offset-4"
        >
          Billing portal
        </Link>
      </div>
    </section>
  );
}

const contractLinkClass =
  "inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-200 underline decoration-white/20 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 aria-disabled:no-underline aria-disabled:text-slate-500";

function HookLink() {
  const props = useLink({
    href: "#contract-hook",
    className: contractLinkClass,
  });
  return <Ariakit.Role.a {...props}>Hook-generated anchor</Ariakit.Role.a>;
}

function ContractMatrix() {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
            Contract matrix
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            One anchor, every supported state
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">
          These small cases make the API edges available for direct inspection
          in browser developer tools.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="#contract-enabled" className={contractLinkClass}>
          Enabled native
        </Link>
        <Link href="#contract-disabled" disabled className={contractLinkClass}>
          Disabled skipped
        </Link>
        <Link
          href="#contract-reachable"
          disabled
          accessibleWhenDisabled
          className={contractLinkClass}
        >
          Disabled reachable
        </Link>
        <Link
          href="#contract-aria"
          aria-disabled="true"
          className={contractLinkClass}
        >
          ARIA-disabled
        </Link>
        <Link
          href="#contract-focusable-off"
          disabled
          focusable={false}
          className={contractLinkClass}
        >
          Focusable behavior off
        </Link>
        <Link className={contractLinkClass}>Placeholder anchor</Link>
        <Link
          href="#contract-composed"
          render={<a data-composed />}
          className={contractLinkClass}
        >
          Composed native anchor
        </Link>
        <Link
          href="#contract-function"
          render={(props) => <a {...props} data-function-render />}
          className={contractLinkClass}
        >
          Function-rendered anchor
        </Link>
        <HookLink />
      </div>
      <DestinationAttributeDemo />
    </section>
  );
}

export default function Example() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#070a12] px-4 py-12 text-slate-200 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_88%_76%,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-10 max-w-3xl sm:mb-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">
            <span aria-hidden="true">✦</span> Link API experiment
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            Native links, honest states.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
            Enabled links stay native. Disabled links lose their destinations
            without losing the semantics that people and assistive technology
            rely on.
          </p>
          <Link
            href="#field-notes"
            className="mt-6 inline-flex text-sm font-semibold text-indigo-200 underline decoration-indigo-300/40 underline-offset-4 hover:text-indigo-100"
          >
            Read field notes
          </Link>
        </header>

        <div id="field-notes">
          <PaginationDemo />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <KeyboardDemo />
          <StateTransitionDemo />
          <CompositionDemo />
        </div>

        <ContractMatrix />
      </div>
    </main>
  );
}
