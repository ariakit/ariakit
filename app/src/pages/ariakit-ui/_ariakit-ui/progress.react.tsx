/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import {
  Progress,
  ProgressCircular,
} from "@ariakit/ui/components/progress.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";
import * as React from "react";
import { Caption, Labeled, Sample, Samples, Stage } from "./gallery.react.tsx";

const values = [0, 0.25, 0.65, 1] as const;
const thicknesses = [1, 2, 4, 6] as const;

function ValueRow({
  value,
  children,
}: {
  value: number;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between text-sm">
        <span>{children}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function Live() {
  const [value, setValue] = React.useState(0.2);
  const advance = () =>
    setValue((current) => (current >= 1 ? 0 : Math.min(1, current + 0.3)));
  return (
    <div className="grid gap-3">
      <Progress value={value} $thickness={3} />
      <Stage>
        <div className="size-14">
          <ProgressCircular
            value={value}
            $thickness={2}
            className="grid place-items-center text-xs"
          >
            <Text>{Math.round(value * 100)}</Text>
          </ProgressCircular>
        </div>
        <Button onClick={advance} $rounded="lg">
          {value >= 1 ? "Reset" : "Advance"}
        </Button>
        <Caption>The fill animates toward each new value.</Caption>
      </Stage>
    </div>
  );
}

export function ProgressSection() {
  return (
    <Samples>
      <Sample
        title="Values"
        code="Progress value={0 | 0.25 | 0.65 | 1}"
        description="A brand fill inside a rounded track. The width animates from empty on first paint."
      >
        <div className="grid gap-4">
          {values.map((value) => (
            <ValueRow key={value} value={value}>
              Value {value}
            </ValueRow>
          ))}
          <div className="grid gap-2">
            <div className="flex justify-between text-sm">
              <span>No value</span>
              <span className="ak-ink-60">indeterminate</span>
            </div>
            <Progress />
          </div>
        </div>
      </Sample>

      <Sample
        title="Thickness"
        code="$thickness={1 | 2 | 4 | 6}"
        description="Numbers scale the spacing token. The track's inset ring keeps the edge inside the height."
      >
        <div className="grid gap-4">
          {thicknesses.map((thickness) => (
            <Labeled key={thickness} label={`$thickness={${thickness}}`}>
              <Progress value={0.6} $thickness={thickness} />
            </Labeled>
          ))}
        </div>
      </Sample>

      <Sample
        title="Track"
        code='$lightnessOffset={5} · $edgeWeight="bold" · $rounded="none" · $border={false} · $layer="brand" $mix={20}'
        description="The track is a frame, so its surface, edge and radius are open. The fill stays brand."
      >
        <div className="grid gap-4">
          <Labeled label="Deeper track">
            <Progress value={0.5} $lightnessOffset={5} />
          </Labeled>
          <Labeled label="Bold edge">
            <Progress value={0.5} $edgeWeight="bold" />
          </Labeled>
          <Labeled label="Square, no edge">
            <Progress
              value={0.5}
              $rounded="none"
              $border={false}
              $thickness={3}
            />
          </Labeled>
          <Labeled label="Tinted track">
            <Progress value={0.5} $layer="brand" $mix={20} $thickness={3} />
          </Labeled>
        </div>
      </Sample>

      <Sample
        title="Circular"
        code="ProgressCircular value $thickness · children centered"
        description="A ring the size of its box, with an arc that sweeps to the value. Children sit in the middle."
      >
        <Stage className="items-end">
          {[0.2, 0.55, 0.9].map((value) => (
            <div key={value} className="size-16">
              <ProgressCircular
                value={value}
                $thickness={value === 0.55 ? 3 : 2}
                className="grid place-items-center text-sm"
              >
                <Text>{Math.round(value * 100)}%</Text>
              </ProgressCircular>
            </div>
          ))}
          <div className="size-8">
            <ProgressCircular value={0.7} $thickness={1} />
          </div>
          <div className="size-12">
            <ProgressCircular value={0.7} $thickness={2} />
          </div>
          <div className="size-24">
            <ProgressCircular
              value={0.7}
              $thickness={6}
              className="grid place-items-center"
            >
              <Text className="text-lg font-medium">70%</Text>
            </ProgressCircular>
          </div>
          <div className="size-16">
            <ProgressCircular value={1} $thickness={4} />
          </div>
        </Stage>
      </Sample>

      <Sample
        title="Live"
        code="Progress value from state"
        description="Advance the value to watch the linear fill and the arc transition together."
      >
        <Live />
      </Sample>

      <Sample
        title="On layers"
        code="Progress inside Layer"
        description="The track lifts off whatever surface it sits on, and the ring's center disc paints the parent back over the arc."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Layer $invert className="grid gap-3 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <Progress value={0.6} />
            <div className="size-12">
              <ProgressCircular value={0.6} />
            </div>
          </Layer>
          <Layer $layer="brand" className="grid gap-3 rounded-xl p-4">
            <Caption>Brand</Caption>
            <Progress value={0.6} />
            <div className="size-12">
              <ProgressCircular value={0.6} />
            </div>
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
