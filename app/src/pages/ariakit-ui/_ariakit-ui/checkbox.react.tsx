/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { CheckboxCardProps } from "@ariakit/ui/components/checkbox.ariakit.react.tsx";
import {
  Checkbox,
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardGrid,
  CheckboxCardLabel,
  CheckboxCardSlot,
  CheckboxDescription,
  CheckboxField,
  CheckboxLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react.tsx";
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
      <CheckboxCardGrid $minItemSize="11rem">
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
      </CheckboxCardGrid>
      <Caption>
        {selected.length} of {features.length} selected
      </Caption>
    </div>
  );
}

function MixedParent() {
  const [selected, setSelected] = React.useState<string[]>(["alerts"]);
  const all = selected.length === features.length;
  const some = selected.length > 0 && !all;
  return (
    <div className="grid gap-1">
      <CheckboxField
        checked={all ? true : some ? "mixed" : false}
        onChange={() => setSelected(all ? [] : features.map((f) => f.value))}
      >
        <CheckboxLabel>All features</CheckboxLabel>
      </CheckboxField>
      {features.map((feature) => (
        <CheckboxField
          key={feature.value}
          className="ms-6"
          checked={selected.includes(feature.value)}
          onChange={(event) =>
            setSelected((current) =>
              event.target.checked
                ? [...current, feature.value]
                : current.filter((value) => value !== feature.value),
            )
          }
        >
          <CheckboxLabel>{feature.label}</CheckboxLabel>
        </CheckboxField>
      ))}
    </div>
  );
}

