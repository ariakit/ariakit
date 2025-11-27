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
import * as React from "react";

export interface PageCardProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  thumbnail?: string | null;
  description?: string;
  plus?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PageCard({
  thumbnail,
  title,
  description,
  plus,
  size = "md",
  className,
  ...props
}: PageCardProps) {
  const reactId = React.useId();
  const labelId = `${reactId}-label`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  const sizeClass = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  }[size];

  return (
    <a
      {...props}
      className={clsx(
        "ak-button ak-command-depth-4 text-wrap ak-layer-(--ak-layer-parent) ak-command-focus:outline-0 ak-command-focus:ak-layer-hover ak-frame-card flex flex-col gap-2 items-stretch font-normal outline-offset-2 group/card justify-start",
        className,
      )}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
    >
      <span className="ak-frame-cover/0">
        <span
          //@ts-expect-error
          inert="true"
          className={clsx(
            "ak-light:ak-layer-down ak-dark:ak-layer-down-0.3 ak-frame-border ak-frame/4 flex justify-center items-center-safe group-focus-visible/card:ak-layer-contrast-primary overflow-hidden relative [content-visibility:auto]",
            sizeClass,
          )}
        >
          {plus && (
            <span className="ak-frame-cover/1 [--padding:var(--ak-frame-padding)] contents">
              <span className="absolute top-(--padding) end-(--padding) ak-badge-primary border border-dashed px-(--ak-frame-padding)">
                <span>Plus</span>
              </span>
            </span>
          )}
          <span
            className="group-ak-command-focus/card:ak-layer-white -m-10 bg-transparent! grid content-center-safe group-ak-command-hover/card:scale-75 scale-70 origin-center relative transition-transform duration-600"
            dangerouslySetInnerHTML={{ __html: thumbnail || "" }}
          />
        </span>
      </span>
      <span className="flex flex-col gap-1">
        <span className="flex gap-2 items-center font-semibold">
          <span id={labelId} className="truncate">
            {title}
          </span>
        </span>
        {description ? (
          <span id={descriptionId} className="ak-text/70 text-sm">
            {description}
          </span>
        ) : null}
      </span>
    </a>
  );
}
