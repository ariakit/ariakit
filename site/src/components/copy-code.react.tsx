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
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Icon } from "../icons/icon.react.tsx";
import { Tooltip } from "./tooltip.react.tsx";

interface CopyCodeProps extends ComponentProps<"button"> {
  text: string;
  label?: string;
  title?: string;
}

export function CopyCode({
  text,
  children,
  label = "Copy code",
  title = label,
  ...props
}: CopyCodeProps) {
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");

  useEffect(() => {
    if (state !== "copied") return;
    const timeout = setTimeout(() => setState("idle"), 1500);
    return () => clearTimeout(timeout);
  }, [state]);

  // Reset state when text changes
  useEffect(() => {
    setState("idle");
  }, [text]);

  return (
    <Tooltip
      title={state === "idle" ? title : "Copied"}
      placement="left"
      className="not-data-open:transition-none"
    >
      <button
        {...props}
        className={clsx(
          "ak-button ak-button-square ak-layer-pop size-9 ak-border",
          props.className,
        )}
        onClick={async (event) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
          if (state !== "idle") return;
          await navigator.clipboard.writeText(text);
          setState("copied");
        }}
      >
        {state === "copied" ? (
          <Icon
            key="check"
            name="check"
            strokeWidth={1.5}
            className="[stroke-dasharray:1em] starting:[stroke-dashoffset:1em] [stroke-dashoffset:0] transition-[stroke-dashoffset] duration-350"
          />
        ) : (
          <Icon key="copy" name="copy" />
        )}
        <span className="sr-only">{label}</span>
      </button>
    </Tooltip>
  );
}
