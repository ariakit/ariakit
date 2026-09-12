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
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

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

export default function RadioExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Group"
        description="A group of label rows. The checked input fills brand with a dot, and the other inputs sink into the surface."
        code={`
          <RadioProvider>
            <RadioGroup>
              <RadioField value="hobby">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioGroup>
          </RadioProvider>
        `}
      >
        <RadioProvider defaultValue="pro">
          <RadioGroup aria-label="Plan" className="grid gap-1">
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioGroup>
        </RadioProvider>
      </Example>

      <Example
        title="Descriptions"
        description="Each row stacks a description under its label, and the radio lines up with the first line."
        code={`
          <RadioProvider>
            <RadioGroup>
              <RadioField value="hobby">
                <RadioLabel>Hobby</RadioLabel>
                <RadioDescription>…</RadioDescription>
              </RadioField>
              <RadioField value="pro">
                <RadioLabel>Pro</RadioLabel>
                <RadioDescription>…</RadioDescription>
              </RadioField>
              <RadioField value="enterprise">
                <RadioLabel>Enterprise</RadioLabel>
                <RadioDescription>…</RadioDescription>
              </RadioField>
            </RadioGroup>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioGroup>
              <RadioField value="hobby" $size="sm">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro" $size="sm">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise" $size="sm">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioGroup>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioGroup>
              Ship to
              <Radio value="home" />
              Home
              <Radio value="office" />
              Office
            </RadioGroup>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioGroup>
              <RadioField value="monthly">
                <RadioLabel>Monthly</RadioLabel>
              </RadioField>
              <RadioField value="yearly">
                <RadioLabel>Yearly</RadioLabel>
              </RadioField>
              <RadioField value="lifetime" disabled>
                <RadioLabel>Lifetime</RadioLabel>
                <RadioDescription>…</RadioDescription>
              </RadioField>
            </RadioGroup>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioGroup disabled>
              <RadioField value="hobby">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioGroup>
          </RadioProvider>
        `}
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
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <RadioProvider>
              <RadioGroup>
                <RadioField value="hobby">
                  <RadioLabel>Hobby</RadioLabel>
                </RadioField>
                <RadioField value="pro">
                  <RadioLabel>Pro</RadioLabel>
                </RadioField>
                <RadioField value="enterprise">
                  <RadioLabel>Enterprise</RadioLabel>
                </RadioField>
              </RadioGroup>
            </RadioProvider>
          </Frame>
        `}
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
        code={`
          <RadioProvider>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="hobby">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Hobby</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="pro">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Pro</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="enterprise">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Enterprise</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            </RadioCardGrid>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="card" $orientation="vertical" $p={4}>
                <RadioCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                  <CreditCard />
                </RadioCardSlot>
                <RadioCardContent>
                  <RadioCardLabel>Card</RadioCardLabel>
                  <RadioCardDescription>Visa, Mastercard, Amex</RadioCardDescription>
                </RadioCardContent>
                <RadioCardCheck />
              </RadioCard>
              <RadioCard value="wallet" $orientation="vertical" $p={4}>
                <RadioCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                  <Wallet />
                </RadioCardSlot>
                <RadioCardContent>
                  <RadioCardLabel>Wallet</RadioCardLabel>
                  <RadioCardDescription>Apple Pay, Google Pay</RadioCardDescription>
                </RadioCardContent>
                <RadioCardCheck />
              </RadioCard>
              <RadioCard value="bank" $orientation="vertical" $p={4}>
                <RadioCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                  <Landmark />
                </RadioCardSlot>
                <RadioCardContent>
                  <RadioCardLabel>Bank transfer</RadioCardLabel>
                  <RadioCardDescription>Two to three days</RadioCardDescription>
                </RadioCardContent>
                <RadioCardCheck />
              </RadioCard>
            </RadioCardGrid>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="hobby">
                <RadioCardCheck $mark="check" />
                <RadioCardContent>
                  <RadioCardLabel>Hobby</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="pro">
                <RadioCardCheck $mark="check" />
                <RadioCardContent>
                  <RadioCardLabel>Pro</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="enterprise">
                <RadioCardCheck $mark="check" />
                <RadioCardContent>
                  <RadioCardLabel>Enterprise</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            </RadioCardGrid>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="hobby">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Hobby</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="pro">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Pro</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="enterprise" disabled>
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Enterprise</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            </RadioCardGrid>
          </RadioProvider>
        `}
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
        code={`
          <RadioProvider>
            <RadioCardGrid $minItemSize="16rem" disabled>
              <RadioCard value="hobby">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Hobby</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="pro">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Pro</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="enterprise">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabel>Enterprise</RadioCardLabel>
                  <RadioCardDescription>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            </RadioCardGrid>
          </RadioProvider>
        `}
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
