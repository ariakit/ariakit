/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
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
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import * as icons from "lucide-react";
import { useId, useState } from "react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";

interface Feature {
  value: string;
  label: string;
  description: string;
  icon: icons.LucideIcon;
}

const features: Feature[] = [
  {
    value: "analytics",
    label: "Analytics",
    description: "Usage and retention",
    icon: icons.ChartBar,
  },
  {
    value: "alerts",
    label: "Alerts",
    description: "Email and push",
    icon: icons.Bell,
  },
  {
    value: "exports",
    label: "Exports",
    description: "CSV and JSON",
    icon: icons.Download,
  },
  {
    value: "api",
    label: "API access",
    description: "Keys and webhooks",
    icon: icons.Code,
  },
];

// A drawn portrait instead of a network image, so the screenshots do not depend
// on a remote service. An avatar slot is made for images; text initials
// overflow its disc.
const avatarSource = `data:image/svg+xml,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">',
    '<rect width="48" height="48" fill="#f3c5a8"/>',
    '<path d="M8 48c1-10 8-15 16-15s15 5 16 15z" fill="#3b6f8f"/>',
    '<circle cx="24" cy="21" r="9" fill="#8a5a44"/>',
    '<path d="M14 21c0-8 5-12 10-12s11 4 11 12c-3-4-7-6-11-6s-7 2-10 6z" fill="#2d2420"/>',
    "</svg>",
  ].join(""),
)}`;

// Mapped cards pass undefined instead of false, which keeps the prop out of the
// unchecked cards' snippets.
function checkedOnly(checked: boolean) {
  return checked || undefined;
}

function toggleValue(values: string[], value: string, checked: boolean) {
  if (checked) return [...values, value];
  return values.filter((item) => item !== value);
}

/**
 * The tri-state pattern: the parent reflects its children and references them
 * with aria-controls, and the children sit in a labeled group.
 */
function SelectAll() {
  const id = useId();
  const [selected, setSelected] = useState(["alerts"]);
  const all = selected.length === features.length;
  const some = selected.length > 0 && !all;
  const getChildId = (feature: Feature) => `${id}-${feature.value}`;
  return (
    <div className="grid gap-1">
      <CheckboxField
        checked={all ? true : some ? "mixed" : false}
        aria-controls={features.map(getChildId).join(" ")}
        onChange={() => {
          setSelected(all ? [] : features.map((feature) => feature.value));
        }}
      >
        <CheckboxLabel>All features</CheckboxLabel>
      </CheckboxField>
      <div role="group" aria-label="Features" className="grid gap-1 ps-6">
        {features.map((feature) => (
          <CheckboxField
            key={feature.value}
            id={getChildId(feature)}
            checked={selected.includes(feature.value)}
            onChange={(event) => {
              const { checked } = event.target;
              setSelected((values) =>
                toggleValue(values, feature.value, checked),
              );
            }}
          >
            <CheckboxLabel>{feature.label}</CheckboxLabel>
          </CheckboxField>
        ))}
      </div>
    </div>
  );
}

function CountedCardGrid() {
  const [selected, setSelected] = useState(["analytics"]);
  return (
    <div className="grid w-full gap-3">
      <CheckboxCardGrid aria-label="Features" $minItemSize="11rem">
        {features.map((feature) => (
          <CheckboxCard
            key={feature.value}
            value={feature.value}
            checked={selected.includes(feature.value)}
            onChange={(event) => {
              const { checked } = event.target;
              setSelected((values) =>
                toggleValue(values, feature.value, checked),
              );
            }}
          >
            <CheckboxCardSlot>
              <feature.icon />
            </CheckboxCardSlot>
            <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
        ))}
      </CheckboxCardGrid>
      <Text render={<p />} className="ak-ink-70 text-sm">
        {selected.length} of {features.length} selected
      </Text>
    </div>
  );
}

