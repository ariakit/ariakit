/**
 * Based on https://github.com/AndrewPrifer/progressive-blur
 * @license
 * Copyright (c) 2024 Andrew Prifer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED
 * "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type * as React from "react";

interface ProgressiveBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  strength?: number;
  steps?: number;
  falloffPercentage?: number;
  tint?: string;
  side?: "left" | "right" | "top" | "bottom";
}

const oppositeSide = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};

export function ProgressiveBlur({
  strength = 64,
  steps = 8,
  falloffPercentage = 100,
  tint = "transparent",
  side = "top",
  ...props
}: ProgressiveBlurProps) {
  const actualSteps = Math.max(1, steps);
  const step = falloffPercentage / actualSteps;

  const factor = 0.5;

  const base = (strength / factor) ** (1 / (actualSteps - 1));

  const mainPercentage = 100 - falloffPercentage;

  const getBackdropFilter = (i: number) =>
    `blur(${factor * base ** (actualSteps - i - 1)}px)`;

  return (
    <div
      {...props}
      style={{
        // This has to be set on the top level element to prevent pointer events
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
        transformOrigin: side,
        ...props.style,
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(
            to ${oppositeSide[side]},
            rgb(from ${tint} r g b / alpha) 0%,
            rgb(from ${tint} r g b / 0%) 100%
          )`,
        }}
      >
        {/* Full blur at 100-falloffPercentage% */}
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            inset: 0,
            mask: `linear-gradient(
                  to ${oppositeSide[side]},
                  rgba(0, 0, 0, 1) ${mainPercentage}%,
                  rgba(0, 0, 0, 0) ${mainPercentage + step}%
                )`,
            backdropFilter: getBackdropFilter(0),
            WebkitBackdropFilter: getBackdropFilter(0),
          }}
        />
        {actualSteps > 1 && (
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              inset: 0,
              mask: `linear-gradient(
                to ${oppositeSide[side]},
                  rgba(0, 0, 0, 1) ${mainPercentage}%,
                  rgba(0, 0, 0, 1) ${mainPercentage + step}%,
                  rgba(0, 0, 0, 0) ${mainPercentage + step * 2}%
                )`,
              backdropFilter: getBackdropFilter(1),
              WebkitBackdropFilter: getBackdropFilter(1),
            }}
          />
        )}
        {actualSteps > 2 &&
          Array.from({ length: actualSteps - 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                zIndex: i + 2,
                inset: 0,
                mask: `linear-gradient(
                    to ${oppositeSide[side]},
                    rgba(0, 0, 0, 0) ${mainPercentage + i * step}%,
                    rgba(0, 0, 0, 1) ${mainPercentage + (i + 1) * step}%,
                    rgba(0, 0, 0, 1) ${mainPercentage + (i + 2) * step}%,
                    rgba(0, 0, 0, 0) ${mainPercentage + (i + 3) * step}%
                  )`,
                backdropFilter: getBackdropFilter(i + 2),
                WebkitBackdropFilter: getBackdropFilter(i + 2),
              }}
            />
          ))}
      </div>
    </div>
  );
}
