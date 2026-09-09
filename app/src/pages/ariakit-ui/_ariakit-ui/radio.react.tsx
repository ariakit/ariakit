/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import type { RadioFieldProps } from "@ariakit/ui/components/radio.ariakit.react";
import {
  Radio,
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardDescription,
  RadioCardGrid,
  RadioCardLabel,
  RadioDescription,
  RadioField,
  RadioGroup,
  RadioLabel,
  RadioProvider,
} from "@ariakit/ui/components/radio.ariakit.react";
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
  radioProps?: Partial<RadioFieldProps>;
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
          <RadioField key={plan.value} value={plan.value} {...radioProps}>
            <RadioLabel>{plan.label}</RadioLabel>
            {descriptions && (
              <RadioDescription>{plan.description}</RadioDescription>
            )}
          </RadioField>
        ))}
      </RadioGroup>
    </RadioProvider>
  );
}

interface PlanCardsProps {
  floating?: boolean;
  descriptions?: boolean;
  minItemSize?: string;
}

function PlanCards({ floating, descriptions, minItemSize }: PlanCardsProps) {
  return (
    <RadioProvider defaultValue="pro">
      <RadioCardGrid aria-label="Plan" $minItemSize={minItemSize}>
        {plans.map((plan) => (
          <RadioCard key={plan.value} value={plan.value}>
            {!floating && <RadioCardCheck />}
            <RadioCardContent>
              <RadioCardLabel>{plan.label}</RadioCardLabel>
              {descriptions && (
                <RadioCardDescription>{plan.description}</RadioCardDescription>
              )}
            </RadioCardContent>
            {floating && <RadioCardCheck $floating />}
          </RadioCard>
        ))}
      </RadioCardGrid>
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
            <RadioField key={plan.value} value={plan.value}>
              <RadioLabel>{plan.label}</RadioLabel>
            </RadioField>
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
        title="States"
        code="RadioProvider > RadioGroup > Radio"
        description="Native radio inputs drawn by CSS: a disc that fills brand with a dot, and a neutral fill with a dimmed dot when disabled."
      >
        <Stage>
          <RadioProvider defaultValue="on">
            <RadioGroup className="flex flex-wrap gap-3" aria-label="States">
              <Radio value="off" aria-label="Off" />
              <Radio value="on" aria-label="On" />
              <Radio value="disabled" aria-label="Disabled" disabled />
            </RadioGroup>
          </RadioProvider>
          <RadioProvider defaultValue="on">
            <RadioGroup
              className="flex flex-wrap gap-3"
              aria-label="Checked and disabled"
            >
              <Radio value="on" aria-label="On and disabled" disabled />
            </RadioGroup>
          </RadioProvider>
        </Stage>
      </Sample>

      <Sample
        title="Group"
        code="RadioProvider > RadioGroup > RadioField > RadioLabel"
        description="The input draws its own dot and fills brand when checked. Arrow keys move the selection."
      >
        <PlanGroup />
      </Sample>

      <Sample
        title="Descriptions"
        code="RadioField > RadioLabel + RadioDescription"
        description="The row stacks the label and description under the field's content channels."
      >
        <PlanGroup descriptions />
      </Sample>

      <Sample
        title="Disabled"
        code="RadioField disabled · RadioGroup disabled"
        description="A disabled radio keeps its dot on a neutral fill and drops the hover feedback. A group disables every row inside it."
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup className="grid gap-1">
            <RadioField value="hobby">
              <RadioLabel>Hobby</RadioLabel>
            </RadioField>
            <RadioField value="pro" disabled>
              <RadioLabel>Pro, checked and disabled</RadioLabel>
              <RadioDescription>The dot stays, the brand goes</RadioDescription>
            </RadioField>
            <RadioField value="enterprise" disabled>
              <RadioLabel>Enterprise, disabled</RadioLabel>
            </RadioField>
          </RadioGroup>
        </RadioProvider>
        <RadioProvider defaultValue="hobby">
          <RadioGroup disabled className="grid gap-1">
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
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
        title="Controlled"
        code="RadioProvider value setValue"
        description="The selection is owned by the page and echoed below the group."
      >
        <ControlledGroup />
      </Sample>

      <Sample
        wide
        title="Cards"
        code="RadioCardGrid > RadioCard > RadioCardCheck + RadioCardContent"
        description="The card is the same choice card as the checkbox one, with a dot for its mark and one selection per group. The grid is the radio group."
      >
        <PlanCards descriptions minItemSize="20rem" />
      </Sample>

      <Sample
        wide
        title="Floating check"
        code="RadioCardCheck $floating"
        description="The check becomes a stamp in the top-end corner and shows only on the selected card."
      >
        <PlanCards floating descriptions minItemSize="20rem" />
      </Sample>

      <Sample
        title="On layers"
        code="RadioGroup inside Layer"
        description="The disc and the row resolve against the layer around them; cards lift off it."
      >
        <SwatchGrid min="13rem">
          <Layer $lightnessOffset={2} className="grid gap-2 rounded-xl p-4">
            <Caption>Offset</Caption>
            <PlanGroup />
            <PlanCards />
          </Layer>
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <PlanGroup />
            <PlanCards />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <PlanGroup />
            <PlanCards />
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
