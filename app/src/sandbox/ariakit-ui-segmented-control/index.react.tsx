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
import {
  Button,
  ButtonGroup,
  ButtonLabel,
  ButtonSeparator,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  RadioCard,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import type {
  RadioCardProps,
  RadioGroupProps,
} from "@ariakit/ui/components/radio.ariakit.react";
import {
  Tab,
  TabLabel,
  TabList,
  TabPanel,
  TabProvider,
  TabSlot,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { Columns3Icon, LayoutGridIcon, ListIcon } from "lucide-react";
import { Fragment } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

const views = [
  { label: "List", Icon: ListIcon },
  { label: "Grid", Icon: LayoutGridIcon },
  { label: "Board", Icon: Columns3Icon },
];

interface SegmentsProps extends Omit<RadioGroupProps, "label"> {
  name: string;
  item?: Omit<RadioCardProps, "value">;
  content?: "text" | "icons" | "both";
  separators?: boolean;
  disabledLabel?: string;
}

function Segments({
  name,
  item,
  content = "text",
  separators,
  disabledLabel,
  ...props
}: SegmentsProps) {
  return (
    <RadioGroup
      aria-label={name}
      defaultValue="List"
      $kind="segmented"
      {...props}
    >
      {views.map(({ label, Icon }, index) => {
        const segment = (
          <RadioCard
            value={label}
            aria-label={content === "icons" ? label : undefined}
            disabled={label === disabledLabel}
            $kind="segmented"
            {...item}
          >
            {content !== "text" && (
              <RadioCardSlot>
                <Icon aria-hidden />
              </RadioCardSlot>
            )}
            {content !== "icons" && <RadioCardLabel>{label}</RadioCardLabel>}
          </RadioCard>
        );
        return (
          <Fragment key={label}>
            {separators && index > 0 && <ButtonSeparator aria-hidden />}
            {content === "icons" ? (
              <Tooltip text={label}>{segment}</Tooltip>
            ) : (
              segment
            )}
          </Fragment>
        );
      })}
    </RadioGroup>
  );
}

const outlined = {
  $layer: "transparent",
  $edgeWeight: "normal",
} satisfies RadioGroupProps;

const joinedGroup = {
  $layer: "transparent",
  $border: false,
  $gap: "none",
  $p: "none",
} satisfies RadioGroupProps;

const joinedCell = {
  $kind: "segmented-flat",
  $layer: "brand",
  $mix: 20,
  $edgeWeight: "normal",
  $borderType: "border",
} satisfies Omit<RadioCardProps, "value">;

export default function SegmentedControlExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Raised"
        description="The default kind. The selected segment takes the surface around the group and a bevel."
        code={`
          <RadioGroup aria-label="Raised" $kind="segmented">
            <RadioCard value="list" $kind="segmented">
              <RadioCardLabel>List</RadioCardLabel>
            </RadioCard>
          </RadioGroup>
        `}
      >
        <Segments name="Raised" />
      </Example>

      <Example
        title="Flat"
        description="The selected segment has no bevel and casts a shadow that the group clips."
        code={`<RadioCard value="list" $kind="segmented-flat"><RadioCardLabel>List</RadioCardLabel></RadioCard>`}
      >
        <Segments name="Flat" item={{ $kind: "segmented-flat" }} />
      </Example>

      <Example
        title="Separators"
        description="Lines hide on both sides of the selected, hovered, or focused segment."
        code={`<ButtonSeparator aria-hidden />`}
      >
        <Segments name="Separators" separators defaultValue="Grid" />
      </Example>

      <Example
        title="Outlined"
        description="The group has an edge instead of a surface."
        code={`<RadioGroup $kind="segmented" $layer="transparent" $edgeWeight="normal" />`}
      >
        <Segments
          name="Outlined"
          {...outlined}
          item={{ $selectedOffset: 1.5 }}
        />
      </Example>

      <Example
        title="Brand"
        description="A round group with a brand thumb."
        code={`<RadioCard value="list" $kind="segmented-flat" $layer="brand" />`}
      >
        <Segments
          name="Brand"
          $rounded="full"
          item={{ $kind: "segmented-flat", $layer: "brand" }}
        />
      </Example>

      <Example
        title="Inverted raised"
        description="Only the selected segment inverts, with a bevel."
        code={`<RadioCard value="list" $kind="segmented" $invert />`}
      >
        <Segments name="Inverted raised" item={{ $invert: true }} />
      </Example>

      <Example
        title="Inverted flat"
        description="Only the selected segment inverts, without a bevel."
        code={`<RadioCard value="list" $kind="segmented-flat" $invert />`}
      >
        <Segments
          name="Inverted flat"
          item={{ $invert: true, $kind: "segmented-flat" }}
        />
      </Example>

      <Example
        title="Joined cells"
        description="Cells share lines and keep them while disabled."
        code={`<RadioGroup $kind="segmented" $layer="transparent" $border={false} $gap="none" $p="none" />`}
      >
        <Segments
          name="Joined cells"
          {...joinedGroup}
          item={joinedCell}
          disabledLabel="Board"
        />
      </Example>

      <Example
        title="Icons with labels"
        description="Slots keep their alignment in a segment."
        code={`<RadioCardSlot><ListIcon aria-hidden /></RadioCardSlot>`}
      >
        <Segments name="Icons with labels" content="both" />
      </Example>

      <Example
        title="Icon only"
        description="A tooltip anchors to the input that fills the segment."
        code={`<Tooltip text="List"><RadioCard aria-label="List" value="list" $kind="segmented" /></Tooltip>`}
      >
        <Segments name="Icon only" content="icons" />
      </Example>

      <Example
        title="Stretched"
        description="Segments share the width. A disabled segment has no edge."
        code={`<RadioGroup $kind="segmented" $layout="stretch" />`}
        stretch
      >
        <Segments name="Stretched" $layout="stretch" disabledLabel="Board" />
      </Example>

      <Example
        title="Stretched with explicit padding"
        description="A named side padding replaces the default of a stretched group."
        code={`
          <RadioGroup $kind="segmented" $layout="stretch">
            <RadioCard $kind="segmented" $px="sm" />
          </RadioGroup>
        `}
        stretch
      >
        <Segments
          name="Explicit padding"
          content="both"
          $layout="stretch"
          item={{ $px: "sm" }}
        />
      </Example>

      <Example
        title="Stretched with a badge"
        description="A badge in a slot keeps its side padding, which doesn't follow the default of a stretched group."
        code={`
          <RadioGroup $kind="segmented" $layout="stretch">
            <RadioCard $kind="segmented">
              <RadioCardLabel>Yearly</RadioCardLabel>
              <RadioCardSlot $kind="box">
                <Badge $rounded="md" />
              </RadioCardSlot>
            </RadioCard>
          </RadioGroup>
        `}
        stretch
      >
        <RadioGroup
          aria-label="Badge in a slot"
          defaultValue="Yearly"
          $kind="segmented"
          $layout="stretch"
        >
          <RadioCard value="Monthly" $kind="segmented">
            <RadioCardLabel>Monthly</RadioCardLabel>
          </RadioCard>
          <RadioCard value="Yearly" $kind="segmented">
            <RadioCardLabel>Yearly</RadioCardLabel>
            <RadioCardSlot $kind="box">
              <Badge $layer="success" $rounded="md">
                -20%
              </Badge>
            </RadioCardSlot>
          </RadioCard>
        </RadioGroup>
      </Example>

      <Example
        title="Disabled selection"
        description="A checked and disabled segment keeps its thumb."
        code={`<RadioCard value="list" disabled $kind="segmented" />`}
      >
        <Segments name="Disabled selection" disabledLabel="List" />
      </Example>

      <Example
        title="Visible label"
        description="The label goes above the surface of the group."
        code={`<RadioGroup label="View" $kind="segmented" />`}
      >
        <RadioGroup label="View" defaultValue="List" $kind="segmented">
          {views.map(({ label }) => (
            <RadioCard key={label} value={label} $kind="segmented">
              <RadioCardLabel>{label}</RadioCardLabel>
            </RadioCard>
          ))}
        </RadioGroup>
      </Example>

      <Example
        title="Dark surface"
        description="The group follows the surface around it."
        code={`<Frame $layer="#14161b"><RadioGroup $kind="segmented" /></Frame>`}
      >
        <Frame $layer="#14161b" $rounded="xl" $p={4}>
          <Segments name="Dark surface" />
        </Frame>
      </Example>

      <Example
        title="Narrow"
        description="A group wider than its container scrolls to the focused segment."
        code={`<div className="w-32"><RadioGroup $kind="segmented" /></div>`}
      >
        <div className="w-32">
          <Segments name="Narrow" />
        </div>
      </Example>

      <Example
        title="Tabs"
        description="Tabs take the kind of the list from the tabs prop or their own."
        code={`<TabList tabs={tabs} $kind="segmented" />`}
        stretch
      >
        <TabProvider defaultSelectedId="overview">
          <TabList aria-label="Project" $kind="segmented">
            <Tab id="overview" $kind="segmented">
              Overview
            </Tab>
            <Tab id="activity" $kind="segmented">
              Activity
            </Tab>
          </TabList>
          <TabPanel tabId="overview">Project details</TabPanel>
          <TabPanel tabId="activity">Recent changes</TabPanel>
        </TabProvider>
      </Example>

      <Example
        title="Stretched tabs"
        description="A segmented tab list fills the row."
        code={`<TabList $kind="segmented" $layout="stretch" />`}
        stretch
      >
        <TabProvider defaultSelectedId="code">
          <TabList
            aria-label="Source"
            tabs={{ code: "Code", preview: "Preview" }}
            $kind="segmented"
            $layout="stretch"
          />
        </TabProvider>
      </Example>

      <Example
        title="Stretched tabs with icons"
        description="A row with an icon and a label moves toward the icon, like the segments of a stretched group."
        code={`
          <TabList $kind="segmented" $layout="stretch">
            <Tab $kind="segmented">
              <TabSlot><Icon /></TabSlot>
              <TabLabel>Label</TabLabel>
            </Tab>
          </TabList>
        `}
        stretch
      >
        <TabProvider defaultSelectedId="list-view">
          <TabList aria-label="View" $kind="segmented" $layout="stretch">
            {views.map(({ label, Icon }) => (
              <Tab
                key={label}
                id={`${label.toLowerCase()}-view`}
                $kind="segmented"
              >
                <TabSlot>
                  <Icon aria-hidden />
                </TabSlot>
                <TabLabel>{label}</TabLabel>
              </Tab>
            ))}
          </TabList>
        </TabProvider>
      </Example>

      <Example
        title="Outlined tabs"
        description="A segmented tab list has an edge instead of a surface."
        code={`<TabList $kind="segmented" $layer="transparent" $edgeWeight="normal" />`}
      >
        <TabProvider defaultSelectedId="day">
          <TabList
            aria-label="Period"
            tabs={{ day: "Day", week: "Week" }}
            $kind="segmented"
            $layer="transparent"
            $edgeWeight="normal"
          />
        </TabProvider>
      </Example>

      <Example
        title="Navigation"
        description="Links in a landmark, with the current one as the thumb."
        code={`<Nav $kind="segmented" $layout="horizontal"><NavLink $kind="segmented" text="Day" /></Nav>`}
      >
        <Nav aria-label="Range" $kind="segmented" $layout="horizontal">
          <NavLink
            $kind="segmented"
            href="#day"
            aria-current="page"
            text="Day"
          />
          <NavLink $kind="segmented" href="#week" text="Week" />
        </Nav>
      </Example>

      <Example
        title="Buttons"
        description="Plain buttons take the kind too, such as links without a landmark."
        code={`<ButtonGroup $kind="segmented"><Button $kind="segmented" render={<a />}><ButtonLabel text="First" /></Button></ButtonGroup>`}
      >
        <ButtonGroup aria-label="Pages" $kind="segmented">
          <Button
            $kind="segmented"
            render={<a href="#first" aria-current="page" />}
          >
            <ButtonLabel text="First" />
          </Button>
          <Button $kind="segmented" render={<a href="#second" />}>
            <ButtonLabel text="Second" />
          </Button>
        </ButtonGroup>
      </Example>
    </ExampleGrid>
  );
}
