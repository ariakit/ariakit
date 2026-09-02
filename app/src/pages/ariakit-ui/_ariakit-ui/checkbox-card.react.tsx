/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { CheckboxCardProps } from "@ariakit/ui/components/checkbox-card.ariakit.react.tsx";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardLabel,
  CheckboxCardSlot,
} from "@ariakit/ui/components/checkbox-card.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import * as icons from "lucide-react";
import * as React from "react";
import {
  Caption,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

interface Feature {
  value: string;
  label: string;
  description: string;
  icon: icons.LucideIcon;
}

const analytics: Feature = {
  value: "analytics",
  label: "Analytics",
  description: "Usage and retention",
  icon: icons.ChartBar,
};
const alerts: Feature = {
  value: "alerts",
  label: "Alerts",
  description: "Email and push",
  icon: icons.Bell,
};
const exportsFeature: Feature = {
  value: "exports",
  label: "Exports",
  description: "CSV and JSON",
  icon: icons.Download,
};
const api: Feature = {
  value: "api",
  label: "API access",
  description: "Keys and webhooks",
  icon: icons.Code,
};

const features = [analytics, alerts, exportsFeature, api];

/**
 * The checkbox card grid recipe has no component of its own, so the grid is
 * a plain element with the recipe's classes.
 */
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid auto-rows-fr gap-3 grid-cols-[repeat(auto-fill,minmax(min(100%,11rem),1fr))]">
      {children}
    </div>
  );
}

function FeatureCard({
  feature,
  ...props
}: CheckboxCardProps & { feature: Feature }) {
  return (
    <CheckboxCard value={feature.value} {...props}>
      <CheckboxCardCheck />
      <CheckboxCardContent>
        <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
        <CheckboxCardDescription>{feature.description}</CheckboxCardDescription>
      </CheckboxCardContent>
    </CheckboxCard>
  );
}

function CountedCards() {
  const [selected, setSelected] = React.useState<string[]>(["analytics"]);
  const toggle = (value: string, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current, value] : current.filter((item) => item !== value),
    );
  };
  return (
    <div className="grid gap-3">
      <CardGrid>
        {features.map((feature) => (
          <CheckboxCard
            key={feature.value}
            value={feature.value}
            checked={selected.includes(feature.value)}
            onChange={(event) => toggle(feature.value, event.target.checked)}
          >
            <CheckboxCardSlot>
              <feature.icon />
            </CheckboxCardSlot>
            <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
        ))}
      </CardGrid>
      <Caption>
        {selected.length} of {features.length} selected
      </Caption>
    </div>
  );
}

export function CheckboxCardSection() {
  return (
    <Samples>
      <Sample
        title="States"
        code="CheckboxCard defaultChecked · disabled · CheckboxCardCheck"
        description="A card-shaped label around a hidden checkbox. Checked cards tint toward brand and fill their check. Disabled cards keep a faint edge."
      >
        <Stage direction="column">
          <CheckboxCard value="unchecked">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Unchecked</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="checked" defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Checked</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="disabled" disabled>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Disabled</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="disabled-checked" disabled defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Disabled and checked</CheckboxCardLabel>
          </CheckboxCard>
        </Stage>
      </Sample>

      <Sample
        title="Descriptions and slots"
        code="CheckboxCardContent > CheckboxCardLabel + CheckboxCardDescription · CheckboxCardSlot"
        description="A description below the label, an icon slot before it, and the check moved to the end of the row."
      >
        <Stage direction="column">
          <FeatureCard feature={analytics} defaultChecked />
          <CheckboxCard value="slot">
            <CheckboxCardSlot>
              <icons.Bell />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabel>Icon slot</CheckboxCardLabel>
              <CheckboxCardDescription>
                Before the content
              </CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
          <CheckboxCard value="avatar" defaultChecked>
            <CheckboxCardSlot $kind="avatar" $layer="secondary">
              DH
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabel>Avatar slot</CheckboxCardLabel>
              <CheckboxCardDescription>
                Check at the end
              </CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        </Stage>
      </Sample>

      <Sample
        wide
        title="Grid"
        code="checkbox card grid recipe · controlled checked"
        description="Cards packed into equal rows. The count below is owned by the page."
      >
        <CountedCards />
      </Sample>

      <Sample
        title="Shapes"
        code='$rounded="full" · $size="sm" · $p={4} · $border={2}'
        description="The card takes the button's frame knobs, so it can be a pill, a compact chip or a heavier tile."
      >
        <Stage>
          <CheckboxCard value="pill" $rounded="full" defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Pill</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="small" $size="sm">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Small</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="large" $size="lg" $p={4} defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Large</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="border" $border={2} $rounded="2xl">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Thick border</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="no-check" $rounded="lg">
            <CheckboxCardSlot>
              <icons.Tag />
            </CheckboxCardSlot>
            <CheckboxCardLabel>No check indicator</CheckboxCardLabel>
          </CheckboxCard>
        </Stage>
      </Sample>

      <Sample
        title="Stacked content"
        code="Slot above a wrapped label and description"
        description="A tile with the icon on its own row, for image or icon led cards."
      >
        <CardGrid>
          {features.slice(0, 3).map((feature, index) => (
            <CheckboxCard
              key={feature.value}
              value={feature.value}
              defaultChecked={index === 1}
              className="items-start"
            >
              <CheckboxCardSlot
                $size="2xl"
                $layer="brand"
                $mix={20}
                $rounded="lg"
                className="mb-2"
              >
                <feature.icon />
              </CheckboxCardSlot>
              <CheckboxCardCheck className="ms-auto" />
              <CheckboxCardContent className="basis-full">
                <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
                <CheckboxCardDescription>
                  {feature.description}
                </CheckboxCardDescription>
              </CheckboxCardContent>
            </CheckboxCard>
          ))}
        </CardGrid>
      </Sample>

      <Sample
        title="On layers"
        code="CheckboxCard inside Layer"
        description="Cards lift unconditionally off the surface they sit on."
      >
        <SwatchGrid min="13rem">
          <Layer $lightnessOffset={2} className="grid gap-2 rounded-xl p-4">
            <Caption>Offset</Caption>
            <FeatureCard feature={alerts} />
            <FeatureCard feature={exportsFeature} defaultChecked />
          </Layer>
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <FeatureCard feature={alerts} />
            <FeatureCard feature={exportsFeature} defaultChecked />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <FeatureCard feature={alerts} />
            <FeatureCard feature={exportsFeature} defaultChecked />
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
