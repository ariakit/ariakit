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
import { Glider } from "@ariakit/ui/components/glider.ariakit.react";
import type { GliderProps } from "@ariakit/ui/components/glider.ariakit.react";
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
  TabPanels,
  TabProvider,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import type {
  TabListProps,
  TabProps,
  TabsProps,
} from "@ariakit/ui/components/tabs.ariakit.react";
import {
  CalendarDaysIcon,
  Columns3Icon,
  LayoutGridIcon,
  ListIcon,
} from "lucide-react";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// Groups with the Glider style component, which JavaScript drives after
// hydration. The toolbar changes the travel time and turns the glider off to
// show the markup that the server renders.

const views = [
  { label: "List", Icon: ListIcon },
  { label: "Grid", Icon: LayoutGridIcon },
  { label: "Board", Icon: Columns3Icon },
  { label: "Calendar", Icon: CalendarDaysIcon },
];

const periods = ["Day", "Week", "Month", "Quarter", "Year"];

const pages = [
  "Overview",
  "Components",
  "Styling",
  "Accessibility",
  "Releases",
];

// An HTML id has no spaces, and a tab panel names itself with the id of its
// tab.
function getTabId(name: string, label: string) {
  return `${name}-${label}`.toLowerCase().replace(/\s+/g, "-");
}

// An icon that points to a symbol of an SVG sprite with use.
function SpriteIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4">
      <use href="#glider-sprite-dot" />
    </svg>
  );
}

function Sprite() {
  return (
    <svg aria-hidden className="hidden">
      <symbol id="glider-sprite-dot" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="currentColor" />
      </symbol>
    </svg>
  );
}

interface SegmentsProps extends Omit<RadioGroupProps, "label"> {
  name: string;
  item?: Omit<RadioCardProps, "value">;
  /** The props of each item, by position, for items that differ. */
  items?: Array<Omit<RadioCardProps, "value">>;
  icons?: boolean;
  /** Draws the icons with use and a symbol of an SVG sprite. */
  sprite?: boolean;
  badge?: boolean;
  /** The props of the glider. Without them, the group has no glider. */
  glider?: GliderProps;
}

function Segments({
  name,
  item,
  items,
  icons,
  sprite,
  badge,
  glider,
  ...props
}: SegmentsProps) {
  return (
    <RadioGroup
      aria-label={name}
      defaultValue="List"
      $kind="segmented"
      {...props}
    >
      {views.map(({ label, Icon }, index) => (
        <RadioCard
          key={label}
          value={label}
          $kind="segmented"
          {...item}
          {...items?.[index]}
        >
          {icons && (
            <RadioCardSlot>
              {sprite ? <SpriteIcon /> : <Icon aria-hidden />}
            </RadioCardSlot>
          )}
          <RadioCardLabel>{label}</RadioCardLabel>
          {badge && label === "Board" && (
            <RadioCardSlot $kind="box">
              <Badge $layer="success" $rounded="md">
                New
              </Badge>
            </RadioCardSlot>
          )}
        </RadioCard>
      ))}
      {glider && <Glider {...glider} />}
    </RadioGroup>
  );
}

interface GliderExampleProps {
  name: string;
  glider: GliderProps;
}

function SegmentedTabs({ name, glider }: GliderExampleProps) {
  return (
    <TabProvider defaultSelectedId={getTabId(name, "Day")}>
      <TabList aria-label={name} $kind="segmented">
        {periods.map((period) => (
          <Tab key={period} id={getTabId(name, period)} $kind="segmented">
            <TabLabel>{period}</TabLabel>
          </Tab>
        ))}
        <Glider {...glider} />
      </TabList>
    </TabProvider>
  );
}

interface FolderTabsProps extends GliderExampleProps {
  folderCurve?: TabsProps["$folderCurve"];
  outerEdge?: TabsProps["$outerEdge"];
  layout?: TabListProps["$layout"];
  indent?: TabsProps["$indent"];
  panel?: ReactNode;
}

