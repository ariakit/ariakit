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
import type { ComponentProps, CSSProperties } from "react";
import { useId } from "react";
import * as icons from "./icons.ts";

export type IconName = keyof typeof icons;

export interface IconProps extends ComponentProps<"svg"> {
  name: keyof typeof icons;
  animateStroke?: boolean | number;
}

export function Icon({ name, animateStroke, ...props }: IconProps) {
  const id = useId();
  const hasLabel =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

  // biome-ignore lint/performance/noDynamicNamespaceImportAccess: name is constrained to keyof typeof icons
  const icon = icons[name];
  const { html, stroke, replaceId, fill, size = 24, emSize = 1 } = icon;
  const strokeWidth = props.strokeWidth ?? icon.strokeWidth ?? 1.5;

  let content = html;

  if (replaceId) {
    content = content.replace(/<replace-id-(\d+)>/g, `${id}$1`);
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={`${emSize}em`}
      height={`${emSize}em`}
      fill={fill}
      stroke={stroke}
      aria-hidden={!hasLabel || undefined}
      dangerouslySetInnerHTML={{ __html: content }}
      {...props}
      style={
        {
          "--stroke-width": strokeWidth,
          transitionDuration:
            typeof animateStroke === "number"
              ? `${animateStroke}ms`
              : undefined,
          ...props.style,
        } as CSSProperties
      }
      className={clsx(
        "inline-block base:stroke-(length:--stroke-width) base:ak-dark:stroke-[calc(var(--stroke-width)/1.25)]",
        animateStroke &&
          "[stroke-dasharray:1em] starting:[stroke-dashoffset:1em] [stroke-dashoffset:0] transition-[stroke-dashoffset]",
        props.className,
      )}
    />
  );
}
