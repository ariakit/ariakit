"use client";

import type { ButtonHTMLAttributes } from "react";
import { Moon } from "icons/moon.js";
import { Sun } from "icons/sun.js";
import { twJoin } from "tailwind-merge";
import { TooltipButton } from "./tooltip-button.js";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;
type Theme = "light" | "dark";

const EVENT_NAME = "themechange";

function dispatchChange(theme: Theme) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: theme }));
}

export function onThemeSwitch(callback: (theme: Theme) => void) {
  const onSwitch = (event: Event) => {
    callback((event as CustomEvent<Theme>).detail);
  };
  window.addEventListener(EVENT_NAME, onSwitch);
  return () => {
    window.removeEventListener(EVENT_NAME, onSwitch);
  };
}

export function HeaderThemeSwitch(props: Props) {
  return (
    <TooltipButton
      fixed
      title={
        <>
          Switch to <span className="hidden dark:inline">light</span>
          <span className="dark:hidden">dark</span> mode
        </>
      }
      className={twJoin(
        "flex h-10 w-10 flex-none cursor-default items-center justify-center",
        "rounded-lg border-none hover:bg-black/5 aria-expanded:bg-black/10",
        "dark:hover:bg-white/5 dark:aria-expanded:bg-white/10",
        "[&:focus-visible]:ariakit-outline-input",
        props.className
      )}
      onClick={() => {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
          localStorage.setItem("theme", "light");
          dispatchChange("light");
        } else {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
          dispatchChange("dark");
        }
      }}
    >
      <span className="sr-only">Switch theme</span>
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </TooltipButton>
  );
}
