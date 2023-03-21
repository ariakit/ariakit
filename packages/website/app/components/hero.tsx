import tw from "../../utils/tw.js";
import ArrowRight from "../icons/arrow-right.jsx";
import Link from "./link.js";

export default function Hero() {
  return (
    <div className="flex flex-col items-center gap-8 p-5 px-3 sm:px-4 md:px-8">
      <div className="mt-4 flex w-full max-w-5xl flex-col items-center gap-8 sm:mt-10 md:mt-20">
        <h1
          className={tw`
          bg-gradient-to-br from-[hsl(175_100%_35%)] to-[hsl(204_100%_35%)]
          bg-clip-text text-center text-5xl
          font-extrabold tracking-[-0.035em] text-transparent
          dark:from-[hsl(175_100%_60%)] dark:to-[hsl(204_100%_58%)]
          dark:font-bold dark:tracking-[-0.015em]
          sm:text-6xl md:text-7xl`}
        >
          Build accessible web apps with React
        </h1>
        <p className="max-w-3xl text-center text-lg text-black/70 dark:text-white/70">
          Ariakit is an open source library that provides lower-level React
          components and hooks for building accessible web apps, design systems,
          and component libraries.
        </p>
      </div>
      <div className="mb-20 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/guide/getting-started"
          className={tw`
          flex h-12 items-center justify-center gap-2 whitespace-nowrap
          rounded-lg bg-blue-600 px-8 text-lg text-white shadow-xl
          hover:bg-blue-800 focus-visible:ariakit-outline`}
        >
          Get started
        </Link>
        <Link
          href="/components"
          className={tw`
          group flex h-12 items-center justify-center
          gap-2 whitespace-nowrap rounded-lg px-6
          hover:bg-gray-150 focus-visible:ariakit-outline-input
          dark:hover:bg-gray-700`}
        >
          Explore components{" "}
          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