export function CheckboxExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The bare input draws its own box without a row, for table cells and custom labels."
      >
        <Checkbox aria-label="Select row" defaultChecked />
      </Example>

      <Example
        title="Checkbox field"
        description="A label row that pairs the box with its label. The whole row toggles the box, and hovering it lights the box."
      >
        <CheckboxField>
          <CheckboxLabel>Remember me</CheckboxLabel>
        </CheckboxField>
      </Example>

      <Example
        title="Field with description"
        description="The box lines up with the first line, and the description sits under the label."
      >
        <CheckboxField defaultChecked>
          <CheckboxLabel>Product updates</CheckboxLabel>
          <CheckboxDescription>
            New features and changes to the API
          </CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Disabled field"
        description="The row text dims, and the empty box keeps a faint edge so it does not disappear."
      >
        <CheckboxField disabled>
          <CheckboxLabel>Beta program</CheckboxLabel>
          <CheckboxDescription>Not available on this plan</CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Disabled checked field"
        description="A disabled box keeps its mark on a neutral fill instead of brand."
      >
        <CheckboxField disabled defaultChecked>
          <CheckboxLabel>Security alerts</CheckboxLabel>
          <CheckboxDescription>Required for every account</CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Large field"
        description="One size step scales the box, the gap and the text together."
      >
        <CheckboxField $size="lg" defaultChecked>
          <CheckboxLabel>Weekly digest</CheckboxLabel>
          <CheckboxDescription>
            A summary of the week, every Monday
          </CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Select all"
        description="A parent box shows whether all, some or none of its children are checked, and toggles all of them."
        code={
          <>
            <CheckboxField checked="mixed">
              <CheckboxLabel>All features</CheckboxLabel>
            </CheckboxField>
            <CheckboxField checked={false}>
              <CheckboxLabel>Analytics</CheckboxLabel>
            </CheckboxField>
            <CheckboxField checked>
              <CheckboxLabel>Alerts</CheckboxLabel>
            </CheckboxField>
          </>
        }
      >
        <SelectAll />
      </Example>

      <Example
        title="Checkbox card"
        description="A card-shaped label around a hidden input. Keyboard focus draws the ring around the whole card."
      >
        <CheckboxCard value="analytics" {...screenshotFocus}>
          <CheckboxCardCheck />
          <CheckboxCardLabel>Analytics</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Disabled checked card"
        description="A disabled card keeps a faint edge and does not tint, even when checked."
      >
        <CheckboxCard value="exports" disabled defaultChecked>
          <CheckboxCardCheck />
          <CheckboxCardLabel>Exports</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Mixed card"
        description="A card in the mixed state tints like a checked card, and its check draws a dash."
      >
        <CheckboxCard value="all" checked="mixed" onChange={() => {}}>
          <CheckboxCardCheck />
          <CheckboxCardLabel>All features</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Card with description"
        description="Descriptions truncate by default. This one wraps, and the check stays on the first line."
      >
        <CheckboxCard value="analytics" defaultChecked className="max-w-80">
          <CheckboxCardCheck />
          <CheckboxCardContent>
            <CheckboxCardLabel>Analytics</CheckboxCardLabel>
            <CheckboxCardDescription $truncate={false}>
              Usage, retention and funnel reports, refreshed every hour
            </CheckboxCardDescription>
          </CheckboxCardContent>
        </CheckboxCard>
      </Example>

      <Example
        title="Card with avatar"
        description="An avatar slot shows a person's image, and the check moves to the end of the row."
      >
        <CheckboxCard value="maya" defaultChecked>
          <CheckboxCardSlot $kind="avatar">
            <img alt="" src={avatarSource} />
          </CheckboxCardSlot>
          <CheckboxCardContent>
            <CheckboxCardLabel>Maya Chen</CheckboxCardLabel>
            <CheckboxCardDescription>Designer</CheckboxCardDescription>
          </CheckboxCardContent>
          <CheckboxCardCheck />
        </CheckboxCard>
      </Example>

      <Example
        title="Stacked tiles"
        description="Each card is a tile: the icon and the check share the top row, and the label and description fill the row below."
        wide
      >
        <CheckboxCardGrid
          aria-label="Features"
          $minItemSize="14rem"
          className="w-full"
        >
          {features.map((feature) => (
            <CheckboxCard
              key={feature.value}
              value={feature.value}
              defaultChecked={checkedOnly(feature.value === "alerts")}
              $orientation="vertical"
              $p={4}
            >
              <CheckboxCardSlot
                $size="2xl"
                $layer="brand"
                $mix={20}
                $rounded="lg"
              >
                <feature.icon />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
                <CheckboxCardDescription>
                  {feature.description}
                </CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
          ))}
        </CheckboxCardGrid>
      </Example>

      <Example
        title="Card grid"
        description="Cards packed into equal rows. The count under the grid follows the checked cards."
        code={
          <CheckboxCardGrid $minItemSize="11rem">
            <CheckboxCard value="analytics" checked>
              <CheckboxCardSlot>
                <icons.ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Analytics</CheckboxCardLabel>
              <CheckboxCardCheck />
            </CheckboxCard>
            <CheckboxCard value="alerts" checked={false}>
              <CheckboxCardSlot>
                <icons.Bell />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Alerts</CheckboxCardLabel>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
        }
      >
        <CountedCardGrid />
      </Example>

      <Example
        title="Floating check"
        description="The check becomes a stamp in the card's top-end corner and shows only while the card is checked."
      >
        <CheckboxCardGrid aria-label="Features" className="w-full">
          {features.map((feature, index) => (
            <CheckboxCard
              key={feature.value}
              value={feature.value}
              defaultChecked={checkedOnly(
                index === 0 || index === features.length - 1,
              )}
            >
              <CheckboxCardSlot>
                <feature.icon />
              </CheckboxCardSlot>
              <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
              <CheckboxCardCheck $floating />
            </CheckboxCard>
          ))}
        </CheckboxCardGrid>
      </Example>

      <Example
        title="Round check"
        description="A fully round check on a checked card. Keep it for checked states: an empty round check reads as a radio."
      >
        <CheckboxCard value="weekly" defaultChecked>
          <CheckboxCardCheck $rounded="full" />
          <CheckboxCardLabel>Weekly report</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Custom mark"
        description="A child replaces the drawn mark and, like it, shows only while the card is checked."
      >
        <CheckboxCard value="starred" defaultChecked>
          <CheckboxCardCheck>
            <icons.Star />
          </CheckboxCardCheck>
          <CheckboxCardLabel>Starred</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Filter chips"
        description="Small pill cards in a wrapping row, used as a set of filters. Each chip keeps its check, so its state does not rest on color alone."
      >
        <div role="group" aria-label="Tags" className="flex flex-wrap gap-2">
          {["Design", "Docs", "Engineering", "Marketing"].map((tag, index) => (
            <CheckboxCard
              key={tag}
              value={tag.toLowerCase()}
              defaultChecked={checkedOnly(index % 2 === 0)}
              $rounded="full"
              $size="sm"
            >
              <CheckboxCardCheck />
              <CheckboxCardLabel>{tag}</CheckboxCardLabel>
            </CheckboxCard>
          ))}
        </div>
      </Example>

      <Example
        title="Fields on a brand layer"
        description="A checked box moves its fill away from the brand surface, and an unchecked box sinks into it."
      >
        <Frame
          $layer="brand"
          $rounded="xl"
          $p={4}
          className="grid w-full gap-1"
        >
          <CheckboxField defaultChecked>
            <CheckboxLabel>Email me</CheckboxLabel>
          </CheckboxField>
          <CheckboxField>
            <CheckboxLabel>Push notifications</CheckboxLabel>
            <CheckboxDescription>On every device</CheckboxDescription>
          </CheckboxField>
        </Frame>
      </Example>

      <Example
        title="Cards on a brand layer"
        description="A checked card moves its tint away from the brand surface, so it still stands apart from the unchecked card."
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="w-full">
          <CheckboxCardGrid aria-label="Add-ons">
            <CheckboxCard value="exports" defaultChecked>
              <CheckboxCardCheck />
              <CheckboxCardContent>
                <CheckboxCardLabel>Exports</CheckboxCardLabel>
                <CheckboxCardDescription>CSV and JSON</CheckboxCardDescription>
              </CheckboxCardContent>
            </CheckboxCard>
            <CheckboxCard value="api">
              <CheckboxCardCheck />
              <CheckboxCardContent>
                <CheckboxCardLabel>API access</CheckboxCardLabel>
                <CheckboxCardDescription>
                  Keys and webhooks
                </CheckboxCardDescription>
              </CheckboxCardContent>
            </CheckboxCard>
          </CheckboxCardGrid>
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default CheckboxExamples;
