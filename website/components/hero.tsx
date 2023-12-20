import { ArrowRight } from "icons/arrow-right.js";
import Link from "next/link.js";
import { InlineLink } from "./inline-link.jsx";

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-8 p-5 px-3 sm:px-4 md:px-8">
      <div className="mt-4 flex w-full max-w-4xl flex-col items-center gap-8 sm:mt-10 md:mt-20">
        <h1 className="bg-gradient-to-br from-[hsl(175_100%_35%)] to-[hsl(204_100%_35%)] bg-clip-text text-center text-5xl font-extrabold tracking-[-0.035em] text-transparent sm:text-6xl md:text-7xl dark:from-[hsl(175_100%_60%)] dark:to-[hsl(204_100%_58%)] dark:font-bold dark:tracking-[-0.015em]">
          Build accessible web apps with React
        </h1>
        <p className="max-w-[720px] text-center text-lg text-black/70 dark:text-white/70">
          Ariakit is an open-source library that provides{" "}
          <InlineLink render={<Link href="/guide/styling" />}>
            unstyled
          </InlineLink>
          ,{" "}
          <InlineLink render={<Link href="/guide/composition" />}>
            primitive
          </InlineLink>{" "}
          components for building accessible web apps, design systems, and
          component libraries.
        </p>
      </div>
      <div className="mb-20 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/guide/getting-started"
          className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-8 text-lg text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline"
        >
          Get started
        </Link>
        <Link
          href="/components"
          className="group flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 hover:bg-gray-150 focus-visible:ariakit-outline-input dark:hover:bg-gray-700"
        >
          Explore components{" "}
          <ArrowRight
            strokeWidth={3}
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
