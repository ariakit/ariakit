/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { ButtonContent } from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type { RadioProps } from "@ariakit/ui/components/radio.ariakit.react.tsx";
import {
  Radio,
  RadioDescription,
  RadioGroup,
  RadioLabel,
  RadioProvider,
} from "@ariakit/ui/components/radio.ariakit.react.tsx";
import * as React from "react";
import {
  Caption,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

const plans = [
  {
    value: "hobby",
    label: "Hobby",
    description: "For side projects and experiments",
  },
  {
    value: "pro",
    label: "Pro",
    description: "For teams shipping to production",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom limits and support",
  },
];

interface PlanGroupProps {
  defaultValue?: string;
  descriptions?: boolean;
  radioProps?: Partial<RadioProps>;
  className?: string;
}

function PlanGroup({
  defaultValue = "pro",
  descriptions,
  radioProps,
  className = "grid gap-1",
}: PlanGroupProps) {
  return (
    <RadioProvider defaultValue={defaultValue}>
      <RadioGroup className={className}>
        {plans.map((plan) => (
          <Radio key={plan.value} value={plan.value} {...radioProps}>
            {descriptions ? (
              <ButtonContent>
                <RadioLabel>{plan.label}</RadioLabel>
                <RadioDescription>{plan.description}</RadioDescription>
              </ButtonContent>
            ) : (
              <RadioLabel>{plan.label}</RadioLabel>
            )}
          </Radio>
        ))}
      </RadioGroup>
    </RadioProvider>
  );
}

function ControlledGroup() {
  const [value, setValue] = React.useState<string | number | null>("pro");
  return (
    <div className="grid gap-3">
      <RadioProvider value={value} setValue={setValue}>
        <RadioGroup className="grid gap-1">
          {plans.map((plan) => (
            <Radio key={plan.value} value={plan.value}>
              <RadioLabel>{plan.label}</RadioLabel>
            </Radio>
          ))}
        </RadioGroup>
      </RadioProvider>
      <Caption>Selected: {String(value)}</Caption>
    </div>
  );
}

export function RadioSection() {
  return (
    <Samples>
      <Sample
        title="Group"
        code="RadioProvider > RadioGroup > Radio > RadioLabel"
        description="A label wraps a hidden input. The dot is drawn by the label and fills brand when the input is checked. Arrow keys move the selection."
      >
        <PlanGroup />
      </Sample>

      <Sample
        title="Descriptions"
        code="Radio > ButtonContent > RadioLabel + RadioDescription"
        description="The label and description share the button's content channels."
      >
        <PlanGroup descriptions />
      </Sample>

      <Sample
        title="Disabled"
        code="Radio disabled"
        description="A disabled radio keeps its dot in the ink's grey and drops the hover feedback."
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup className="grid gap-1">
            <Radio value="hobby">
              <RadioLabel>Hobby</RadioLabel>
            </Radio>
            <Radio value="pro" disabled>
              <ButtonContent>
                <RadioLabel>Pro, checked and disabled</RadioLabel>
                <RadioDescription>
                  The dot stays, the brand goes
                </RadioDescription>
              </ButtonContent>
            </Radio>
            <Radio value="enterprise" disabled>
              <RadioLabel>Enterprise, disabled</RadioLabel>
            </Radio>
          </RadioGroup>
        </RadioProvider>
      </Sample>

      <Sample
        title="Sizes and layout"
        code='$size="sm" | "lg" · RadioGroup as a row'
        description="The dot and the padding scale with the font size. The group lays its radios out however its class says."
      >
        <Stage direction="column">
          <PlanGroup
            radioProps={{ $size: "sm" }}
            className="flex flex-wrap gap-1"
          />
          <PlanGroup
            radioProps={{ $size: "lg" }}
            className="flex flex-wrap gap-1"
          />
        </Stage>
      </Sample>

      <Sample
        title="Cards"
        code='Radio $layer $border $rounded="xl" $p={3}'
        description="A radio takes the button's frame knobs, so it can be a bordered card on its own layer."
      >
        <PlanGroup
          descriptions
          radioProps={{ $layer: true, $border: true, $rounded: "xl", $p: 3 }}
          className="grid gap-2"
        />
      </Sample>

      <Sample
        title="Controlled"
        code="RadioProvider value setValue"
        description="The selection is owned by the page and echoed below the group."
      >
        <ControlledGroup />
      </Sample>

      <Sample
        title="On layers"
        code="RadioGroup inside Layer"
        description="The dot and the hover fill resolve against the layer around them."
      >
        <SwatchGrid min="12rem">
          <Layer $lightnessOffset={2} className="grid gap-2 rounded-xl p-4">
            <Caption>Offset</Caption>
            <PlanGroup />
          </Layer>
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <PlanGroup />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <PlanGroup />
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
