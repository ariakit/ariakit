"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { useSafeLayoutEffect } from "@ariakit/react-core/utils/hooks";
import { Moon } from "icons/moon.js";
import { Sun } from "icons/sun.js";
import { twJoin } from "tailwind-merge";
import { Command } from "./command.jsx";
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

export function useDarkTheme() {
  const [darkMode, setDarkMode] = useState(false);

  useSafeLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    return onThemeSwitch((theme) => setDarkMode(theme === "dark"));
  }, []);

  return darkMode;
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
      className={twJoin("h-10 w-10 p-0", props.className)}
      render={<Command variant="secondary" flat />}
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
