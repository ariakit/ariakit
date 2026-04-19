import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import { ArrowRight } from "@/icons/arrow-right.tsx";

export function Hero() {
  const linkClassName = twJoin(
    "relative inline-block",
    "before:transition-none before:animate-in before:zoom-in-0 before:duration-700 before:origin-left",
    "before:absolute before:top-full before:inset-x-0 before:[translate:0_-0.1em] before:h-[0.125em] before:rounded-sm",
    "before:bg-gradient-to-r before:from-blue-500 before:to-pink-600 before:dark:from-blue-400 before:dark:to-pink-500",
    "hover:before:h-[0.250em]",
  );
  return (
    <div className="grid justify-items-center gap-8 p-5 px-3 sm:px-4 md:gap-10 md:px-8">
      <div className="mt-6 grid w-full max-w-4xl justify-items-center gap-[inherit] sm:mt-10 md:mt-20">
        <h1 className="text-pretty text-center text-4xl font-medium tracking-[-0.035em] text-black sm:text-6xl sm:font-extrabold md:text-7xl dark:tracking-[-0.015em] dark:text-white sm:dark:font-bold">
          Build accessible web apps with React
        </h1>
        <p className="max-w-[720px] text-pretty text-center text-lg text-black/80 md:text-xl md:leading-8 lg:text-2xl lg:leading-9 dark:text-white/80">
          Open-source library with{" "}
          <Link href="/guide/styling" className={linkClassName}>
            unstyled
          </Link>
          ,{" "}
          <Link href="/guide/composition" className={linkClassName}>
            primitive
          </Link>{" "}
          components, with a collection of{" "}
          <Link href="/examples" className={linkClassName}>
            styled examples
          </Link>{" "}
          that you can copy and paste into your apps.
        </p>
      </div>
      <div className="mb-12 flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-4 md:mb-20">
        <Link
          href="/guide/getting-started"
          className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 font-medium text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline sm:px-8 sm:text-lg"
        >
          Get started
        </Link>
        <Link
          href="/components"
          className="group flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 hover:bg-gray-150 focus-visible:ariakit-outline-input dark:hover:bg-gray-700"
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
