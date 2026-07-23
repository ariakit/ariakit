/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ButtonProps } from "@ariakit/ui/ariakit/button.react.tsx";
import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "../icons/icon.react.tsx";
import { Tooltip } from "./tooltip.react.tsx";

interface CopyCodeProps extends ButtonProps {
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
  const [state, setState] = useState<"idle" | "copied">("idle");

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
      <Button
        {...props}
        // Square icon button: pin the size and drop the field padding like
        // the legacy square button. The pinned height defeats the button's
        // line-box centering, so center the icon explicitly.
        $p="none"
        className={clsx("size-9 items-center ak-frame-border", props.className)}
        onClick={async (event) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
          if (state !== "idle") return;
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            return;
          }
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
      </Button>
    </Tooltip>
  );
}
