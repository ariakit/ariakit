/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { cx } from "clava";
import { useRef, useState } from "react";
import { Distance } from "#app/components/measure/distance.react.tsx";
import { Figure, FigureSlider } from "#app/components/measure/figure.react.tsx";
import { Radius } from "#app/components/measure/radius.react.tsx";
import { Zoom } from "#app/components/measure/zoom.react.tsx";

// Full class names, so Tailwind finds them in the source.
const RADII = [
  { name: "lg", className: "ak-frame-rounded-lg" },
  { name: "xl", className: "ak-frame-rounded-xl" },
  { name: "2xl", className: "ak-frame-rounded-2xl" },
  { name: "3xl", className: "ak-frame-rounded-3xl" },
];

const PADDINGS = [
  "ak-frame-p-0",
  "ak-frame-p-1",
  "ak-frame-p-2",
  "ak-frame-p-3",
  "ak-frame-p-4",
];

export default function ConcentricRadius() {
  const [radius, setRadius] = useState(2);
  const [padding, setPadding] = useState(2);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  return (
    <Figure
      controls={
        <>
          <FigureSlider
            label="Outer radius"
            min={0}
            max={RADII.length - 1}
            value={radius}
            format={(value) => RADII[value]?.name ?? ""}
            onChange={setRadius}
          />
          <FigureSlider
            label="Outer padding"
            min={0}
            max={PADDINGS.length - 1}
            value={padding}
            onChange={setPadding}
          />
        </>
      }
      caption="The outer frame sets its radius and its padding. The inner frame has no radius of its own: it takes the outer radius less the padding, so the two corners share one center."
    >
      <Zoom level={2}>
        <div
          ref={outerRef}
          className={cx(
            "ak-layer ak-layer-12 ak-frame",
            RADII[radius]?.className,
            PADDINGS[padding],
          )}
        >
          <div
            ref={innerRef}
            className="ak-layer ak-layer-canvas ak-frame ak-frame-p-3 w-36 text-sm"
          >
            Inner frame
          </div>
        </div>
      </Zoom>
      <Radius label="Outer radius" target={outerRef} />
      <Radius label="Inner radius" target={innerRef} tone="secondary" />
      <Distance
        label="Outer padding"
        from={outerRef}
        to={innerRef}
        side="block-start"
        tone="brand"
      />
    </Figure>
  );
}
