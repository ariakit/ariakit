/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useState } from "react";
import { useFigureLegend, useFigureMeasure } from "./figure.react.tsx";
import { MeasureOverlay } from "./overlay.react.tsx";
import type { MeasureTarget, MeasureTone } from "./target.ts";
import {
  formatLength,
  isShallowEqual,
  measureBox,
  resolveTarget,
  toneClasses,
} from "./target.ts";

export type DistanceSide =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end";

interface DistanceShape {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  horizontal: boolean;
  value: number;
}

interface MeasureDistanceParams {
  from: HTMLElement;
  to: HTMLElement;
  stage: HTMLElement;
  side: DistanceSide;
}

function measureDistance({ from, to, stage, side }: MeasureDistanceParams) {
  const outer = measureBox(from, stage);
  const inner = measureBox(to, stage);
  const [axis, edge] = side.split("-");
  const horizontal = axis === "inline";
  const start = edge === "start";
  let shape: DistanceShape;
  if (horizontal) {
    const left = start !== outer.rtl;
    // The line crosses the middle of the inner element, where it's easy to read
    // against both edges.
    const y = (inner.top + inner.bottom) / 2;
    const x1 = left ? outer.left : inner.right;
    const x2 = left ? inner.left : outer.right;
    shape = { x1, y1: y, x2, y2: y, horizontal, value: 0 };
  } else {
    const x = (inner.left + inner.right) / 2;
    const y1 = start ? outer.top : inner.bottom;
    const y2 = start ? inner.top : outer.bottom;
    shape = { x1: x, y1, x2: x, y2, horizontal, value: 0 };
  }
  const length = horizontal ? shape.x2 - shape.x1 : shape.y2 - shape.y1;
  shape.value = length / outer.scale;
  return shape;
}

export interface DistanceProps {
  /** The name of the measurement, such as `Padding`. */
  label: string;
  /** The outer element, whose edge the distance starts at. */
  from: MeasureTarget;
  /** The element inside `from`, whose edge the distance ends at. */
  to: MeasureTarget;
  /**
   * The side of the elements to measure between. The inline sides follow the
   * direction of `from`.
   */
  side: DistanceSide;
  /** @default "secondary" */
  tone?: MeasureTone;
}

/**
 * Draws the distance between the edge of an element and the same edge of an
 * element inside it, such as the padding of a frame, with its value at 1×.
 * @example
 * <Distance label="Padding" from={outerRef} to={innerRef} side="block-start" />
 */
export function Distance({
  label,
  from,
  to,
  side,
  tone = "secondary",
}: DistanceProps) {
  const [shape, setShape] = useState<DistanceShape | null>(null);

  useFigureMeasure((stage) => {
    const fromElement = resolveTarget(from);
    const toElement = resolveTarget(to);
    const next =
      fromElement && toElement
        ? measureDistance({ from: fromElement, to: toElement, stage, side })
        : null;
    setShape((current) => (isShallowEqual(current, next) ? current : next));
  });

  useFigureLegend(shape && { label, value: formatLength(shape.value), tone });

  if (!shape) return null;
  const { x1, y1, x2, y2, horizontal } = shape;
  const classes = toneClasses[tone];
  const tick = 5;
  // The ticks cross the line at each end.
  const ticks = horizontal
    ? `M ${x1} ${y1 - tick} V ${y1 + tick} M ${x2} ${y2 - tick} V ${y2 + tick}`
    : `M ${x1 - tick} ${y1} H ${x1 + tick} M ${x2 - tick} ${y2} H ${x2 + tick}`;
  return (
    <MeasureOverlay label={label}>
      <path
        d={`M ${x1} ${y1} L ${x2} ${y2} ${ticks}`}
        fill="none"
        strokeWidth={1.5}
        className={classes.stroke}
      />
    </MeasureOverlay>
  );
}
