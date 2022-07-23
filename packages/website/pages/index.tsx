import React from "react";
import { cx } from "ariakit-utils/misc";
import { Button } from "ariakit/button";
import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  useMenuState,
} from "ariakit/menu";
import Link from "next/link";
import shapes from "../components/home-shapes.svg";

export default function Home() {
  const menu = useMenuState({ defaultOpen: true, gutter: 4, flip: false });
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
          "flex flex-col items-center gap-8 w-full max-w-5xl mt-4 sm:mt-10 md:mt-16"
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
      <div
        className={cx(
          "w-full max-w-7xl grid grid-cols-8 grid-rows-[repeat(9,80px)] gap-4",
          "[&>*]:bg-canvas-1 dark:[&>*]:bg-canvas-1-dark [&>*]:rounded-xl",
          "[&>*]:flex [&>*]:items-center [&>*]:justify-center"
        )}
      >
        <div className="[grid-area:1/1/4/3] py-14 px-20 !justify-start">
          <MenuButton
            state={menu}
            className="flex self-start h-8 text-sm items-center cursor-pointer gap-1 whitespace-nowrap justify-center border-none bg-primary-1 dark:bg-primary-1-dark px-3 rounded-md"
          >
            Actions <MenuButtonArrow />
          </MenuButton>
          <Menu
            state={menu}
            hideOnInteractOutside={false}
            className="flex flex-col min-w-[140px] bg-canvas-2 dark:bg-canvas-3-dark p-2 rounded-md border border-solid border-canvas-2 dark:border-canvas-2-dark shadow-md dark:shadow-md-dark [&>*]:p-2 [&>*]:text-sm"
          >
            <MenuItem>Edit</MenuItem>
            <MenuItem>Share</MenuItem>
            <MenuItem>Delete</MenuItem>
          </Menu>
        </div>
        <div className="[grid-area:1/3/4/5]"></div>
        <div className="[grid-area:1/5/4/9]"></div>
        <div className="[grid-area:4/1/6/3]">
          <Button className="text-sm h-7 rounded bg-primary-2 dark:bg-primary-2 px-2">
            Button
          </Button>
        </div>
        <div className="[grid-area:6/1/10/3]"></div>
        <div className="[grid-area:4/3/7/7]"></div>
        <div className="[grid-area:7/3/10/5]"></div>
        <div className="[grid-area:7/5/10/7]"></div>
        <div className="[grid-area:4/7/7/9]"></div>
        <div className="[grid-area:7/7/10/9]"></div>
      </div>
    </div>
  );
}
