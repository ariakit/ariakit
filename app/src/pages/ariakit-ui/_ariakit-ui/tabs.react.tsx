/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type {
  TabGliderProps,
  TabListProps,
  TabPanelsProps,
  TabProps,
  TabsProps,
} from "@ariakit/ui/components/tabs.ariakit.react.tsx";
import {
  Tab,
  TabGlider,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
  TabSeparator,
  TabSlot,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react.tsx";
import * as icons from "lucide-react";
import * as React from "react";
import {
  Caption,
  Labeled,
  Sample,
  Samples,
  Stage,
  LOREM,
} from "./gallery.react.tsx";

const labels = ["Preview", "Code", "Usage"];

interface DemoTabsProps extends TabsProps {
  /** The index of the initially selected tab. */
  selected?: number;
  tabProps?: TabProps;
  listProps?: TabListProps;
  panelsProps?: TabPanelsProps;
  gliders?: TabGliderProps[];
  separators?: boolean;
  /** Whether the Code tab carries a badge slot. */
  badge?: boolean;
  tabLabels?: string[];
}

function DemoTabs({
  selected = 0,
  tabProps,
  listProps,
  panelsProps,
  gliders,
  separators,
  badge,
  tabLabels = labels,
  ...props
}: DemoTabsProps) {
  const baseId = React.useId();
  const getId = (index: number) => `${baseId}-${index}`;
  return (
    <Tabs
      $rounded="xl"
      $p={1}
      defaultSelectedId={getId(selected)}
      {...props}
      className={`overflow-clip ${props.className ?? ""}`}
    >
      <TabList {...listProps}>
        {tabLabels.map((label, index) => (
          <React.Fragment key={label}>
            {separators && index > 0 && <TabSeparator $kind="chevron" />}
            <Tab id={getId(index)} {...tabProps}>
              <TabLabel>{label}</TabLabel>
              {badge && index === 1 && (
                <TabSlot $kind="badge" $layer="brand">
                  3
                </TabSlot>
              )}
            </Tab>
          </React.Fragment>
        ))}
        {gliders?.map((glider, index) => (
          <TabGlider key={index} {...glider} />
        ))}
      </TabList>
      <TabPanels {...panelsProps}>
        <TabPanel single>
          <p className="text-sm">{LOREM}</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

const manyLabels = [
  "Overview",
  "Installation",
  "Usage",
  "Props",
  "Styling",
  "Accessibility",
  "Examples",
  "Changelog",
  "Source",
];

export function TabsSection() {
  return (
    <Samples columns="wide">
      <Sample
        title="Folder tabs"
        code='Tabs $rounded="xl" $p={1} > TabList > Tab · TabPanels > TabPanel single'
        description="The selected tab drops its bottom corners and merges into the panel below. Click through the tabs to watch the corners follow."
      >
        <Stage direction="column">
          <DemoTabs />
          <DemoTabs selected={1} listProps={{ $p: 1 }} />
        </Stage>
      </Sample>

      <Sample
        title="Borders"
        code="$border={false} · $border · $border={3} · $border={4}"
        description="The root's edge is the one the tabs and the panel share, so widening it widens the folder seam."
      >
        <Stage direction="column">
          <DemoTabs $border={false} />
          <DemoTabs selected={1} $border={3} listProps={{ $p: 1 }} />
          <DemoTabs selected={2} $border={4} />
        </Stage>
      </Sample>

      <Sample
        title="Edges"
        code='$edge="brand" $edgeRaw · $edge="brand" $border={3} · $edgeWeight="bold"'
        description="Colored and heavier edges around the folder."
      >
        <Stage direction="column">
          <DemoTabs $edge="brand" $edgeRaw />
          <DemoTabs selected={1} $edge="brand" $border={3} />
          <DemoTabs selected={2} $edgeWeight="bold" $borderType="border" />
        </Stage>
      </Sample>

      <Sample
        title="Tab kinds"
        code='Tab $kind="folder" | "flat" | "bevel"'
        description="A flat or bevel tab is a plain button in the strip, so the panel keeps its top corners."
      >
        <Stage direction="column">
          <DemoTabs tabProps={{ $kind: "flat" }} listProps={{ $p: 1 }} />
          <DemoTabs
            selected={1}
            tabProps={{ $kind: "bevel" }}
            listProps={{ $p: 1 }}
          />
        </Stage>
      </Sample>

      <Sample
        title="Gliders"
        code='TabGlider $kind="folder" | "flat" | "bevel" | "bar" $state="selected"'
        description="With a glider the selected tab paints nothing itself and the glider travels between tabs."
      >
        <Stage direction="column">
          <Labeled label="Folder">
            <DemoTabs
              selected={1}
              listProps={{ $p: 1 }}
              gliders={[{ $kind: "folder", $state: "selected" }]}
            />
          </Labeled>
          <Labeled label="Flat">
            <DemoTabs
              tabProps={{ $kind: "flat" }}
              listProps={{ $p: 1 }}
              gliders={[{ $kind: "flat", $state: "selected" }]}
            />
          </Labeled>
          <Labeled label="Bevel">
            <DemoTabs
              selected={2}
              tabProps={{ $kind: "flat" }}
              listProps={{ $p: 1 }}
              gliders={[{ $kind: "bevel", $state: "selected" }]}
            />
          </Labeled>
          <Labeled label="Bar">
            <DemoTabs
              selected={1}
              tabProps={{ $kind: "flat" }}
              listProps={{ $p: 1 }}
              gliders={[{ $kind: "bar", $state: "selected" }]}
            />
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="Hover and focus gliders"
        code='TabGlider $state="hover" · $state="focus"'
        description="A hover glider paints an inset rectangle under the pointer, and a focus glider draws the ring. Hover and tab through the strips."
      >
        <Stage direction="column">
          <DemoTabs
            listProps={{ $p: 1 }}
            gliders={[
              { $kind: "folder", $state: "selected" },
              { $kind: "folder", $state: "hover" },
            ]}
          />
          <DemoTabs
            selected={1}
            listProps={{ $p: 1 }}
            gliders={[
              { $kind: "folder", $state: "selected" },
              { $kind: "folder", $state: "hover" },
              { $kind: "folder", $state: "focus" },
            ]}
          />
        </Stage>
      </Sample>

      <Sample
        title="Slots and separators"
        code='TabSlot $kind="badge" · TabSeparator $kind="chevron"'
        description="A badge in the Code tab, and chevrons between the tabs."
      >
        <Stage direction="column">
          <DemoTabs badge selected={1} />
          <DemoTabs separators />
          <DemoTabs
            separators
            badge
            selected={2}
            $border={3}
            $edge="brand"
            $edgeRaw
          />
        </Stage>
      </Sample>

      <Sample
        title="Panels"
        code="TabPanels $roundedTop={false} · $p={4} · $lightnessOffset={false}"
        description="The panel squares its top corners when the strip paints its own surface, and takes its own padding and lift."
      >
        <Stage direction="column">
          <DemoTabs panelsProps={{ $roundedTop: false }} />
          <DemoTabs selected={1} panelsProps={{ $p: 4 }} />
          <DemoTabs
            selected={2}
            panelsProps={{ $lightnessOffset: false }}
            $lighten={1.2}
          />
        </Stage>
      </Sample>

      <Sample
        title="Sizes and disabled"
        code='TabList $size="sm" | "lg" · Tab disabled'
        description="The strip sizes its tabs together. A disabled tab keeps its place in the strip."
      >
        <Stage direction="column">
          <DemoTabs listProps={{ $size: "sm", $p: 1 }} />
          <DemoTabs listProps={{ $size: "lg" }} selected={1} />
          <Tabs $rounded="xl" $p={1} className="overflow-clip">
            <TabList $p={1}>
              <Tab>
                <TabLabel>Enabled</TabLabel>
              </Tab>
              <Tab disabled>
                <TabLabel>Disabled</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>
                  <span className="inline-flex items-center gap-1">
                    <icons.Code className="size-[1em]" />
                    With icon
                  </span>
                </TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">{LOREM}</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stage>
      </Sample>

      <Sample
        title="Overflow"
        code="A strip with more tabs than fit"
        description="Trailing tabs stay reachable by pointer when the strip overflows, and the last tab's curve stays inside the clip."
      >
        <div className="max-w-sm">
          <DemoTabs tabLabels={manyLabels} selected={3} listProps={{ $p: 1 }} />
        </div>
      </Sample>

      <Sample
        title="Tabs prop"
        code='TabList tabs={["Preview", "Code"]} · tabs={{ id: props }}'
        description="The strip can build its tabs from an array of labels or a record of ids to props."
      >
        <Stage direction="column">
          <Tabs $rounded="xl" $p={1} className="overflow-clip">
            <TabList tabs={["Preview", "Code", "Usage"]} />
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">Built from an array.</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
          <Tabs
            $rounded="xl"
            $p={1}
            defaultSelectedId="code"
            className="overflow-clip"
          >
            <TabList
              tabs={{
                preview: "Preview",
                code: { children: "Code", $kind: "flat" },
                usage: { children: "Usage", disabled: true },
              }}
            />
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">
                  Built from a record, with the Code tab selected.
                </p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="Tabs inside Layer"
        description="The folder reads the surface it sits on for its seam and its panel."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <DemoTabs selected={1} listProps={{ $p: 1 }} />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <DemoTabs
              listProps={{ $p: 1 }}
              gliders={[{ $kind: "folder", $state: "selected" }]}
            />
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
