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
import type {
  GliderGroupProps,
  GliderProps,
} from "@ariakit/ui/components/glider.ariakit.react.tsx";
import {
  Glider,
  GliderGroup,
  GliderSeparator,
} from "@ariakit/ui/components/glider.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { clsx } from "clsx";
import * as React from "react";
import { Caption, Labeled, Sample, Samples, Stage } from "./gallery.react.tsx";

const labels = ["Preview", "Code", "Usage"];

interface DemoGroupProps extends GliderGroupProps {
  /** The gliders to render after the buttons. */
  gliders?: GliderProps[];
  /** Whether a separator sits between the buttons. */
  separators?: boolean;
  /** The initially selected button, or none. */
  defaultSelected?: number;
  buttonProps?: React.ComponentProps<typeof Button>;
}

/**
 * A group whose selection moves on click, so the glider's travel can be
 * watched rather than inferred from a frozen state.
 */
function DemoGroup({
  gliders = [{ $kind: "flat", $state: "selected" }],
  separators,
  defaultSelected = 0,
  buttonProps,
  className,
  ...props
}: DemoGroupProps) {
  const [selected, setSelected] = React.useState(defaultSelected);
  return (
    <GliderGroup
      $border
      $layer
      className={clsx("w-max max-w-full", className)}
      {...props}
    >
      {labels.map((label, index) => (
        <React.Fragment key={label}>
          {separators && index > 0 && <GliderSeparator />}
          <Button
            aria-selected={selected === index}
            onClick={() => setSelected(index)}
            {...buttonProps}
          >
            {label}
          </Button>
        </React.Fragment>
      ))}
      {gliders.map((glider, index) => (
        <Glider key={index} {...glider} />
      ))}
    </GliderGroup>
  );
}

