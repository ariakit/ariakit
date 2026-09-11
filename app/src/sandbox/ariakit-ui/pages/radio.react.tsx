/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Radio,
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardDescription,
  RadioCardGrid,
  RadioCardLabel,
  RadioCardSlot,
  RadioDescription,
  RadioField,
  RadioGroup,
  RadioLabel,
  RadioProvider,
} from "@ariakit/ui/components/radio.ariakit.react";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";

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

const paymentMethods = [
  {
    value: "card",
    label: "Card",
    description: "Visa, Mastercard, Amex",
    icon: CreditCard,
  },
  {
    value: "wallet",
    label: "Wallet",
    description: "Apple Pay, Google Pay",
    icon: Wallet,
  },
  {
    value: "bank",
    label: "Bank transfer",
    description: "Two to three days",
    icon: Landmark,
  },
];

export function RadioExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Group"
        description="A group of label rows. The checked input fills brand with a dot, and the other inputs sink into the surface."
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup aria-label="Plan" className="grid gap-1">
            {plans.map((plan) => (
              <RadioField
                key={plan.value}
                value={plan.value}
                {...(plan.value === "pro" ? screenshotFocus : {})}
              >
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Descriptions"
        description="Each row stacks a description under its label, and the radio lines up with the first line."
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup aria-label="Plan" className="grid gap-1">
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
                <RadioDescription>{plan.description}</RadioDescription>
              </RadioField>
            ))}
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Small horizontal group"
        description="A compact row of choices. The smaller size scales the text, the dot and the row padding together."
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup aria-label="Plan" className="flex flex-wrap gap-1">
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value} $size="sm">
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Inline radios"
        description="A bare radio inside a plain label sits on a line of text, centered on the x-height, with no row around it."
      >
        <RadioProvider defaultValue="office">
          {/*
            The group keeps its block display: a flex class would blockify the
            radios and take them off the line of text.
          */}
          <RadioGroup aria-label="Ship to">
            Ship to{" "}
            <label>
              <Radio value="home" /> Home
            </label>{" "}
            <label>
              <Radio value="office" /> Office
            </label>
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Disabled option"
        description="One option is unavailable. Its text dims, its empty radio keeps a faint edge, and the other options stay interactive."
      >
        <RadioProvider defaultValue="yearly">
          <RadioGroup aria-label="Billing" className="grid gap-1">
            <RadioField value="monthly">
              <RadioLabel>Monthly</RadioLabel>
            </RadioField>
            <RadioField value="yearly">
              <RadioLabel>Yearly</RadioLabel>
            </RadioField>
            <RadioField value="lifetime" disabled>
              <RadioLabel>Lifetime</RadioLabel>
              <RadioDescription>Not available on this plan</RadioDescription>
            </RadioField>
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Disabled group"
        description="A disabled group disables every row. The checked radio keeps its dot on a neutral fill."
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup aria-label="Plan" className="grid gap-1" disabled>
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Group on a brand layer"
        description="The checked radio moves its fill away from the brand surface, and the unchecked radios sink into it."
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="w-full">
          <RadioProvider defaultValue="pro">
            <RadioGroup aria-label="Plan" className="grid gap-1">
              {plans.map((plan) => (
                <RadioField key={plan.value} value={plan.value}>
                  <RadioLabel>{plan.label}</RadioLabel>
                </RadioField>
              ))}
            </RadioGroup>
          </RadioProvider>
        </Frame>
      </Example>

      <Example
        title="Cards"
        description="Card-shaped labels with a dot at the start. The checked card tints toward brand, and the grid is the radio group."
        wide
      >
        <RadioProvider defaultValue="pro">
          <RadioCardGrid
            aria-label="Plan"
            $minItemSize="16rem"
            className="w-full"
          >
            {plans.map((plan) => (
              <RadioCard key={plan.value} value={plan.value}>
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>{plan.label}</RadioCardLabel>
                  <RadioCardDescription>
                    {plan.description}
                  </RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioProvider>
      </Example>

      <Example
        title="Stacked tiles"
        description="Each card is a tile: the icon and the dot share the top row, and the label and description fill the row below."
        wide
      >
        <RadioProvider defaultValue="card">
          <RadioCardGrid
            aria-label="Payment method"
            $minItemSize="16rem"
            className="w-full"
          >
            {paymentMethods.map((method) => (
              <RadioCard
                key={method.value}
                value={method.value}
                $orientation="vertical"
                $p={4}
              >
                <RadioCardSlot
                  $size="2xl"
                  $layer="brand"
                  $mix={20}
                  $rounded="lg"
                >
                  <method.icon />
                </RadioCardSlot>
                <RadioCardContent>
                  <RadioCardLabel>{method.label}</RadioCardLabel>
                  <RadioCardDescription>
                    {method.description}
                  </RadioCardDescription>
                </RadioCardContent>
                <RadioCardCheck />
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioProvider>
      </Example>

      <Example
        title="Check mark"
        description="The round box draws a check instead of the default dot."
        wide
      >
        <RadioProvider defaultValue="pro">
          <RadioCardGrid
            aria-label="Plan"
            $minItemSize="16rem"
            className="w-full"
          >
            {plans.map((plan) => (
              <RadioCard key={plan.value} value={plan.value}>
                <RadioCardCheck $mark="check" />
                <RadioCardContent>
                  <RadioCardLabel>{plan.label}</RadioCardLabel>
                  <RadioCardDescription>
                    {plan.description}
                  </RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioProvider>
      </Example>

      <Example
        title="Disabled card"
        description="One card is unavailable. It keeps a faint edge, its text dims, and it does not respond to hover."
        wide
      >
        <RadioProvider defaultValue="pro">
          <RadioCardGrid
            aria-label="Plan"
            $minItemSize="16rem"
            className="w-full"
          >
            {plans.map((plan) => (
              <RadioCard
                key={plan.value}
                value={plan.value}
                disabled={plan.value === "enterprise" || undefined}
              >
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>{plan.label}</RadioCardLabel>
                  <RadioCardDescription>
                    {plan.description}
                  </RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioProvider>
      </Example>

      <Example
        title="Disabled card grid"
        description="A disabled grid disables every card, including the checked one, which drops its tint."
        wide
      >
        <RadioProvider defaultValue="pro">
          <RadioCardGrid
            aria-label="Plan"
            $minItemSize="16rem"
            className="w-full"
            disabled
          >
            {plans.map((plan) => (
              <RadioCard key={plan.value} value={plan.value}>
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>{plan.label}</RadioCardLabel>
                  <RadioCardDescription>
                    {plan.description}
                  </RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioProvider>
      </Example>
    </ExampleGrid>
  );
}

export default RadioExamples;
