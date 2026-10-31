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
  Badge,
  BadgeLabel,
  BadgeSlot,
} from "@ariakit/ui/components/badge.ariakit.react";
import {
  Checkbox,
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardGrid,
  CheckboxCardLabel,
  CheckboxCardLabelRow,
  CheckboxCardSlot,
  CheckboxDescription,
  CheckboxField,
  CheckboxLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import type { CheckboxCardCheckProps } from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import * as icons from "lucide-react";
import { ChartBar, Sparkles, Trash2 } from "lucide-react";
import type { AriaRole } from "react";
import { useId, useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

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
    <div className="grid gap-2">
      <CheckboxField
        checked={all ? true : some ? "mixed" : false}
        aria-controls={features.map(getChildId).join(" ")}
        onChange={() => {
          setSelected(all ? [] : features.map((feature) => feature.value));
        }}
      >
        <CheckboxLabel>All features</CheckboxLabel>
      </CheckboxField>
      {/* The children start where the text of All features starts: after the
          box and the gap of a field without padding. */}
      <div
        role="group"
        aria-label="Features"
        className="grid gap-2 ps-[1.4375em]"
      >
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

/**
 * App ids on the description and on a hint outside the field, such as a note
 * about a setting, that the checkbox reads after its own description.
 */
function FieldWithAppIds() {
  const descriptionId = useId();
  const hintId = useId();
  return (
    <div className="grid gap-1">
      <CheckboxField aria-describedby={hintId}>
        <CheckboxLabel>Usage reports</CheckboxLabel>
        <CheckboxDescription id={descriptionId}>
          Anonymous crash and usage data
        </CheckboxDescription>
      </CheckboxField>
      <Text id={hintId} render={<p />} className="ak-ink-70 text-sm">
        You can change this later in settings
      </Text>
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

interface FeatureGridProps {
  role?: AriaRole;
}

// Passes its optional role on as is, so the grid gets a role prop that is
// present but undefined.
function FeatureGrid({ role }: FeatureGridProps) {
  return (
    <CheckboxCardGrid aria-label="Optional role" role={role} className="w-full">
      {features.slice(0, 2).map((feature) => (
        <CheckboxCard key={feature.value} value={feature.value}>
          <CheckboxCardLabel>{feature.label}</CheckboxCardLabel>
          <CheckboxCardCheck />
        </CheckboxCard>
      ))}
    </CheckboxCardGrid>
  );
}

interface OptionalRoleProps {
  role?: AriaRole;
}

interface OptionalSwitchCardProps extends OptionalRoleProps {
  mark?: CheckboxCardCheckProps["$mark"];
}

// Passes its optional role on as is, so the input gets a role prop that is
// present but undefined.
function OptionalRoleSwitchField({ role }: OptionalRoleProps) {
  return (
    <CheckboxField role={role} $mark="switch">
      <CheckboxLabel>Optional role</CheckboxLabel>
    </CheckboxField>
  );
}

// Also passes its optional mark on to the check, which then keeps the mark of
// the card.
function OptionalPropsSwitchCard({ role, mark }: OptionalSwitchCardProps) {
  return (
    <CheckboxCard role={role} $mark="switch">
      <CheckboxCardLabel>Optional props</CheckboxCardLabel>
      <CheckboxCardCheck $mark={mark} />
    </CheckboxCard>
  );
}

export default function CheckboxExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The bare input draws its own box without a row, for table cells and custom labels."
        code={`
          <Checkbox defaultChecked />
        `}
      >
        <Checkbox aria-label="Select row" defaultChecked />
      </Example>

      <Example
        title="Checkbox field"
        description="A label row that pairs the box with its label. The whole row toggles the box, and hovering it lights the box."
        code={`
          <CheckboxField>
            <CheckboxLabel>Remember me</CheckboxLabel>
          </CheckboxField>
        `}
      >
        <CheckboxField>
          <CheckboxLabel>Remember me</CheckboxLabel>
        </CheckboxField>
      </Example>

      <Example
        title="Field with description"
        description="The box lines up with the first line, and the description sits under the label."
        code={`
          <CheckboxField defaultChecked>
            <CheckboxLabel>Product updates</CheckboxLabel>
            <CheckboxDescription>…</CheckboxDescription>
          </CheckboxField>
        `}
      >
        <CheckboxField defaultChecked>
          <CheckboxLabel>Product updates</CheckboxLabel>
          <CheckboxDescription>
            New features and changes to the API
          </CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Field with app ids"
        description="The description keeps its own id, and the app points the field at a hint below it. The checkbox reads its description first, then the hint."
        code={`
          <CheckboxField aria-describedby={hintId}>
            <CheckboxLabel>Usage reports</CheckboxLabel>
            <CheckboxDescription id={descriptionId}>…</CheckboxDescription>
          </CheckboxField>
          <Text id={hintId}>…</Text>
        `}
      >
        <FieldWithAppIds />
      </Example>

      <Example
        title="Disabled field"
        description="The row text dims, and the empty box keeps a faint edge so it does not disappear."
        code={`
          <CheckboxField disabled>
            <CheckboxLabel>Beta program</CheckboxLabel>
            <CheckboxDescription>…</CheckboxDescription>
          </CheckboxField>
        `}
      >
        <CheckboxField disabled>
          <CheckboxLabel>Beta program</CheckboxLabel>
          <CheckboxDescription>Not available on this plan</CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Disabled checked field"
        description="A disabled box keeps its mark on a neutral fill instead of brand."
        code={`
          <CheckboxField disabled defaultChecked>
            <CheckboxLabel>Security alerts</CheckboxLabel>
            <CheckboxDescription>…</CheckboxDescription>
          </CheckboxField>
        `}
      >
        <CheckboxField disabled defaultChecked>
          <CheckboxLabel>Security alerts</CheckboxLabel>
          <CheckboxDescription>Required for every account</CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Large field"
        description="One size step scales the box, the gap and the text together."
        code={`
          <CheckboxField $size="lg" defaultChecked>
            <CheckboxLabel>Weekly digest</CheckboxLabel>
            <CheckboxDescription>…</CheckboxDescription>
          </CheckboxField>
        `}
      >
        <CheckboxField $size="lg" defaultChecked>
          <CheckboxLabel>Weekly digest</CheckboxLabel>
          <CheckboxDescription>
            A summary of the week, every Monday
          </CheckboxDescription>
        </CheckboxField>
      </Example>

      <Example
        title="Bordered field"
        description="A border or a background makes the row visible, so the field keeps its padding around the box and the label. Without them, the box sits at the field edge."
        code={`
          <CheckboxField $border defaultChecked>
            <CheckboxLabel>Accept the terms</CheckboxLabel>
          </CheckboxField>
        `}
      >
        <CheckboxField $border defaultChecked>
          <CheckboxLabel>Accept the terms</CheckboxLabel>
        </CheckboxField>
      </Example>

      <Example
        title="Select all"
        description="A parent box shows whether all, some or none of its children are checked, and toggles all of them."
        code={`
          <div className="grid gap-2">
            <CheckboxField checked="mixed">
              <CheckboxLabel>All features</CheckboxLabel>
            </CheckboxField>
            <CheckboxField checked={false}>
              <CheckboxLabel>Analytics</CheckboxLabel>
            </CheckboxField>
            <CheckboxField checked>
              <CheckboxLabel>Alerts</CheckboxLabel>
            </CheckboxField>
          </div>
        `}
      >
        <SelectAll />
      </Example>

      <Example
        title="Checkbox card"
        description="A card-shaped label around a hidden input. Keyboard focus draws the ring around the whole card."
        code={`
          <CheckboxCard value="analytics">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Analytics</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="analytics">
          <CheckboxCardCheck />
          <CheckboxCardLabel>Analytics</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Disabled checked card"
        description="A disabled card keeps a faint edge and does not tint, even when checked."
        code={`
          <CheckboxCard value="exports" disabled defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Exports</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="exports" disabled defaultChecked>
          <CheckboxCardCheck />
          <CheckboxCardLabel>Exports</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Disabled inverted card"
        description="An inverted card and a bordered inverted row fade into the surface around them while disabled. A disabled fieldset fades them without the disabled prop."
        code={`
          <CheckboxCard value="exports" $invert disabled defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Exports</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxField $invert $border disabled>
            <CheckboxLabel>Beta program</CheckboxLabel>
          </CheckboxField>
          <fieldset disabled className="flex flex-wrap items-start gap-3">
            <CheckboxCard value="backups" $invert defaultChecked>
              <CheckboxCardCheck />
              <CheckboxCardLabel>Backups</CheckboxCardLabel>
            </CheckboxCard>
            <CheckboxField $invert $border>
              <CheckboxLabel>Early access</CheckboxLabel>
            </CheckboxField>
          </fieldset>
        `}
      >
        <CheckboxCard value="exports" $invert disabled defaultChecked>
          <CheckboxCardCheck />
          <CheckboxCardLabel>Exports</CheckboxCardLabel>
        </CheckboxCard>
        <CheckboxField $invert $border disabled>
          <CheckboxLabel>Beta program</CheckboxLabel>
        </CheckboxField>
        <fieldset disabled className="flex flex-wrap items-start gap-3">
          <CheckboxCard value="backups" $invert defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardLabel>Backups</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxField $invert $border>
            <CheckboxLabel>Early access</CheckboxLabel>
          </CheckboxField>
        </fieldset>
      </Example>

      <Example
        title="Disabled colors"
        description="A colored row fades into the surface around it while its input is disabled, so it does not look enabled. A disabled fieldset fades it without the disabled prop."
        code={`
          <CheckboxField $layer="brand" disabled defaultChecked>
            <CheckboxLabel>Weekly digest</CheckboxLabel>
          </CheckboxField>
          <fieldset disabled>
            <CheckboxField $layer="danger">
              <CheckboxLabel>Delete history</CheckboxLabel>
            </CheckboxField>
          </fieldset>
        `}
      >
        <CheckboxField $layer="brand" disabled defaultChecked>
          <CheckboxLabel>Weekly digest</CheckboxLabel>
        </CheckboxField>
        <fieldset disabled>
          <CheckboxField $layer="danger">
            <CheckboxLabel>Delete history</CheckboxLabel>
          </CheckboxField>
        </fieldset>
      </Example>

      <Example
        title="Mixed card"
        description="A card in the mixed state tints like a checked card, and its check draws a dash."
        code={`
          <CheckboxCard value="all" checked="mixed">
            <CheckboxCardCheck />
            <CheckboxCardLabel>All features</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="all" checked="mixed" onChange={() => {}}>
          <CheckboxCardCheck />
          <CheckboxCardLabel>All features</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Cards without a mark"
        description="Without a mark, checked and mixed cards draw a second edge pixel inside their border, so their state does not rest on color alone."
        code={`
          <CheckboxCard value="analytics" defaultChecked>
            <CheckboxCardLabel>Analytics</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="all" checked="mixed">
            <CheckboxCardLabel>All features</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="alerts">
            <CheckboxCardLabel>Alerts</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <div className="grid gap-3">
          <CheckboxCard value="analytics" defaultChecked>
            <CheckboxCardLabel>Analytics</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="all" checked="mixed" onChange={() => {}}>
            <CheckboxCardLabel>All features</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="alerts">
            <CheckboxCardLabel>Alerts</CheckboxCardLabel>
          </CheckboxCard>
        </div>
      </Example>

      <Example
        title="Card with description"
        description="Descriptions truncate by default. This one wraps, and the check stays on the first line."
        code={`
          <CheckboxCard value="analytics" defaultChecked>
            <CheckboxCardCheck />
            <CheckboxCardContent>
              <CheckboxCardLabel>Analytics</CheckboxCardLabel>
              <CheckboxCardDescription $truncate={false}>…</CheckboxCardDescription>
            </CheckboxCardContent>
          </CheckboxCard>
        `}
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
        code={`
          <CheckboxCard value="maya" defaultChecked>
            <CheckboxCardSlot $kind="avatar" />
            <CheckboxCardContent>
              <CheckboxCardLabel>Maya Chen</CheckboxCardLabel>
              <CheckboxCardDescription>Designer</CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        `}
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
        code={`
          <CheckboxCardGrid $minItemSize="14rem">
            <CheckboxCard value="analytics" $orientation="vertical" $p={4}>
              <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                <ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>Analytics</CheckboxCardLabel>
                <CheckboxCardDescription>Usage and retention</CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
            <CheckboxCard value="alerts" defaultChecked $orientation="vertical" $p={4}>
              <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                <Bell />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>Alerts</CheckboxCardLabel>
                <CheckboxCardDescription>Email and push</CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
            <CheckboxCard value="exports" $orientation="vertical" $p={4}>
              <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                <Download />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>Exports</CheckboxCardLabel>
                <CheckboxCardDescription>CSV and JSON</CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
            <CheckboxCard value="api" $orientation="vertical" $p={4}>
              <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                <Code />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>API access</CheckboxCardLabel>
                <CheckboxCardDescription>Keys and webhooks</CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
        `}
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
              defaultChecked={feature.value === "alerts"}
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
        title="Tiles with label rows"
        description="The badge shares a row with the label, so the description takes the full width below them. In the narrow tile, the badge wraps below the label."
        wide
        code={`
          <CheckboxCard value="reports" $orientation="vertical" $p={4}>
            <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
              <FileChartColumn />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabelRow>
                <CheckboxCardLabel>Reports</CheckboxCardLabel>
                <CheckboxCardSlot $kind="badge">Beta</CheckboxCardSlot>
              </CheckboxCardLabelRow>
              <CheckboxCardDescription $truncate={false}>…</CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        `}
      >
        <div className="flex w-full flex-wrap items-start gap-3">
          <CheckboxCard
            value="reports"
            defaultChecked
            $orientation="vertical"
            $p={4}
            className="w-80"
          >
            <CheckboxCardSlot
              $size="2xl"
              $layer="brand"
              $mix={20}
              $rounded="lg"
            >
              <icons.FileChartColumn />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabelRow>
                <CheckboxCardLabel>Reports</CheckboxCardLabel>
                <CheckboxCardSlot $kind="badge">Beta</CheckboxCardSlot>
              </CheckboxCardLabelRow>
              <CheckboxCardDescription $truncate={false}>
                A summary of usage and retention in your inbox every Monday
              </CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
          <CheckboxCard
            value="audit"
            $orientation="vertical"
            $p={4}
            className="w-48"
          >
            <CheckboxCardSlot
              $size="2xl"
              $layer="brand"
              $mix={20}
              $rounded="lg"
            >
              <icons.ShieldCheck />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabelRow>
                <CheckboxCardLabel>Audit log</CheckboxCardLabel>
                <CheckboxCardSlot $kind="badge">Enterprise</CheckboxCardSlot>
              </CheckboxCardLabelRow>
              <CheckboxCardDescription $truncate={false}>
                Every change, with who made it
              </CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        </div>
      </Example>

      <Example
        title="Card grid"
        description="Cards packed into equal rows. The count under the grid follows the checked cards."
        code={`
          <CheckboxCardGrid $minItemSize="11rem">
            <CheckboxCard value="analytics" checked>
              <CheckboxCardSlot>
                <ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Analytics</CheckboxCardLabel>
              <CheckboxCardCheck />
            </CheckboxCard>
            <CheckboxCard value="alerts" checked={false}>
              <CheckboxCardSlot>
                <Bell />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Alerts</CheckboxCardLabel>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
        `}
      >
        <CountedCardGrid />
      </Example>

      <Example
        title="Floating check"
        description="The check becomes a stamp in the card's top-end corner, takes its colors from the surface around the card, and shows only while the card is checked."
        code={`
          <CheckboxCardGrid>
            <CheckboxCard value="analytics" defaultChecked>
              <CheckboxCardSlot>
                <ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Analytics</CheckboxCardLabel>
              <CheckboxCardCheck $floating />
            </CheckboxCard>
            <CheckboxCard value="alerts">
              <CheckboxCardSlot>
                <Bell />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Alerts</CheckboxCardLabel>
              <CheckboxCardCheck $floating />
            </CheckboxCard>
            <CheckboxCard value="exports">
              <CheckboxCardSlot>
                <Download />
              </CheckboxCardSlot>
              <CheckboxCardLabel>Exports</CheckboxCardLabel>
              <CheckboxCardCheck $floating />
            </CheckboxCard>
            <CheckboxCard value="api" defaultChecked>
              <CheckboxCardSlot>
                <Code />
              </CheckboxCardSlot>
              <CheckboxCardLabel>API access</CheckboxCardLabel>
              <CheckboxCardCheck $floating />
            </CheckboxCard>
          </CheckboxCardGrid>
        `}
      >
        <CheckboxCardGrid aria-label="Features" className="w-full">
          {features.map((feature, index) => (
            <CheckboxCard
              key={feature.value}
              value={feature.value}
              defaultChecked={index === 0 || index === features.length - 1}
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
        title="Small corners"
        description="A check is round by default and can set another radius."
        code={`
          <CheckboxCard value="weekly" defaultChecked>
            <CheckboxCardCheck $rounded="sm" />
            <CheckboxCardLabel>Weekly report</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="weekly" defaultChecked>
          <CheckboxCardCheck $rounded="sm" />
          <CheckboxCardLabel>Weekly report</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Custom mark"
        description="A child replaces the drawn mark and, like it, shows only while the card is checked."
        code={`
          <CheckboxCard value="starred" defaultChecked>
            <CheckboxCardCheck>
              <Star />
            </CheckboxCardCheck>
            <CheckboxCardLabel>Starred</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="starred" defaultChecked>
          <CheckboxCardCheck>
            <icons.Star />
          </CheckboxCardCheck>
          <CheckboxCardLabel>Starred</CheckboxCardLabel>
        </CheckboxCard>
      </Example>

      <Example
        title="Switch mark"
        description="The mark sets the switch role. The thumb moves to the end side when on and stops at the center when mixed, which needs the checkbox role, because a switch has no mixed state."
        code={`
          <CheckboxField $mark="switch" defaultChecked>
            <CheckboxLabel>Wi-Fi</CheckboxLabel>
          </CheckboxField>
        `}
      >
        <div className="grid gap-3">
          <CheckboxField $mark="switch">
            <CheckboxLabel>Off</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $mark="switch" defaultChecked>
            <CheckboxLabel>On</CheckboxLabel>
          </CheckboxField>
          <CheckboxField
            role="checkbox"
            $mark="switch"
            checked="mixed"
            readOnly
          >
            <CheckboxLabel>Mixed</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $mark="switch" disabled>
            <CheckboxLabel>Disabled off</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $mark="switch" disabled defaultChecked>
            <CheckboxLabel>Disabled on</CheckboxLabel>
          </CheckboxField>
          <OptionalRoleSwitchField />
          <div dir="rtl" lang="ar" className="grid gap-3">
            <CheckboxField $mark="switch">
              <CheckboxLabel>إيقاف</CheckboxLabel>
            </CheckboxField>
            <CheckboxField $mark="switch" defaultChecked>
              <CheckboxLabel>تشغيل</CheckboxLabel>
            </CheckboxField>
          </div>
        </div>
      </Example>

      <Example
        title="Switch mark sizes"
        description="The track and the thumb scale with the mark's size, and the mark aligns with the first line."
        code={`
          <label>
            <Checkbox $mark="switch" $size="md" />
            Medium
          </label>
        `}
      >
        <div className="grid gap-3">
          {(["md", "lg", "xl"] as const).map((size) => (
            <label key={size} className="flex items-center gap-2">
              <Checkbox $mark="switch" $size={size} />
              {size}
            </label>
          ))}
        </div>
      </Example>

      <Example
        title="Switch cards"
        description="A switch at the end of a card follows the card's state, on neutral and brand surfaces."
        code={`
          <CheckboxCard $mark="switch" defaultChecked>
            <CheckboxCardLabel>Email</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
        `}
      >
        <div className="grid gap-2">
          <CheckboxCard $mark="switch" defaultChecked>
            <CheckboxCardLabel>On</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
          <CheckboxCard $mark="switch">
            <CheckboxCardLabel>Off</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
          <CheckboxCard $mark="switch" disabled defaultChecked>
            <CheckboxCardLabel>Disabled on</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
          <OptionalPropsSwitchCard />
          <CheckboxCard role="checkbox" $mark="switch">
            <CheckboxCardLabel>Checkbox role</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
          <Frame $layer="brand" $p={3} $rounded="xl" className="grid gap-3">
            <CheckboxField $mark="switch">
              <CheckboxLabel>Off on brand</CheckboxLabel>
            </CheckboxField>
            <CheckboxField $mark="switch" defaultChecked>
              <CheckboxLabel>On on brand</CheckboxLabel>
            </CheckboxField>
          </Frame>
        </div>
      </Example>

      <Example
        title="Filter chips"
        description="Small pill cards in a wrapping row, used as a set of filters. Each chip keeps its check, so its state does not rest on color alone."
        code={`
          <CheckboxCard value="design" defaultChecked $rounded="full" $size="sm">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Design</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="docs" $rounded="full" $size="sm">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Docs</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="engineering" defaultChecked $rounded="full" $size="sm">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Engineering</CheckboxCardLabel>
          </CheckboxCard>
          <CheckboxCard value="marketing" $rounded="full" $size="sm">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Marketing</CheckboxCardLabel>
          </CheckboxCard>
        `}
      >
        <div role="group" aria-label="Tags" className="flex flex-wrap gap-2">
          {["Design", "Docs", "Engineering", "Marketing"].map((tag, index) => (
            <CheckboxCard
              key={tag}
              value={tag.toLowerCase()}
              defaultChecked={index % 2 === 0}
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
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4} className="grid gap-2">
            <CheckboxField defaultChecked>
              <CheckboxLabel>Email me</CheckboxLabel>
            </CheckboxField>
            <CheckboxField>
              <CheckboxLabel>Push notifications</CheckboxLabel>
              <CheckboxDescription>On every device</CheckboxDescription>
            </CheckboxField>
          </Frame>
        `}
      >
        <Frame
          $layer="brand"
          $rounded="xl"
          $p={4}
          className="grid w-full gap-2"
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
        title="Fields on a tinted layer"
        description="An empty box lightens to white on a light tinted surface, like an input, while a checked box keeps its brand fill."
        code={`
          <Frame $hue="blue" $chroma="balanced" $rounded="xl" $p={4} className="grid gap-2">
            <CheckboxField defaultChecked>
              <CheckboxLabel>Email me</CheckboxLabel>
            </CheckboxField>
            <CheckboxField>
              <CheckboxLabel>Push notifications</CheckboxLabel>
            </CheckboxField>
            <CheckboxField disabled>
              <CheckboxLabel>Text messages</CheckboxLabel>
            </CheckboxField>
          </Frame>
        `}
      >
        <Frame
          $hue="blue"
          $chroma="balanced"
          $rounded="xl"
          $p={4}
          className="grid w-full gap-2"
        >
          <CheckboxField defaultChecked>
            <CheckboxLabel>Email me</CheckboxLabel>
          </CheckboxField>
          <CheckboxField>
            <CheckboxLabel>Push notifications</CheckboxLabel>
          </CheckboxField>
          <CheckboxField disabled>
            <CheckboxLabel>Text messages</CheckboxLabel>
          </CheckboxField>
        </Frame>
      </Example>

      <Example
        title="Bordered fields on a brand layer"
        description="The edge takes its color from the surface, like the edge of a card, and the row stays transparent."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4} className="grid gap-2">
            <CheckboxField $border defaultChecked>
              <CheckboxLabel>Email me</CheckboxLabel>
            </CheckboxField>
            <CheckboxField $border>
              <CheckboxLabel>Push notifications</CheckboxLabel>
              <CheckboxDescription>On every device</CheckboxDescription>
            </CheckboxField>
          </Frame>
        `}
      >
        <Frame
          $layer="brand"
          $rounded="xl"
          $p={4}
          className="grid w-full gap-2"
        >
          <CheckboxField $border defaultChecked>
            <CheckboxLabel>Email me</CheckboxLabel>
          </CheckboxField>
          <CheckboxField $border>
            <CheckboxLabel>Push notifications</CheckboxLabel>
            <CheckboxDescription>On every device</CheckboxDescription>
          </CheckboxField>
        </Frame>
      </Example>

      <Example
        title="Cards on a brand layer"
        description="On a brand surface, a checked card's tint can blend in, so the check marks show which card is checked."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <CheckboxCardGrid>
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
                  <CheckboxCardDescription>Keys and webhooks</CheckboxCardDescription>
                </CheckboxCardContent>
              </CheckboxCard>
            </CheckboxCardGrid>
          </Frame>
        `}
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

      {/*
        Regression fixtures: a right-to-left Checkbox tile card with mirrored
        geometry, and a badge inside a tile that keeps its own slot spacing.
      */}
      <Example
        title="Right to left tile"
        description="A tile card in a right-to-left page. The slot starts at the right edge and the check ends at the left edge."
        code={`
          <div dir="rtl">
            <CheckboxCardGrid $minItemSize="12rem">
              <CheckboxCard value="analytics" $orientation="vertical" $p={4}>
                <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                  <ChartBar />
                </CheckboxCardSlot>
                <CheckboxCardContent>
                  <CheckboxCardLabel>التحليلات</CheckboxCardLabel>
                  <CheckboxCardDescription>الاستخدام والاحتفاظ</CheckboxCardDescription>
                </CheckboxCardContent>
                <CheckboxCardCheck />
              </CheckboxCard>
            </CheckboxCardGrid>
          </div>
        `}
      >
        <div dir="rtl" lang="ar" className="w-full">
          <CheckboxCardGrid aria-label="الميزات" $minItemSize="12rem">
            <CheckboxCard value="analytics" $orientation="vertical" $p={4}>
              <CheckboxCardSlot
                $size="2xl"
                $layer="brand"
                $mix={20}
                $rounded="lg"
              >
                <ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>التحليلات</CheckboxCardLabel>
                <CheckboxCardDescription>
                  الاستخدام والاحتفاظ
                </CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
        </div>
      </Example>

      <Example
        title="Tile with a badge"
        description="A badge in a tile's content or in its top row keeps its own slot spacing. The same badge follows the tiles for comparison."
        stretch
        code={`
          <CheckboxCardGrid $minItemSize="12rem">
            <CheckboxCard value="pro" $orientation="vertical" $p={4}>
              <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                <ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>Pro</CheckboxCardLabel>
                <Badge $layer="brand">
                  <BadgeSlot>
                    <Sparkles />
                  </BadgeSlot>
                  <BadgeLabel>Recommended</BadgeLabel>
                </Badge>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
            <CheckboxCard value="team" $orientation="vertical" $p={4}>
              <CheckboxCardSlot $size="2xl" $layer="brand" $mix={20} $rounded="lg">
                <ChartBar />
              </CheckboxCardSlot>
              <Badge $layer="brand">
                <BadgeSlot>
                  <Sparkles />
                </BadgeSlot>
                <BadgeLabel>Popular</BadgeLabel>
              </Badge>
              <CheckboxCardContent>
                <CheckboxCardLabel>Team</CheckboxCardLabel>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
          <Badge $layer="brand">
            <BadgeSlot>
              <Sparkles />
            </BadgeSlot>
            <BadgeLabel>Recommended</BadgeLabel>
          </Badge>
        `}
      >
        <CheckboxCardGrid aria-label="Plans" $minItemSize="12rem">
          <CheckboxCard value="pro" $orientation="vertical" $p={4}>
            <CheckboxCardSlot
              $size="2xl"
              $layer="brand"
              $mix={20}
              $rounded="lg"
            >
              <ChartBar />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabel>Pro</CheckboxCardLabel>
              <Badge $layer="brand">
                <BadgeSlot>
                  <Sparkles />
                </BadgeSlot>
                <BadgeLabel>Recommended</BadgeLabel>
              </Badge>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
          <CheckboxCard value="team" $orientation="vertical" $p={4}>
            <CheckboxCardSlot
              $size="2xl"
              $layer="brand"
              $mix={20}
              $rounded="lg"
            >
              <ChartBar />
            </CheckboxCardSlot>
            <Badge $layer="brand">
              <BadgeSlot>
                <Sparkles />
              </BadgeSlot>
              <BadgeLabel>Popular</BadgeLabel>
            </Badge>
            <CheckboxCardContent>
              <CheckboxCardLabel>Team</CheckboxCardLabel>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        </CheckboxCardGrid>
        {/* A row, so the badge keeps its own width outside the tile. */}
        <div className="flex">
          <Badge $layer="brand">
            <BadgeSlot>
              <Sparkles />
            </BadgeSlot>
            <BadgeLabel>Recommended</BadgeLabel>
          </Badge>
        </div>
      </Example>
      <Example
        title="Card grid with an optional role"
        description="A wrapper passes its optional role on to the grid. Without a role, the grid keeps its group role."
        code={`
          <CheckboxCardGrid aria-label="Optional role" role={role}>
            <CheckboxCard value="analytics">
              <CheckboxCardLabel>Analytics</CheckboxCardLabel>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
        `}
      >
        <FeatureGrid />
      </Example>
      <Example
        title="Card badge"
        description="A badge slot shows a count beside the card label."
        code={`
          <CheckboxCard value="messages">
            <CheckboxCardCheck />
            <CheckboxCardLabel>Messages</CheckboxCardLabel>
            <CheckboxCardSlot $kind="badge">3</CheckboxCardSlot>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="messages">
          <CheckboxCardCheck />
          <CheckboxCardLabel>Messages</CheckboxCardLabel>
          <CheckboxCardSlot $kind="badge">3</CheckboxCardSlot>
        </CheckboxCard>
      </Example>
      <Example
        title="Disabled card badges"
        description="Native and ARIA disabled cards use the same badge and text contrast."
        code={`
          <CheckboxCard value="email" disabled>
            <CheckboxCardLabel>Email</CheckboxCardLabel>
            <CheckboxCardSlot $kind="badge">3</CheckboxCardSlot>
          </CheckboxCard>
          <CheckboxCard value="messages" aria-disabled>
            <CheckboxCardLabel>Messages</CheckboxCardLabel>
            <CheckboxCardSlot $kind="badge">3</CheckboxCardSlot>
          </CheckboxCard>
        `}
      >
        <CheckboxCard value="email" disabled>
          <CheckboxCardLabel>Email</CheckboxCardLabel>
          <CheckboxCardSlot $kind="badge">3</CheckboxCardSlot>
        </CheckboxCard>
        <CheckboxCard value="messages" aria-disabled>
          <CheckboxCardLabel>Messages</CheckboxCardLabel>
          <CheckboxCardSlot $kind="badge">3</CheckboxCardSlot>
        </CheckboxCard>
      </Example>
      <Example
        title="Disabled field labels"
        description="Native and ARIA disabled fields use the same label and description contrast."
        code={`
          <CheckboxField value="email" disabled>
            <CheckboxLabel>Email</CheckboxLabel>
            <CheckboxDescription>Receive email updates.</CheckboxDescription>
          </CheckboxField>
          <CheckboxField value="messages" aria-disabled>
            <CheckboxLabel>Messages</CheckboxLabel>
            <CheckboxDescription>Receive message updates.</CheckboxDescription>
          </CheckboxField>
        `}
      >
        <CheckboxField value="email" disabled>
          <CheckboxLabel>Email</CheckboxLabel>
          <CheckboxDescription>Receive email updates.</CheckboxDescription>
        </CheckboxField>
        <CheckboxField value="messages" aria-disabled>
          <CheckboxLabel>Messages</CheckboxLabel>
          <CheckboxDescription>Receive message updates.</CheckboxDescription>
        </CheckboxField>
      </Example>
      {/* https://github.com/ariakit/ariakit/issues/7869 */}
      <Example
        title="Disabled choices in colored text"
        description="A field or card that only its input disables keeps the dimmed text and icon inside an adaptive text color."
        code={`
          <div className="grid gap-2">
            <Text $text="danger" className="grid gap-2">
              <CheckboxField value="archive">
                <CheckboxLabel>Archive project</CheckboxLabel>
                <CheckboxDescription>…</CheckboxDescription>
              </CheckboxField>
              <CheckboxField value="transfer" aria-disabled>
                <CheckboxLabel>Transfer project</CheckboxLabel>
                <CheckboxDescription>…</CheckboxDescription>
              </CheckboxField>
              <fieldset disabled className="grid">
                <CheckboxField value="delete">
                  <CheckboxLabel>Delete project</CheckboxLabel>
                  <CheckboxDescription>…</CheckboxDescription>
                </CheckboxField>
              </fieldset>
              <CheckboxCard value="backups" aria-disabled>
                <CheckboxCardSlot><Trash2 /></CheckboxCardSlot>
                <CheckboxCardContent>
                  <CheckboxCardLabel>Delete backups</CheckboxCardLabel>
                  <CheckboxCardDescription>…</CheckboxCardDescription>
                </CheckboxCardContent>
              </CheckboxCard>
            </Text>
            <CheckboxField value="members" $text="danger" aria-disabled>
              <CheckboxLabel>Remove members</CheckboxLabel>
              <CheckboxDescription>…</CheckboxDescription>
            </CheckboxField>
          </div>
        `}
      >
        <div className="grid w-full gap-2">
          <Text $text="danger" className="grid gap-2">
            {/* The enabled field shows the color that the others must drop. */}
            <CheckboxField value="archive">
              <CheckboxLabel>Archive project</CheckboxLabel>
              <CheckboxDescription>Hide it from the team</CheckboxDescription>
            </CheckboxField>
            <CheckboxField value="transfer" aria-disabled>
              <CheckboxLabel>Transfer project</CheckboxLabel>
              <CheckboxDescription>
                Only owners can transfer
              </CheckboxDescription>
            </CheckboxField>
            <fieldset disabled className="grid">
              <CheckboxField value="delete">
                <CheckboxLabel>Delete project</CheckboxLabel>
                <CheckboxDescription>
                  Only owners can delete
                </CheckboxDescription>
              </CheckboxField>
            </fieldset>
            <CheckboxCard value="backups" aria-disabled>
              <CheckboxCardSlot>
                <Trash2 />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>Delete backups</CheckboxCardLabel>
                <CheckboxCardDescription>
                  Only owners can delete
                </CheckboxCardDescription>
              </CheckboxCardContent>
            </CheckboxCard>
          </Text>
          {/* The field sets the color on itself. */}
          <CheckboxField value="members" $text="danger" aria-disabled>
            <CheckboxLabel>Remove members</CheckboxLabel>
            <CheckboxDescription>Only owners can remove</CheckboxDescription>
          </CheckboxField>
        </div>
      </Example>
    </ExampleGrid>
  );
}
