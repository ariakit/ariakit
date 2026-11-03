/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Radio,
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardDescription,
  RadioCardGrid,
  RadioCardLabel,
  RadioCardLabelRow,
  RadioCardSlot,
  RadioDescription,
  RadioField,
  RadioGroup,
  RadioLabel,
  RadioList,
} from "@ariakit/ui/components/radio.ariakit.react";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import { useState } from "react";
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
  const [disabled, setDisabled] = useState(true);
  return (
    <ExampleGrid>
      <Example
        title="Group"
        description="A group of label rows. The checked input fills with brand and draws a bullet in its center, and the other inputs sink into the surface. Hovering the checked row does not light it, because a click does not change it."
        code={`
          <RadioGroup>
            <RadioList>
              <RadioField value="hobby">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan">
          <RadioList>
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Labeled group"
        description="The label names the group and sits above the rows with the group gap. The group keeps its own value, so it needs no provider."
        code={`
          <RadioGroup label="Plan" defaultValue="pro">
            <RadioList>
              <RadioField value="hobby">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup label="Plan" defaultValue="pro">
          <RadioList>
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Descriptions"
        description="Each row stacks a description under its label, and the radio lines up with the first line."
        code={`
          <RadioGroup>
            <RadioList>
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
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan">
          <RadioList>
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
                <RadioDescription>{plan.description}</RadioDescription>
              </RadioField>
            ))}
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Small horizontal group"
        description="A compact row of choices. The smaller size scales the text, the dot and the gap together."
        code={`
          <RadioGroup>
            <RadioList className="flex-row flex-wrap gap-x-4 gap-y-2">
              <RadioField value="hobby" $size="sm">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro" $size="sm">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise" $size="sm">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan">
          <RadioList className="flex-row flex-wrap gap-x-4 gap-y-2">
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value} $size="sm">
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Inline radios"
        description="A bare radio inside a plain label sits on a line of text, centered on the x-height, with no row around it."
        code={`
          <RadioGroup className="block">
            Ship to
            <Radio value="home" />
            Home
            <Radio value="office" />
            Office
          </RadioGroup>
        `}
      >
        {/*
          The group replaces its flex layout with a block display: a flex layout
          would blockify the radios and take them off the line of text.
        */}
        <RadioGroup
          defaultValue="office"
          aria-label="Ship to"
          className="block"
        >
          Ship to{" "}
          <label>
            <Radio value="home" /> Home
          </label>{" "}
          <label>
            <Radio value="office" /> Office
          </label>
        </RadioGroup>
      </Example>

      <Example
        title="Disabled option"
        description="One option is unavailable. Its text dims, its empty radio keeps a faint edge, and the other options stay interactive."
        code={`
          <RadioGroup>
            <RadioList>
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
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="yearly" aria-label="Billing">
          <RadioList>
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
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Disabled group"
        description="A disabled group disables every row. The checked radio keeps its dot on a neutral fill."
        code={`
          <RadioGroup disabled>
            <RadioList>
              <RadioField value="hobby">
                <RadioLabel>Hobby</RadioLabel>
              </RadioField>
              <RadioField value="pro">
                <RadioLabel>Pro</RadioLabel>
              </RadioField>
              <RadioField value="enterprise">
                <RadioLabel>Enterprise</RadioLabel>
              </RadioField>
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan" disabled>
          <RadioList>
            {plans.map((plan) => (
              <RadioField key={plan.value} value={plan.value}>
                <RadioLabel>{plan.label}</RadioLabel>
              </RadioField>
            ))}
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Group on a brand layer"
        description="The checked radio moves its fill away from the brand surface, and the unchecked radios sink into it."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <RadioGroup>
              <RadioList>
                <RadioField value="hobby">
                  <RadioLabel>Hobby</RadioLabel>
                </RadioField>
                <RadioField value="pro">
                  <RadioLabel>Pro</RadioLabel>
                </RadioField>
                <RadioField value="enterprise">
                  <RadioLabel>Enterprise</RadioLabel>
                </RadioField>
              </RadioList>
            </RadioGroup>
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="w-full">
          <RadioGroup defaultValue="pro" aria-label="Plan">
            <RadioList>
              {plans.map((plan) => (
                <RadioField key={plan.value} value={plan.value}>
                  <RadioLabel>{plan.label}</RadioLabel>
                </RadioField>
              ))}
            </RadioList>
          </RadioGroup>
        </Frame>
      </Example>

      <Example
        title="Cards"
        description="Card-shaped labels with a dot at the start. The checked card tints toward brand, and the radio group holds the grid of cards."
        wide
        code={`
          <RadioGroup>
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
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan" className="w-full">
          <RadioCardGrid $minItemSize="16rem">
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
        </RadioGroup>
      </Example>

      <Example
        title="Labeled cards"
        description="The label sits above the grid at its own height with the group gap, and the cards keep equal rows below it."
        wide
        code={`
          <RadioGroup label="Plan" defaultValue="pro">
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
          </RadioGroup>
        `}
      >
        <RadioGroup label="Plan" defaultValue="pro" className="w-full">
          <RadioCardGrid $minItemSize="16rem">
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
        </RadioGroup>
      </Example>

      <Example
        title="Label rows"
        description="The badge shares a row with the label, so the description takes the full width below them. In the narrow card, the badge wraps below the label."
        wide
        code={`
          <RadioGroup aria-label="Framework" defaultValue="react">
            <RadioList className="items-start">
              <RadioCard value="react">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabelRow>
                    <RadioCardLabel>React</RadioCardLabel>
                    <RadioCardSlot $kind="box">
                      <Badge $kind="solid">Recommended</Badge>
                    </RadioCardSlot>
                  </RadioCardLabelRow>
                  <RadioCardDescription $truncate={false}>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
              <RadioCard value="none" className="w-56">
                <RadioCardCheck />
                <RadioCardContent>
                  <RadioCardLabelRow>
                    <RadioCardLabel>No framework</RadioCardLabel>
                    <RadioCardSlot $kind="box">
                      <Badge $kind="solid">Lightest</Badge>
                    </RadioCardSlot>
                  </RadioCardLabelRow>
                  <RadioCardDescription $truncate={false}>…</RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup
          aria-label="Framework"
          defaultValue="react"
          className="w-full"
        >
          <RadioList className="items-start">
            <RadioCard value="react" className="w-full">
              <RadioCardCheck />
              <RadioCardContent>
                <RadioCardLabelRow>
                  <RadioCardLabel>React</RadioCardLabel>
                  <RadioCardSlot $kind="box">
                    <Badge $kind="solid">Recommended</Badge>
                  </RadioCardSlot>
                </RadioCardLabelRow>
                <RadioCardDescription $truncate={false}>
                  Most examples and the widest ecosystem, with server rendering
                  and a large set of libraries for forms, data, and tests
                </RadioCardDescription>
              </RadioCardContent>
            </RadioCard>
            <RadioCard value="none" className="w-56">
              <RadioCardCheck />
              <RadioCardContent>
                <RadioCardLabelRow>
                  <RadioCardLabel>No framework</RadioCardLabel>
                  <RadioCardSlot $kind="box">
                    <Badge $kind="solid">Lightest</Badge>
                  </RadioCardSlot>
                </RadioCardLabelRow>
                <RadioCardDescription $truncate={false}>
                  Plain HTML and a little JavaScript
                </RadioCardDescription>
              </RadioCardContent>
            </RadioCard>
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Stacked tiles"
        description="Each card is a tile: the icon and the dot share the top row, and the label and description fill the row below."
        wide
        code={`
          <RadioGroup>
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
          </RadioGroup>
        `}
      >
        <RadioGroup
          defaultValue="card"
          aria-label="Payment method"
          className="w-full"
        >
          <RadioCardGrid $minItemSize="16rem">
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
        </RadioGroup>
      </Example>

      <Example
        title="Check mark"
        description="The round box draws a check instead of the default dot."
        wide
        code={`
          <RadioGroup>
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
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan" className="w-full">
          <RadioCardGrid $minItemSize="16rem">
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
        </RadioGroup>
      </Example>

      <Example
        title="Floating check"
        description="The mark becomes a check in the card's top-end corner, takes its colors from the surface around the card, and shows only while the card is checked."
        wide
        code={`
          <RadioGroup>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="card">
                <RadioCardSlot>
                  <CreditCard />
                </RadioCardSlot>
                <RadioCardLabel>Card</RadioCardLabel>
                <RadioCardCheck $floating />
              </RadioCard>
              <RadioCard value="wallet">
                <RadioCardSlot>
                  <Wallet />
                </RadioCardSlot>
                <RadioCardLabel>Wallet</RadioCardLabel>
                <RadioCardCheck $floating />
              </RadioCard>
              <RadioCard value="bank">
                <RadioCardSlot>
                  <Landmark />
                </RadioCardSlot>
                <RadioCardLabel>Bank transfer</RadioCardLabel>
                <RadioCardCheck $floating />
              </RadioCard>
            </RadioCardGrid>
          </RadioGroup>
        `}
      >
        <RadioGroup
          defaultValue="card"
          aria-label="Payment method"
          className="w-full"
        >
          <RadioCardGrid $minItemSize="16rem">
            {paymentMethods.map((method) => (
              <RadioCard key={method.value} value={method.value}>
                <RadioCardSlot>
                  <method.icon />
                </RadioCardSlot>
                <RadioCardLabel>{method.label}</RadioCardLabel>
                <RadioCardCheck $floating />
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioGroup>
      </Example>

      <Example
        title="Cards without a mark"
        description="Without a mark, the checked card draws a second edge pixel inside its border, so its state does not rest on color alone."
        wide
        code={`
          <RadioGroup>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="card">
                <RadioCardSlot>
                  <CreditCard />
                </RadioCardSlot>
                <RadioCardLabel>Card</RadioCardLabel>
              </RadioCard>
              <RadioCard value="wallet">
                <RadioCardSlot>
                  <Wallet />
                </RadioCardSlot>
                <RadioCardLabel>Wallet</RadioCardLabel>
              </RadioCard>
              <RadioCard value="bank">
                <RadioCardSlot>
                  <Landmark />
                </RadioCardSlot>
                <RadioCardLabel>Bank transfer</RadioCardLabel>
              </RadioCard>
            </RadioCardGrid>
          </RadioGroup>
        `}
      >
        <RadioGroup
          defaultValue="card"
          aria-label="Payment method"
          className="w-full"
        >
          <RadioCardGrid $minItemSize="16rem">
            {paymentMethods.map((method) => (
              <RadioCard key={method.value} value={method.value}>
                <RadioCardSlot>
                  <method.icon />
                </RadioCardSlot>
                <RadioCardLabel>{method.label}</RadioCardLabel>
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioGroup>
      </Example>

      <Example
        title="Thick cards without a mark"
        description="With a 2px border, the checked card still adds an edge pixel inside it. Forced colors draw a 3px border on the checked card."
        wide
        code={`
          <RadioGroup>
            <RadioCardGrid $minItemSize="16rem">
              <RadioCard value="card" $border={2}>
                <RadioCardLabel>Card</RadioCardLabel>
              </RadioCard>
              <RadioCard value="wallet" $border={2}>
                <RadioCardLabel>Wallet</RadioCardLabel>
              </RadioCard>
              <RadioCard value="bank" $border={2}>
                <RadioCardLabel>Bank transfer</RadioCardLabel>
              </RadioCard>
            </RadioCardGrid>
          </RadioGroup>
        `}
      >
        <RadioGroup
          defaultValue="card"
          aria-label="Payment method"
          className="w-full"
        >
          <RadioCardGrid $minItemSize="16rem">
            {paymentMethods.map((method) => (
              <RadioCard key={method.value} value={method.value} $border={2}>
                <RadioCardLabel>{method.label}</RadioCardLabel>
              </RadioCard>
            ))}
          </RadioCardGrid>
        </RadioGroup>
      </Example>

      <Example
        title="Card edge weights"
        description="On dark surfaces, cards default to a light edge. $darkEdgeWeight replaces it there, and $edgeWeight applies on every surface."
        wide
        code={`
          <RadioGroup>
            <RadioCardGrid $minItemSize="10rem">
              <RadioCard value="named" $darkEdgeWeight="bold">
                <RadioCardLabel>Dark bold</RadioCardLabel>
              </RadioCard>
              <RadioCard value="number" $darkEdgeWeight={25}>
                <RadioCardLabel>Dark 25</RadioCardLabel>
              </RadioCard>
              <RadioCard value="all" $edgeWeight="bold">
                <RadioCardLabel>Bold</RadioCardLabel>
              </RadioCard>
            </RadioCardGrid>
          </RadioGroup>
        `}
      >
        <RadioGroup aria-label="Edge weight" className="w-full">
          <RadioCardGrid $minItemSize="10rem">
            <RadioCard value="named" $darkEdgeWeight="bold">
              <RadioCardLabel>Dark bold</RadioCardLabel>
            </RadioCard>
            <RadioCard value="number" $darkEdgeWeight={25}>
              <RadioCardLabel>Dark 25</RadioCardLabel>
            </RadioCard>
            <RadioCard value="all" $edgeWeight="bold">
              <RadioCardLabel>Bold</RadioCardLabel>
            </RadioCard>
          </RadioCardGrid>
        </RadioGroup>
      </Example>

      <Example
        title="Disabled card"
        description="One card is unavailable. It keeps a faint edge, its text dims, and it does not respond to hover."
        wide
        code={`
          <RadioGroup>
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
          </RadioGroup>
        `}
      >
        <RadioGroup defaultValue="pro" aria-label="Plan" className="w-full">
          <RadioCardGrid $minItemSize="16rem">
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
        </RadioGroup>
      </Example>

      <Example
        title="Disabled card grid"
        description="A disabled group disables every card in its grid, including the checked one, which drops its tint."
        wide
        code={`
          <RadioGroup disabled>
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
          </RadioGroup>
        `}
      >
        <RadioGroup
          defaultValue="pro"
          aria-label="Plan"
          className="w-full"
          disabled
        >
          <RadioCardGrid $minItemSize="16rem">
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
        </RadioGroup>
      </Example>
      <Example
        title="Disabled card slots"
        description="The disabled group fades the card's badge and avatar without a disabled prop on the card."
        code={`
          const [disabled, setDisabled] = useState(true);

          <Button onClick={() => setDisabled(!disabled)}>
            {disabled ? "Enable card grid" : "Disable card grid"}
          </Button>
          <RadioGroup defaultValue="jane" aria-label="Assignee" disabled={disabled}>
            <RadioCardGrid>
              <RadioCard value="jane">
                <RadioCardSlot $kind="avatar" $layer="brand">J</RadioCardSlot>
                <RadioCardLabel>Jane Doe</RadioCardLabel>
                <RadioCardSlot $kind="box">
                  <Badge $kind="solid">3</Badge>
                </RadioCardSlot>
              </RadioCard>
            </RadioCardGrid>
          </RadioGroup>
        `}
      >
        <Button onClick={() => setDisabled(!disabled)}>
          {disabled ? "Enable card grid" : "Disable card grid"}
        </Button>
        <RadioGroup
          defaultValue="jane"
          aria-label="Assignee"
          disabled={disabled}
        >
          <RadioCardGrid>
            <RadioCard value="jane">
              <RadioCardSlot $kind="avatar" $layer="brand">
                J
              </RadioCardSlot>
              <RadioCardLabel>Jane Doe</RadioCardLabel>
              <RadioCardSlot $kind="box">
                <Badge $kind="solid">3</Badge>
              </RadioCardSlot>
            </RadioCard>
          </RadioCardGrid>
        </RadioGroup>
      </Example>
      <Example
        title="Disabled card badges"
        description="Native and ARIA disabled cards use the same badge and text contrast."
        code={`
          <RadioGroup aria-label="Unavailable channels">
            <RadioCardGrid>
              <RadioCard value="email" disabled>
                <RadioCardLabel>Email</RadioCardLabel>
                <RadioCardSlot $kind="box">
                  <Badge $kind="solid">3</Badge>
                </RadioCardSlot>
              </RadioCard>
              <RadioCard value="messages" aria-disabled>
                <RadioCardLabel>Messages</RadioCardLabel>
                <RadioCardSlot $kind="box">
                  <Badge $kind="solid">3</Badge>
                </RadioCardSlot>
              </RadioCard>
            </RadioCardGrid>
          </RadioGroup>
        `}
      >
        <RadioGroup aria-label="Unavailable channels">
          <RadioCardGrid>
            <RadioCard value="email" disabled>
              <RadioCardLabel>Email</RadioCardLabel>
              <RadioCardSlot $kind="box">
                <Badge $kind="solid">3</Badge>
              </RadioCardSlot>
            </RadioCard>
            <RadioCard value="messages" aria-disabled>
              <RadioCardLabel>Messages</RadioCardLabel>
              <RadioCardSlot $kind="box">
                <Badge $kind="solid">3</Badge>
              </RadioCardSlot>
            </RadioCard>
          </RadioCardGrid>
        </RadioGroup>
      </Example>
      <Example
        title="Disabled field labels"
        description="Native and ARIA disabled fields use the same label and description contrast."
        code={`
          <RadioGroup aria-label="Unavailable notifications">
            <RadioList>
              <RadioField value="email" disabled>
                <RadioLabel>Email</RadioLabel>
                <RadioDescription>Receive email updates.</RadioDescription>
              </RadioField>
              <RadioField value="messages" aria-disabled>
                <RadioLabel>Messages</RadioLabel>
                <RadioDescription>Receive message updates.</RadioDescription>
              </RadioField>
            </RadioList>
          </RadioGroup>
        `}
      >
        <RadioGroup aria-label="Unavailable notifications">
          <RadioList>
            <RadioField value="email" disabled>
              <RadioLabel>Email</RadioLabel>
              <RadioDescription>Receive email updates.</RadioDescription>
            </RadioField>
            <RadioField value="messages" aria-disabled>
              <RadioLabel>Messages</RadioLabel>
              <RadioDescription>Receive message updates.</RadioDescription>
            </RadioField>
          </RadioList>
        </RadioGroup>
      </Example>

      <Example
        title="Tint and solid badges in box slots"
        description="A badge fills a box slot at the end of the card, with the same space at the end and at the top."
        code={`
          <RadioCard value="pro">
            <RadioCardLabel>Pro</RadioCardLabel>
            <RadioCardSlot $kind="box">
              <Badge $layer="success">Save 20%</Badge>
            </RadioCardSlot>
          </RadioCard>
          <RadioCard value="team">
            <RadioCardLabel>Team</RadioCardLabel>
            <RadioCardSlot $kind="box">
              <Badge $kind="solid" $round>3</Badge>
            </RadioCardSlot>
          </RadioCard>
        `}
      >
        <RadioGroup aria-label="Plans with badges">
          <RadioCardGrid>
            <RadioCard value="pro">
              <RadioCardLabel>Pro</RadioCardLabel>
              <RadioCardSlot $kind="box">
                <Badge $layer="success">Save 20%</Badge>
              </RadioCardSlot>
            </RadioCard>
            <RadioCard value="team">
              <RadioCardLabel>Team</RadioCardLabel>
              <RadioCardSlot $kind="box">
                <Badge $kind="solid" $round>
                  3
                </Badge>
              </RadioCardSlot>
            </RadioCard>
          </RadioCardGrid>
        </RadioGroup>
      </Example>
    </ExampleGrid>
  );
}
