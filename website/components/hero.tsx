import { ArrowRight } from "icons/arrow-right.js";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";

export function Hero() {
  const linkClassName = twJoin(
    "relative inline-block",
    "before:transition-none before:animate-in before:zoom-in-0 before:duration-700 before:origin-left",
    "before:absolute before:top-full before:inset-x-0 before:[translate:0_-0.1em] before:h-[0.125em] before:rounded-sm",
    "before:bg-gradient-to-r before:from-blue-500 before:to-pink-600 before:dark:from-blue-400 before:dark:to-pink-500",
    "hover:before:h-[0.250em]",
  );
  return (
    <div className="flex flex-col items-center gap-10 p-5 px-3 sm:px-4 md:px-8">
      <div className="mt-4 flex w-full max-w-4xl flex-col items-center gap-[inherit] sm:mt-10 md:mt-20">
        <h1 className="text-pretty bg-gradient-to-br from-[hsl(175,100%,35%)] to-[hsl(204,100%,35%)] bg-clip-text text-center text-5xl font-extrabold tracking-[-0.035em] text-transparent dark:from-[hsl(175,100%,60%)] dark:to-[hsl(204,100%,58%)] dark:font-bold dark:tracking-[-0.015em] sm:text-6xl md:text-7xl">
          Build accessible web apps with React
        </h1>
        <p className="max-w-[720px] text-pretty text-center text-lg text-black/80 dark:text-white/80 sm:text-xl sm:leading-8 md:text-2xl md:leading-9">
          Open-source library with{" "}
          <Link href="/guide/styling" className={linkClassName}>
            unstyled
          </Link>
          ,{" "}
          <Link href="/guide/composition" className={linkClassName}>
            primitive
          </Link>{" "}
          components, along with a collection of{" "}
          <Link href="/examples" className={linkClassName}>
            styled examples
          </Link>{" "}
          that you can copy and paste into your apps.
        </p>
      </div>
      <div className="mb-20 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/guide/getting-started"
          className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-8 text-lg font-medium text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline"
        >
          Get started
        </Link>
        <Link
          href="/components"
          className="group flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 hover:bg-gray-150 focus-visible:ariakit-outline-input dark:hover:bg-gray-700"
        >
          Explore components{" "}
          <ArrowRight
            strokeWidth={2}
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
