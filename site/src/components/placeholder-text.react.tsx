/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import clsx from "clsx";

export interface PlaceholderTextProps {
  children?: string;
  text?: string;
  layer?: string;
  weight?: "light" | "normal" | "medium" | "bold";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function PlaceholderText({
  children,
  text,
  layer,
  weight = "normal",
  size = "md",
  className,
}: PlaceholderTextProps) {
  const weightMap = {
    light: "ak-layer-pop",
    normal: "ak-layer-pop-2",
    medium: "ak-layer-pop-4",
    bold: "ak-layer-pop-6",
  };
  const sizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };
  return (
    <div
      aria-hidden
      className={clsx(
        layer ?? weightMap[weight],
        sizeMap[size],
        "!text-transparent !bg-transparent select-none px-2 ak-frame",
        className,
      )}
    >
      {(text ?? children)?.split("").map((char, index) => (
        <span
          key={index}
          className="bg-(--ak-layer) rounded-[inherit] px-2 -mx-2 text-[0.7em] tracking-[0.17em]"
        >
          {char}
        </span>
      ))}
    </div>
  );
}