function FolderTabs({
  name,
  glider,
  folderCurve,
  outerEdge,
  layout,
  indent,
  panel = "The panel of the selected tab.",
}: FolderTabsProps) {
  return (
    <Tabs
      defaultSelectedId={getTabId(name, "Day")}
      $folderCurve={folderCurve}
      $outerEdge={outerEdge}
      $indent={indent}
      className="w-full"
    >
      <TabList aria-label={name} $layout={layout}>
        {periods.map((period) => (
          <Tab key={period} id={getTabId(name, period)}>
            <TabLabel>{period}</TabLabel>
          </Tab>
        ))}
        <Glider {...glider} />
      </TabList>
      <TabPanels>
        <TabPanel single>{panel}</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

// The panels element changes on each selection, as with panels that each page
// of a router renders.
function KeyedPanelsTabs({ name, glider }: GliderExampleProps) {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    getTabId(name, "Day"),
  );
  return (
    <Tabs
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      className="w-full"
    >
      <TabList aria-label={name}>
        {periods.map((period) => (
          <Tab key={period} id={getTabId(name, period)}>
            <TabLabel>{period}</TabLabel>
          </Tab>
        ))}
        <Glider {...glider} />
      </TabList>
      <TabPanels key={selectedId}>
        <TabPanel single>The panel of the selected tab.</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

function VerticalNav({ name, glider }: GliderExampleProps) {
  const [current, setCurrent] = useState("Overview");
  return (
    <Nav aria-label={name} className="w-56">
      {pages.map((page) => (
        <NavLink
          key={page}
          href={`#${page.toLowerCase()}`}
          aria-current={current === page ? "page" : undefined}
          $selectedOffset={2}
          onClick={(event) => {
            event.preventDefault();
            setCurrent(page);
          }}
        >
          {page}
        </NavLink>
      ))}
      <Glider {...glider} />
    </Nav>
  );
}

// Tabs of each kind in one list. Each kind has its own selected, hover, and
// focus appearance.
interface MixedTab {
  label: string;
  props: TabProps;
}

const mixedTabs: MixedTab[] = [
  { label: "Folder", props: {} },
  { label: "Bevel", props: { $kind: "bevel", $selectedPush: 1 } },
  { label: "Flat", props: { $kind: "flat", $selectedOffset: 2 } },
  { label: "Brand", props: { $kind: "flat", $layer: "brand" } },
  { label: "Folder two", props: {} },
];

// A flat tab first, before folders. Only a selected folder meets the panel.
const flatFirstTabs: MixedTab[] = [
  { label: "Flat", props: { $kind: "flat" } },
  { label: "Folder", props: {} },
  { label: "Folder two", props: {} },
];

interface MixedTabsProps extends GliderExampleProps {
  tabs?: MixedTab[];
}

function MixedTabs({ name, glider, tabs = mixedTabs }: MixedTabsProps) {
  const [first] = tabs;
  return (
    <Tabs
      defaultSelectedId={first && getTabId(name, first.label)}
      $p={3}
      className="w-full"
    >
      <TabList aria-label={name} $p={3}>
        {tabs.map(({ label, props }) => (
          <Tab key={label} id={getTabId(name, label)} {...props}>
            <TabLabel>{label}</TabLabel>
          </Tab>
        ))}
        <Glider {...glider} />
      </TabList>
      <TabPanels>
        <TabPanel single>The panel of the selected tab.</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

function HorizontalNav({ name, glider }: GliderExampleProps) {
  const [current, setCurrent] = useState("Overview");
  return (
    <Nav aria-label={name} $layout="horizontal">
      {pages.map((page) => (
        <NavLink
          key={page}
          href={`#${page.toLowerCase()}`}
          text={page}
          aria-current={current === page ? "page" : undefined}
          $selectedOffset={2}
          onClick={(event) => {
            event.preventDefault();
            setCurrent(page);
          }}
        />
      ))}
      <Glider {...glider} />
    </Nav>
  );
}

const inverted = { $invert: true } satisfies Omit<RadioCardProps, "value">;

const brand = {
  $kind: "segmented-flat",
  $layer: "brand",
} satisfies Omit<RadioCardProps, "value">;

// Items with different selected surfaces in one group.
const mixedSelected: Array<Omit<RadioCardProps, "value">> = [
  {},
  { $kind: "segmented-flat", $layer: "brand" },
  { $invert: true },
  { $kind: "segmented-flat", $rounded: "full", $selectedOffset: 3 },
];

// Items with different hover surfaces and text in one group.
const mixedHover: Array<Omit<RadioCardProps, "value">> = [
  {},
  { $layer: "brand", $hoverInk: 100 },
  { $hoverOffset: 4, $rounded: "full" },
  { $hoverInk: 50, $ink: 50 },
];

// List, Board, and Calendar have one width, and Grid has twice that width. A
// box that turns back from Grid to Board reverses its width transition, which
// then takes less time than the move.
const twoWidths: Array<Omit<RadioCardProps, "value">> = [
  { className: "w-20 flex-none" },
  { className: "w-40 flex-none" },
  { className: "w-20 flex-none" },
  { className: "w-20 flex-none" },
];

const durations = [
  { label: "Normal (200ms)", value: 200 },
  { label: "Slow (800ms)", value: 800 },
  { label: "Very slow (3s)", value: 3000 },
];

export default function GliderExamples() {
  const [duration, setDuration] = useState(200);
  const [enabled, setEnabled] = useState(true);
  const glider = { enabled } satisfies GliderProps;
  // The travel time is a custom property on an element around the groups, so
  // each part that follows a box takes the same time.
  const travelTime = {
    "--glider-duration": `${duration}ms`,
  } as CSSProperties;
  const hoverGlider = { ...glider, $hover: true } satisfies GliderProps;
  return (
    <>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b bg-(--ak-layer) px-4 py-3 text-sm sm:px-6">
        <label>
          Travel time{" "}
          <select
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          >
            {durations.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />{" "}
          Hydrated (clear it to see the server markup)
        </label>
      </div>
      <Sprite />
      <ExampleGrid style={travelTime}>
        <Example
          title="No glider"
          description="The current segmented control. Each item paints its own selected and hover state. Every other example renders this markup before hydration."
          code={`<RadioGroup $kind="segmented" />`}
        >
          <Segments name="No glider" />
        </Example>

        <Example
          title="Glider"
          description="A copy of the selected item's box travels between the items. While it travels, copies of the items under it show the selected text color and weight."
          code={`<Glider />`}
        >
          <Segments name="Glider" glider={glider} />
        </Example>

        <Example
          title="Hover glider"
          description="A second box follows the hovered item, and hides when the pointer leaves the group."
          code={`<Glider $hover />`}
        >
          <Segments name="Hover glider" glider={hoverGlider} />
        </Example>

        <Example
          title="Icons and a badge"
          description="Icons take the text color, so they change with the text. A badge keeps its own colors."
          code={`<Glider $hover />`}
        >
          <Segments name="Icons and a badge" icons badge glider={hoverGlider} />
        </Example>

        <Example
          title="Icons from a sprite"
          description="Icons that draw a symbol of an SVG sprite with use. The copies in the box keep the reference to the symbol, so the icons show while the box travels."
          code={`<svg><use href="#dot" /></svg>`}
        >
          <Segments name="Icons from a sprite" icons sprite glider={glider} />
        </Example>

        <Example
          title="Inverted"
          description="An inverted thumb, where the text of the selected item changes from light to dark. This is the hardest case for a text transition."
          code={`<Glider />`}
        >
          <Segments name="Inverted" item={inverted} icons glider={glider} />
        </Example>

        <Example
          title="Inverted with hover glider"
          description="The hover box and the inverted thumb travel on their own."
          code={`<Glider $hover />`}
        >
          <Segments
            name="Inverted with hover glider"
            item={inverted}
            glider={hoverGlider}
          />
        </Example>

        <Example
          title="Brand"
          description="A flat brand thumb with a shadow, which the group clips."
          code={`<Glider $hover />`}
        >
          <Segments name="Brand" item={brand} icons glider={hoverGlider} />
        </Example>

        <Example
          title="Right to left"
          description="The glider reads the boxes of the items, so it follows the direction of the group."
          code={`<RadioGroup dir="rtl"><Glider $hover /></RadioGroup>`}
        >
          <Segments name="Right to left" dir="rtl" icons glider={hoverGlider} />
        </Example>

        <Example
          title="Scrolling"
          description="A group that does not fit its container scrolls. The glider scrolls with the items."
          code={`<Glider $hover />`}
        >
          <div className="w-52">
            <Segments name="Scrolling" icons glider={hoverGlider} />
          </div>
        </Example>

        <Example
          title="Stretched"
          description="The glider follows items that share the width of the group when the group resizes."
          code={`<RadioGroup $layout="stretch"><Glider $hover /></RadioGroup>`}
          stretch
        >
          <Segments name="Stretched" $layout="stretch" glider={hoverGlider} />
        </Example>

        <Example
          title="Tabs"
          description="A segmented tab list with items of different widths."
          code={`<TabList $kind="segmented"><Glider $hover /></TabList>`}
        >
          <SegmentedTabs name="Tabs" glider={hoverGlider} />
        </Example>

        <Example
          title="Folder tabs"
          description="The selected folder travels between the tabs. Its curves and the corners of the panel change as it leaves or reaches the first tab."
          code={`<Tabs><TabList><Glider /></TabList></Tabs>`}
          stretch
        >
          <FolderTabs name="Folder tabs" glider={glider} />
        </Example>

        <Example
          title="Folder tabs with hover glider"
          description="Unselected folder tabs paint their hover surface on a pseudo-element. The hover box paints it instead, and the selected folder travels above it."
          code={`<Tabs><TabList><Glider $hover /></TabList></Tabs>`}
          stretch
        >
          <FolderTabs
            name="Folder tabs with hover glider"
            glider={hoverGlider}
          />
        </Example>

        <Example
          title="Panels that change with the selection"
          description="The panels element changes on each selection, as with panels that each page of a router renders. A new panels element starts at the place of the box, so its corners change with the folder."
          code={`<TabPanels key={selectedId} />`}
          stretch
        >
          <KeyedPanelsTabs
            name="Panels that change with the selection"
            glider={glider}
          />
        </Example>

        <Example
          title="Glider in a tab panel"
          description="A segmented control with its own glider in the panel of folder tabs. Only the glider of the tab strip shapes the corners of the panel."
          code={`<TabPanel><RadioGroup><Glider /></RadioGroup></TabPanel>`}
          stretch
        >
          <FolderTabs
            name="Glider in a tab panel"
            glider={glider}
            panel={<Segments name="View in a tab panel" glider={glider} />}
          />
        </Example>

        <Example
          title="Folder tabs with no outer edge"
          description="With no edge around the root, the curve of the folder adapts: it reduces its radius with the panel corner, so both fit the space between the folder and the start of the strip. Set the travel time to very slow, select Month, then Day."
          code={`<Tabs $outerEdge={false}><TabList><Glider /></TabList></Tabs>`}
          stretch
        >
          <FolderTabs
            name="Folder tabs with no outer edge"
            outerEdge={false}
            glider={glider}
          />
        </Example>

        <Example
          title="Adapted folder curve"
          description="An indented strip with an edge and an adapted curve. The first folder rests with a reduced curve and a reduced panel corner, which grow as the folder leaves."
          code={`<Tabs $folderCurve="adapt" $indent={2}><TabList><Glider /></TabList></Tabs>`}
          stretch
        >
          <FolderTabs
            name="Adapted folder curve"
            folderCurve="adapt"
            indent={2}
            glider={glider}
          />
        </Example>

        <Example
          title="Cut folder curve"
          description="An indented strip with a cut curve. The curve of the first folder keeps its full radius and stops at the edge of the root, and the box paints the same curve."
          code={`<Tabs $folderCurve="cut" $indent={2}><TabList><Glider /></TabList></Tabs>`}
          stretch
        >
          <FolderTabs
            name="Cut folder curve"
            folderCurve="cut"
            indent={2}
            glider={glider}
          />
        </Example>

        <Example
          title="Vertical navigation"
          description="The current link and the hovered link of a vertical navigation."
          code={`<Nav><Glider $hover /></Nav>`}
        >
          <VerticalNav name="Vertical navigation" glider={hoverGlider} />
        </Example>
        <Example
          title="Stretched folder tabs"
          description="In a stretched strip, the last folder meets the end corner of the panel like the first folder meets the start corner."
          code={`<Tabs><TabList $layout="stretch"><Glider /></TabList></Tabs>`}
          stretch
        >
          <FolderTabs
            name="Stretched folder tabs"
            layout="stretch"
            glider={glider}
          />
        </Example>

        <Example
          title="Mixed selected surfaces"
          description="Each item has its own selected surface: raised, flat brand, inverted, and a round flat one. The box takes the look of the item that it travels to when the travel starts."
          code={`<RadioCard $kind="segmented-flat" $layer="brand" /><RadioCard $invert />`}
        >
          <Segments
            name="Mixed selected surfaces"
            items={mixedSelected}
            icons
            glider={glider}
          />
        </Example>

        <Example
          title="Mixed hover surfaces"
          description="Each item has its own hover surface and hover text. The hover box takes the look of the hovered item when it starts to travel to it."
          code={`<RadioCard $layer="brand" /><RadioCard $hoverOffset={4} $rounded="full" /><Glider $hover />`}
        >
          <Segments
            name="Mixed hover surfaces"
            items={mixedHover}
            icons
            glider={hoverGlider}
          />
        </Example>

        <Example
          title="Items of two widths"
          description="Set the travel time to slow, select Grid, then Board before the box stops. The width of the box turns back sooner than the box arrives, and the box keeps its copies until it stops."
          code={`<RadioCard className="w-20" /><RadioCard className="w-40" />`}
        >
          <Segments
            name="Items of two widths"
            items={twoWidths}
            glider={glider}
          />
        </Example>

        <Example
          title="Mixed tab kinds"
          description="Folder, bevel, flat, and brand tabs in one list. Each kind has its own selected, hover, and focus appearance. Use the arrow keys to see the focus appearance."
          code={`<Tab /><Tab $kind="bevel" /><Tab $kind="flat" /><Glider $hover />`}
          stretch
        >
          <MixedTabs name="Mixed tab kinds" glider={hoverGlider} />
        </Example>

        <Example
          title="Flat tab before folders"
          description="A selected flat tab does not meet the panel, so the panel keeps its round start corner, even with the flat tab at the start of the strip."
          code={`<Tab $kind="flat" /><Tab /><Tab /><Glider />`}
          stretch
        >
          <MixedTabs
            name="Flat tab before folders"
            tabs={flatFirstTabs}
            glider={glider}
          />
        </Example>

        <Example
          title="Limit: letters at the box edge"
          description="The content in the box is a copy in the selected state, which has a heavier weight. A letter under the edge of the box shows its heavy part in the box and its light part out of it, and the two parts do not align. Set the travel time to very slow, then select Calendar."
          code={`<Glider />`}
        >
          <div className="text-3xl">
            <Segments name="Limit: letters at the box edge" glider={glider} />
          </div>
        </Example>

        <Example
          title="Horizontal navigation"
          description="The rule that sets the weight of a horizontal navigation link needs the link to be a direct child of the navigation. A copy is in the glider, so it takes the weight from its link."
          code={`<Nav $layout="horizontal"><NavLink text="Overview" /><Glider /></Nav>`}
          stretch
        >
          <HorizontalNav name="Horizontal navigation" glider={glider} />
        </Example>

        <Example
          title="Slow folder tabs"
          description="These tabs set a travel time of 1.5 seconds on the element around the strip and the panel. The curve of the folder and the corner of the panel change in the same time as the travel."
          code={`<Tabs className="[--glider-duration:1.5s]"><TabList><Glider /></TabList></Tabs>`}
          stretch
        >
          <div className="[--glider-duration:1.5s]">
            <FolderTabs name="Slow folder tabs" glider={glider} />
          </div>
        </Example>
      </ExampleGrid>
    </>
  );
}
