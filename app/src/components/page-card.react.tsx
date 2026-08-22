/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { Badge, BadgeLabel } from "@ariakit/ui/ariakit/badge.react.tsx";
import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import { clsx } from "clsx";
import * as React from "react";

export interface PageCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
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
    <Button
      render={
        <a
          {...props}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      }
      // Card frame, like the legacy ak-frame-card/card token values.
      $rounded="xl"
      $p={4}
      $gap="none"
      $activeDepth={4}
      // The card sits on the parent layer color, like the legacy
      // ak-layer-lighten-0.
      $lightnessOffset={false}
      // The focus ring is replaced by a background state change here plus the
      // thumbnail highlight below.
      $focus={false}
      className={clsx(
        "group/card flex-col gap-2 items-stretch justify-start text-wrap font-normal",
        "ui-focus-visible:ak-state-6",
        className,
      )}
    >
      <span className="ak-frame ak-frame-cover ak-frame-p-0">
        <span
          //@ts-expect-error
          inert="true"
          className={clsx(
            "ak-layer ak-light:ak-layer-darken-6 ak-dark:ak-layer-darken-2 ak-frame-border ak-frame ak-frame-card/4 flex justify-center items-center-safe group-ui-focus-visible/card:ak-layer-primary group-ui-focus-visible/card:ak-layer-contrast overflow-hidden relative [content-visibility:auto]",
            sizeClass,
          )}
        >
          {plus && (
            <span className="ak-frame ak-frame-cover ak-frame-p-1 [--padding:var(--ak-frame-padding)] contents">
              <Badge
                render={<span />}
                $layer="brand"
                $p={1.5}
                $px="sm"
                $borderType="dashed"
                $borderWeight="medium"
                className="absolute top-(--padding) end-(--padding)"
              >
                <BadgeLabel>Plus</BadgeLabel>
              </Badge>
            </span>
          )}
          <span
            className="group-ui-focus-visible/card:ak-layer group-ui-focus-visible/card:ak-layer-white -m-10 bg-transparent! grid content-center-safe group-hover/card:scale-75 scale-70 origin-center relative transition-transform duration-600"
            dangerouslySetInnerHTML={{ __html: thumbnail || "" }}
          />
        </span>
      </span>
      <span className="flex flex-col gap-1">
        <span className="flex ak-layer bg-transparent gap-2 items-center font-semibold">
          <span id={labelId} className="truncate">
            {title}
          </span>
        </span>
        {description ? (
          <span id={descriptionId} className="ak-ink-70 text-sm">
            {description}
          </span>
        ) : null}
      </span>
    </Button>
  );
}
