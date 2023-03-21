"use client";

import { ButtonHTMLAttributes } from "react";
import { cx } from "@ariakit/core/utils/misc";
import tw from "../../utils/tw.js";
import Moon from "../icons/moon.jsx";
import Sun from "../icons/sun.jsx";
import TooltipButton from "./tooltip-button.jsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

const style = tw`
  flex items-center justify-center
  h-10 w-10
  cursor-default
  border-none rounded-lg
  hover:bg-black/5 dark:hover:bg-white/5
  aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10
  [&:focus-visible]:ariakit-outline-input
`;

export default function HeaderThemeSwitch(props: Props) {
  return (
    <TooltipButton
      title={
        <>
          Switch to <span className="hidden dark:inline">light</span>
          <span className="dark:hidden">dark</span> mode
        </>
      }
      className={cx(style, props.className)}
      onClick={() => {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
          localStorage.setItem("theme", "light");
        } else {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        }
      }}
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </TooltipButton>
  );
}
