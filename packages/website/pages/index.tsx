import React from "react";
import { cx } from "ariakit-utils/misc";
import Link from "next/link";
import shapes from "../components/home-shapes.svg";

export default function Home() {
  return (
    <div
      style={{ backgroundImage: `url(${shapes.src})` }}
      className={cx(
        "bg-no-repeat bg-top",
        "flex px-3 sm:px-4 md:px-8 flex-col items-center gap-8 p-5"
      )}
    >
      <div
        className={cx(
          "flex flex-col items-center gap-8 w-full max-w-5xl mt-4 sm:mt-10 md:mt-20"
        )}
      >
        <h1
          className={cx(
            "text-center text-5xl sm:text-6xl md:text-7xl",
            "tracking-[-0.035em] dark:tracking-[-0.015em]",
            "font-extrabold dark:font-bold"
          )}
        >
          Build accessible web apps with React
        </h1>
        <p className="max-w-3xl text-center text-lg opacity-75">
          Ariakit is an open source library that provides lower-level React
          components and hooks for building accessible web apps, design systems,
          and other component libraries.
        </p>
      </div>
      <div className="flex gap-8 mb-20 items-center">
        <Link href="/guide/get-started">
          <a
            className={cx(
              "flex gap-2 h-12 items-center whitespace-nowrap justify-center text-lg px-4 rounded-lg",
              "text-primary-2 dark:text-primary-2-dark",
              "bg-primary-2 dark:bg-primary-2-dark",
              "hover:bg-primary-2-hover dark:hover:bg-primary-2-dark-hover"
            )}
          >
            Get Started
            <svg
              aria-hidden
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </Link>
        <Link href="/components">Explore components</Link>
      </div>
    </div>
  );
}