export function CheckboxSection() {
  return (
    <Samples>
      <Sample
        title="States"
        code='Checkbox defaultChecked · checked="mixed" · disabled'
        description="The native input draws its own box: brand with a check when checked, a dash when mixed, a neutral fill with a dimmed mark when disabled."
      >
        <Stage>
          <Checkbox aria-label="Unchecked" />
          <Checkbox aria-label="Checked" defaultChecked />
          <Checkbox aria-label="Mixed" checked="mixed" onChange={() => {}} />
          <Checkbox aria-label="Disabled" disabled />
          <Checkbox aria-label="Disabled and checked" disabled defaultChecked />
          <Checkbox
            aria-label="Disabled and mixed"
            disabled
            checked="mixed"
            onChange={() => {}}
          />
        </Stage>
      </Sample>

      <Sample
        title="Field rows"
        code="CheckboxField > CheckboxLabel + CheckboxDescription"
        description="A label row holds the input, the label and a description. The box lines up with the first line, and hovering the row lights it."
      >
        <div className="grid gap-1">
          <CheckboxField>
            <CheckboxLabel>Label only</CheckboxLabel>
          </CheckboxField>
          <CheckboxField>
            <CheckboxLabel>Weekly digest</CheckboxLabel>
            <CheckboxDescription>
              A summary of the week, every Monday
            </CheckboxDescription>
          </CheckboxField>
          <CheckboxField defaultChecked>
            <CheckboxLabel>Product updates</CheckboxLabel>
            <CheckboxDescription>
              New features and changes to the API
            </CheckboxDescription>
          </CheckboxField>
          <CheckboxField disabled>
            <CheckboxLabel>Beta program</CheckboxLabel>
            <CheckboxDescription>
              Not available on this plan
            </CheckboxDescription>
          </CheckboxField>
        </div>
      </Sample>

      <Sample
        title="Sizes and shapes"
        code='CheckboxField $size · Checkbox $size="lg" | "xl" · $rounded="full" · $border={2}'
        description="Everything derives from the font size: the row's $size scales the box with the text, and a bare box takes the slot's own size scale and the frame's radius scale."
      >
        <Stage direction="column">
          <CheckboxField $size="xs" defaultChecked>
            <CheckboxLabel>Size xs</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $size="sm" defaultChecked>
            <CheckboxLabel>Size sm</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $size="md" defaultChecked>
            <CheckboxLabel>Size md</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $size="lg" defaultChecked>
            <CheckboxLabel>Size lg</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $size="xl" defaultChecked>
            <CheckboxLabel>Size xl</CheckboxLabel>
          </CheckboxField>
        </Stage>
        <Stage>
          <Checkbox aria-label="Large box" $size="lg" defaultChecked />
          <Checkbox aria-label="Extra large box" $size="xl" defaultChecked />
          <Checkbox aria-label="Round box" $rounded="full" defaultChecked />
          <Checkbox aria-label="Thick border box" $border={2} defaultChecked />
          <Checkbox aria-label="Square box" $rounded="none" defaultChecked />
        </Stage>
      </Sample>

      <Sample
        title="Mixed parent"
        code='checked="mixed" · controlled'
        description="A parent checkbox owned by the page reflects its children: all, none or some."
      >
        <MixedParent />
      </Sample>

      <Sample
        title="Focus"
        code="$focus={1 | 2 | 3} · $focusOffset={2}"
        description="Tab through the boxes; the ring is keyboard-only, like a button's, and belongs to the input, never to the row."
      >
        <Stage>
          <Checkbox aria-label="Thin ring" $focus={1} defaultChecked />
          <Checkbox aria-label="Default ring" defaultChecked />
          <Checkbox aria-label="Thick ring" $focus={3} defaultChecked />
          <Checkbox aria-label="Offset ring" $focusOffset={2} defaultChecked />
          <CheckboxField defaultChecked>
            <CheckboxLabel>Ring on the input</CheckboxLabel>
          </CheckboxField>
        </Stage>
      </Sample>

      <Sample
        title="Card states"
        code='CheckboxCard defaultChecked · checked="mixed" · disabled · CheckboxCardCheck'
        description="A card-shaped label around a hidden checkbox. Checked and mixed cards tint toward brand and fill their check. Disabled cards keep a faint edge."
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
          <CheckboxCard value="mixed" checked="mixed" onChange={() => {}}>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Mixed</CheckboxCardLabel>
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
        code="CheckboxCardGrid · controlled checked"
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
          <CheckboxCard value="round-check" $rounded="lg" defaultChecked>
            <CheckboxCardCheck $rounded="full" />
            <CheckboxCardLabel>Round check</CheckboxCardLabel>
          </CheckboxCard>
        </Stage>
      </Sample>

      <Sample
        title="Stacked content"
        code="Slot above a wrapped label and description"
        description="A tile with the icon on its own row, for image or icon led cards."
      >
        <CheckboxCardGrid $minItemSize="11rem">
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
              {index === 1 ? (
                <CheckboxCardCheck $floating />
              ) : (
                <CheckboxCardCheck className="ms-auto" />
              )}
              <CheckboxCardContent className="basis-full">
                <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
                <CheckboxCardDescription>
                  {feature.description}
                </CheckboxCardDescription>
              </CheckboxCardContent>
            </CheckboxCard>
          ))}
        </CheckboxCardGrid>
      </Sample>

      <Sample
        title="Floating check"
        code="CheckboxCardCheck $floating"
        description="A floating check is a stamp in the card's top-end corner. It shows only while the card is checked, so an empty corner never reads as a missing part."
      >
        <CheckboxCardGrid>
          {features.map((feature, index) => (
            <CheckboxCard
              key={feature.value}
              value={feature.value}
              defaultChecked={index === 0 || index === features.length - 1}
              disabled={index === features.length - 1}
            >
              <CheckboxCardSlot>
                <feature.icon />
              </CheckboxCardSlot>
              <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
              <CheckboxCardCheck $floating />
            </CheckboxCard>
          ))}
        </CheckboxCardGrid>
      </Sample>

      <Sample
        title="Custom mark"
        code="CheckboxCardCheck > svg"
        description="A child replaces the drawn mark and follows the same show-while-checked rule."
      >
        <Stage direction="column">
          <CheckboxCard value="starred" defaultChecked>
            <CheckboxCardCheck>
              <icons.Star />
            </CheckboxCardCheck>
            <CheckboxCardLabel>Starred</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="favourite">
            <CheckboxCardCheck>
              <icons.Heart />
            </CheckboxCardCheck>
            <CheckboxCardLabel>Favourite</CheckboxCardLabel>
          </CheckboxCard>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="CheckboxField and CheckboxCard inside Layer"
        description="Boxes sink into the surface they sit on; cards lift off it. Both fill brand pushed away from a brand layer."
      >
        <SwatchGrid min="13rem">
          <Layer $lightnessOffset={2} className="grid gap-2 rounded-xl p-4">
            <Caption>Offset</Caption>
            <CheckboxField defaultChecked>
              <CheckboxLabel>Label only</CheckboxLabel>
            </CheckboxField>
            <CheckboxField>
              <CheckboxLabel>{alerts.label}</CheckboxLabel>
              <CheckboxDescription>{alerts.description}</CheckboxDescription>
            </CheckboxField>
            <FeatureCard feature={exportsFeature} defaultChecked />
          </Layer>
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <CheckboxField defaultChecked>
              <CheckboxLabel>Label only</CheckboxLabel>
            </CheckboxField>
            <CheckboxField>
              <CheckboxLabel>{alerts.label}</CheckboxLabel>
              <CheckboxDescription>{alerts.description}</CheckboxDescription>
            </CheckboxField>
            <FeatureCard feature={exportsFeature} defaultChecked />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <CheckboxField defaultChecked>
              <CheckboxLabel>Label only</CheckboxLabel>
            </CheckboxField>
            <CheckboxField>
              <CheckboxLabel>{alerts.label}</CheckboxLabel>
              <CheckboxDescription>{alerts.description}</CheckboxDescription>
            </CheckboxField>
            <FeatureCard feature={exportsFeature} defaultChecked />
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
