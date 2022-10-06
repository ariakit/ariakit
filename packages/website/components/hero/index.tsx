import { cx } from "ariakit-utils/misc";
import Link from "next/link";
import tw from "packages/website/utils/tw";
import ArrowRight from "../icons/arrow-right";
import shapes from "./shapes.svg";

export default function Hero() {
  return (
    <div
      style={{ backgroundImage: `url(${shapes.src})` }}
      className={cx(
        "bg-top bg-no-repeat",
        "flex flex-col items-center gap-8 p-5 px-3 sm:px-4 md:px-8"
      )}
    >
      <div
        className={cx(
          "mt-4 flex w-full max-w-5xl flex-col items-center gap-8 sm:mt-10 md:mt-20"
        )}
      >
        <h1
          className={cx(
            "text-center text-5xl sm:text-6xl md:text-7xl",
            "tracking-[-0.035em] dark:tracking-[-0.015em]",
            "font-extrabold text-transparent dark:font-bold",
            "bg-gradient-to-br bg-clip-text",
            "from-[hsl(175_100%_35%)] to-[hsl(204_100%_35%)]",
            "dark:from-[hsl(175_100%_60%)] dark:to-[hsl(204_100%_58%)]"
          )}
        >
          Build accessible web apps with React
        </h1>
        <p className="max-w-3xl text-center text-lg text-canvas-1/70 dark:text-canvas-1-dark/70">
          Ariakit is an open source library that provides lower-level React
          components and hooks for building accessible web apps, design systems,
          and component libraries.
        </p>
      </div>
      <div className="mb-20 flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/guide/getting-started">
          <a
            className={cx(
              "flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-8 text-lg",
              "text-primary-2 dark:text-primary-2-dark",
              "bg-primary-2 dark:bg-primary-2-dark",
              "hover:bg-primary-2-hover dark:hover:bg-primary-2-dark-hover",
              "shadow-xl focus-visible:ariakit-outline"
            )}
          >
            Get started
          </a>
        </Link>
        <Link href="/components">
          <a
            className={tw`
              group
              flex h-12 items-center justify-center
              gap-2 whitespace-nowrap rounded-lg
              px-6
              hover:bg-canvas-1 focus-visible:ariakit-outline-input
              dark:hover:bg-canvas-4-dark
            `}
          >
            Explore components{" "}
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </a>
        </Link>
      </div>
    </div>
  );
}
