/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getWindow } from "@ariakit/utils";
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

/** A corner as its block side, then its inline side. */
export type RadiusCorner =
  | "start-start"
  | "start-end"
  | "end-start"
  | "end-end";

interface RadiusShape {
  centerX: number;
  centerY: number;
  cornerX: number;
  cornerY: number;
  // 1 when the center is right of the corner, -1 when it's left of it.
  signX: number;
  // 1 when the center is below the corner, -1 when it's above it.
  signY: number;
  screenRadius: number;
  value: number;
}

interface MeasureRadiusParams {
  element: HTMLElement;
  stage: HTMLElement;
  corner: RadiusCorner;
}

// The kit measures circular radii of a length. This reads the first of the two
// values that a computed radius can have, the horizontal one. A percentage
// resolves against the width of the box only, and a math function that mixes a
// percentage and a length, such as calc(), reads as 0.
function parseRadius(value: string, width: number) {
  const [first = ""] = value.trim().split(/\s+/);
  const length = Number.parseFloat(first);
  if (Number.isNaN(length)) return 0;
  if (first.endsWith("%")) return (length / 100) * width;
  return length;
}

function measureRadius({ element, stage, corner }: MeasureRadiusParams) {
  const box = measureBox(element, stage);
  const [block, inline] = corner.split("-");
  const top = block === "start";
  const left = (inline === "start") !== box.rtl;
  const property = `border-${top ? "top" : "bottom"}-${left ? "left" : "right"}-radius`;
  const style = getWindow(element).getComputedStyle(element);
  const width = box.width / box.scale;
  const height = box.height / box.scale;
  const computed = parseRadius(style.getPropertyValue(property), width);
  // A radius larger than half the box, such as a pill radius, draws as half of
  // the box.
  const value = Math.min(computed, width / 2, height / 2);
  const screenRadius = value * box.scale;
  const signX = left ? 1 : -1;
  const signY = top ? 1 : -1;
  const cornerX = left ? box.left : box.right;
  const cornerY = top ? box.top : box.bottom;
  const shape: RadiusShape = {
    cornerX,
    cornerY,
    centerX: cornerX + signX * screenRadius,
    centerY: cornerY + signY * screenRadius,
    signX,
    signY,
    screenRadius,
    value,
  };
  return shape;
}

export interface RadiusProps {
  /** The name of the measurement, such as `Outer radius`. */
  label: string;
  /** The element whose corner the part measures. */
  target: MeasureTarget;
  /**
   * The corner to measure, as its block side, then its inline side. The inline
   * side follows the direction of the target.
   * @default "start-start"
   */
  corner?: RadiusCorner;
  /** @default "brand" */
  tone?: MeasureTone;
}

/**
 * Draws the radius of a corner of the target: its arc, the circle that the arc
 * is part of, and its value at 1×. Concentric corners share the center of their
 * circles. The value is the computed radius of the target, up to half of its
 * box. The part doesn't follow the browser when the large radii of two corners
 * on one side overlap, and the browser makes them smaller.
 * @example
 * <Radius label="Outer radius" target={outerRef} />
 */
export function Radius({
  label,
  target,
  corner = "start-start",
  tone = "brand",
}: RadiusProps) {
  const [shape, setShape] = useState<RadiusShape | null>(null);

  useFigureMeasure((stage) => {
    const element = resolveTarget(target);
    const next = element ? measureRadius({ element, stage, corner }) : null;
    setShape((current) => (isShallowEqual(current, next) ? current : next));
  });

  useFigureLegend(shape && { label, value: formatLength(shape.value), tone });

  if (!shape) return null;
  const { centerX, centerY, cornerX, cornerY, signX, signY } = shape;
  const radius = shape.screenRadius;
  const classes = toneClasses[tone];
  // The arc goes from the side to the top or bottom of the corner. On the
  // screen, the y axis points down, so a top left arc turns clockwise.
  const sweep = signX * signY > 0 ? 1 : 0;
  const arc = `M ${cornerX} ${centerY} A ${radius} ${radius} 0 0 ${sweep} ${centerX} ${cornerY}`;
  return (
    <MeasureOverlay label={label}>
      {radius >= 1 && (
        <>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            strokeDasharray="3 4"
            className={`${classes.stroke} opacity-60`}
          />
          <path
            d={arc}
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            className={classes.stroke}
          />
        </>
      )}
      <circle
        data-measure-center
        cx={centerX}
        cy={centerY}
        r={2.5}
        className={classes.fill}
      />
    </MeasureOverlay>
  );
}