export function GliderSection() {
  return (
    <Samples>
      <Sample
        title="Kinds"
        code='Glider $kind="flat" | "bevel" | "bar" $state="selected"'
        description="Flat and bevel gliders cover the selected button. A bar is a rule along the group's edge. Click a button to move them."
      >
        <Stage direction="column">
          <Labeled label="Flat">
            <DemoGroup gliders={[{ $kind: "flat", $state: "selected" }]} />
          </Labeled>
          <Labeled label="Bevel">
            <DemoGroup
              defaultSelected={1}
              gliders={[{ $kind: "bevel", $state: "selected" }]}
            />
          </Labeled>
          <Labeled label="Bar">
            <DemoGroup
              defaultSelected={2}
              gliders={[{ $kind: "bar", $state: "selected" }]}
            />
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="States"
        code='Glider $state="hover" | "focus" | "selected"'
        description="A glider follows the button in its state. Hover the first group and tab through the second. The third stacks a hover glider under a selected one."
      >
        <Stage direction="column">
          <Labeled label="Hover">
            <DemoGroup
              defaultSelected={-1}
              gliders={[{ $kind: "flat", $state: "hover" }]}
            />
          </Labeled>
          <Labeled label="Focus">
            <DemoGroup
              defaultSelected={-1}
              gliders={[{ $kind: "bar", $state: "focus" }]}
            />
          </Labeled>
          <Labeled label="Selected and hover">
            <DemoGroup
              gliders={[
                { $kind: "flat", $state: "selected" },
                { $kind: "flat", $state: "hover" },
              ]}
            />
          </Labeled>
          <Labeled label="Selected bar, hover cover and focus ring">
            <DemoGroup
              gliders={[
                { $kind: "bar", $state: "selected" },
                { $kind: "flat", $state: "hover" },
                { $kind: "flat", $state: "focus" },
              ]}
            />
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="Vertical"
        code='GliderGroup $layout="vertical"'
        description="In a vertical group the bar runs along the end edge and the covers travel on the block axis."
      >
        <Stage className="items-start">
          <DemoGroup
            $layout="vertical"
            gliders={[{ $kind: "bar", $state: "selected" }]}
            buttonProps={{ className: "justify-start" }}
          />
          <DemoGroup
            $layout="vertical"
            defaultSelected={1}
            gliders={[
              { $kind: "flat", $state: "selected" },
              { $kind: "flat", $state: "hover" },
            ]}
            buttonProps={{ className: "justify-start" }}
          />
          <DemoGroup
            $layout="vertical"
            defaultSelected={2}
            gliders={[{ $kind: "bevel", $state: "selected" }]}
            buttonProps={{ className: "justify-start" }}
          />
        </Stage>
      </Sample>

      <Sample
        title="Separators"
        code="GliderSeparator between buttons"
        description="A separator fades next to the selected or hovered button, so the glider never crosses a rule."
      >
        <Stage direction="column">
          <DemoGroup
            separators
            gliders={[{ $kind: "flat", $state: "selected" }]}
          />
          <DemoGroup
            separators
            defaultSelected={1}
            gliders={[
              { $kind: "bevel", $state: "selected" },
              { $kind: "flat", $state: "hover" },
            ]}
          />
        </Stage>
      </Sample>

      <Sample
        title="Group geometry"
        code='GliderGroup $gap="none" | "sm" · $p="none" · $rounded="full" · $size'
        description="The group's padding and gap space the buttons, and a glider covers the button it follows."
      >
        <Stage direction="column">
          <DemoGroup $gap="none" />
          <DemoGroup $gap="sm" defaultSelected={1} />
          <DemoGroup $p="none" $rounded="lg" defaultSelected={2} />
          <DemoGroup
            $rounded="full"
            gliders={[{ $kind: "bevel", $state: "selected" }]}
          />
          <DemoGroup
            $size="sm"
            gliders={[{ $kind: "bar", $state: "selected" }]}
          />
          <DemoGroup $size="lg" defaultSelected={1} />
        </Stage>
      </Sample>

      <Sample
        title="Glider knobs"
        code="Glider $animated={false} · $lightnessOffset · $layer · $rounded · $border"
        description="The glider is a frame, so it takes every layer and edge knob on top of its kind."
      >
        <Stage direction="column">
          <Labeled label="Not animated">
            <DemoGroup
              gliders={[
                { $kind: "flat", $state: "selected", $animated: false },
              ]}
            />
          </Labeled>
          <Labeled label="Deeper offset">
            <DemoGroup
              defaultSelected={1}
              gliders={[
                { $kind: "flat", $state: "selected", $lightnessOffset: 5 },
              ]}
            />
          </Labeled>
          <Labeled label="Brand tint">
            <DemoGroup
              defaultSelected={2}
              gliders={[
                {
                  $kind: "flat",
                  $state: "selected",
                  $layer: "brand",
                  $mix: 30,
                },
              ]}
            />
          </Labeled>
          <Labeled label="Square with a border">
            <DemoGroup
              gliders={[
                {
                  $kind: "flat",
                  $state: "selected",
                  $rounded: "sm",
                  $border: true,
                  $borderType: "border",
                  $edge: "brand",
                },
              ]}
            />
          </Labeled>
          <Labeled label="Brand bar">
            <DemoGroup
              defaultSelected={1}
              gliders={[{ $kind: "bar", $state: "selected", $layer: "brand" }]}
            />
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="GliderGroup inside Layer"
        description="The group and its glider read the surface they sit on."
      >
        <Stage direction="column">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <Stage>
              <DemoGroup />
              <DemoGroup
                defaultSelected={1}
                gliders={[{ $kind: "bevel", $state: "selected" }]}
              />
            </Stage>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <Stage>
              <DemoGroup />
              <DemoGroup
                defaultSelected={1}
                gliders={[{ $kind: "bar", $state: "selected" }]}
              />
            </Stage>
          </Layer>
        </Stage>
      </Sample>
    </Samples>
  );
}
