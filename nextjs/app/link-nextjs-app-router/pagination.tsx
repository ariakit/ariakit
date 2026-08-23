"use client";

import { Link } from "@ariakit/react-components/link/link";
import type { LinkProps } from "@ariakit/react-components/link/link";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type PageNumber = 1 | 2 | 3;

const dispatches = [
  {
    page: 1,
    eyebrow: "Dispatch 01 · Server boundary",
    title: "The observatory at first light",
    description:
      "The first route arrives as complete HTML, including its destination-free previous link.",
    signal: "Morning signal",
  },
  {
    page: 2,
    eyebrow: "Dispatch 02 · Open channel",
    title: "A signal across the plateau",
    description:
      "Both directions are active Next.js links, while Ariakit keeps the native anchor contract.",
    signal: "Midday signal",
  },
  {
    page: 3,
    eyebrow: "Dispatch 03 · Route edge",
    title: "The last transmission",
    description:
      "At the boundary, the framework link gives way to a plain anchor with no destination.",
    signal: "Evening signal",
  },
] as const;

const pagePaths = {
  1: "/link-nextjs-app-router",
  2: "/link-nextjs-app-router/2",
  3: "/link-nextjs-app-router/3",
} as const;

const pageLinkClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 aria-disabled:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:text-white/35";

interface AppLinkProps extends Omit<LinkProps, "href" | "render"> {
  href: ComponentPropsWithoutRef<typeof NextLink>["href"];
  prefetch?: ComponentPropsWithoutRef<typeof NextLink>["prefetch"];
}

function AppLink({
  href,
  prefetch,
  disabled,
  "aria-disabled": ariaDisabled,
  focusable,
  accessibleWhenDisabled = true,
  ...props
}: AppLinkProps) {
  const linkDisabled =
    focusable !== false &&
    (disabled || ariaDisabled === true || ariaDisabled === "true");

  return (
    <Link
      {...props}
      disabled={disabled}
      aria-disabled={ariaDisabled}
      focusable={focusable}
      accessibleWhenDisabled={accessibleWhenDisabled}
      render={
        linkDisabled ? <a /> : <NextLink href={href} prefetch={prefetch} />
      }
    />
  );
}

function getPreviousPage(page: PageNumber): PageNumber {
  if (page === 3) return 2;
  return 1;
}

function getNextPage(page: PageNumber): PageNumber {
  if (page === 1) return 2;
  return 3;
}

interface PaginationProps {
  page: PageNumber;
}

export function Pagination({ page }: PaginationProps) {
  const dispatch =
    dispatches.find((entry) => entry.page === page) ?? dispatches[0];
  const previousPage = getPreviousPage(page);
  const nextPage = getNextPage(page);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0f0b12] px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(244,63,94,0.22),transparent_32%),radial-gradient(circle_at_86%_80%,rgba(251,146,60,0.14),transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-300">
            Next.js App Router
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Server-correct links, with a visible router trade-off.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/55 sm:text-lg">
            Enabled controls use Next Link. At a disabled boundary, the render
            prop swaps it for a destination-free anchor in the server HTML.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)]">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="relative min-h-80 overflow-hidden bg-[linear-gradient(145deg,#4c0519,#18181b_72%)] p-8 sm:p-10">
              <div className="absolute -right-20 -top-24 size-72 rounded-full border border-rose-200/20" />
              <div className="absolute right-12 top-10 size-24 rounded-full bg-orange-300/20 blur-md" />
              <div className="relative flex min-h-60 flex-col justify-end">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200">
                  {dispatch.eyebrow}
                </p>
                <h2 className="mt-3 max-w-xl text-balance text-3xl font-semibold sm:text-4xl">
                  {dispatch.title}
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-white/60">
                  {dispatch.description}
                </p>
                <p className="mt-7 w-fit rounded-full border border-orange-200/15 bg-orange-200/10 px-3 py-1 text-xs font-semibold text-orange-100">
                  {dispatch.signal}
                </p>
              </div>
            </div>

            <nav
              aria-label="Transmission pages"
              className="grid gap-3 p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-8"
            >
              <AppLink
                href={pagePaths[previousPage]}
                disabled={page === 1}
                className={pageLinkClassName}
              >
                <span aria-hidden="true">←</span> Previous dispatch
              </AppLink>
              <p className="text-center text-sm text-white/45">
                <span className="block font-semibold text-white">
                  Page {page} of {dispatches.length}
                </span>
                <span className="mt-1 block text-xs">Server-served route</span>
              </p>
              <AppLink
                href={pagePaths[nextPage]}
                disabled={page === 3}
                className={pageLinkClassName}
              >
                Next dispatch <span aria-hidden="true">→</span>
              </AppLink>
            </nav>
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-[2rem] border border-rose-300/15 bg-rose-300/[0.07] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
                Conditional recipe
              </p>
              <h2 className="mt-3 text-xl font-semibold">
                Correct HTML, unstable focus.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                The safe disabled branch has no router-owned href. The cost is a
                remount when the render element changes between a and Next Link,
                so focus can be lost at the boundary.
              </p>
              <div className="mt-5 rounded-xl bg-black/20 px-4 py-3 font-mono text-xs leading-6 text-rose-100/70">
                disabled ? &lt;a /&gt; : &lt;NextLink /&gt;
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                Adapter state parity
              </p>
              <p className="mt-3 text-sm leading-6 text-white/55">
                The adapter resolves every Link disabled state before it chooses
                the framework element. Disable JavaScript and these contracts
                remain visible in fresh server HTML.
              </p>
              <div className="mt-5 flex flex-col items-start gap-3 text-sm">
                <AppLink
                  href={pagePaths[2]}
                  aria-disabled="true"
                  className="font-semibold text-orange-100 underline decoration-orange-300/30 underline-offset-4 aria-disabled:no-underline aria-disabled:text-white/35"
                >
                  ARIA-disabled adapter
                </AppLink>
                <AppLink
                  href={pagePaths[2]}
                  disabled
                  accessibleWhenDisabled={false}
                  className="font-semibold text-orange-100 underline decoration-orange-300/30 underline-offset-4 aria-disabled:no-underline aria-disabled:text-white/35"
                >
                  Skipped disabled adapter
                </AppLink>
                <AppLink
                  href={pagePaths[2]}
                  disabled
                  focusable={false}
                  prefetch={false}
                  className="font-semibold text-orange-100 underline decoration-orange-300/30 underline-offset-4"
                >
                  Disabled handling off
                </AppLink>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
