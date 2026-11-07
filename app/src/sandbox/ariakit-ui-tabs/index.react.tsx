/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { CarouselButton } from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Tab,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
  TabProvider,
  TabSeparator,
  TabSlot,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { tab, tabList } from "@ariakit/ui/styles/tabs";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BracesIcon,
  EyeIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

function BarPlacement() {
  const [offset, setOffset] = useState("edge");
  const [side, setSide] = useState<"start" | "end">("end");
  const [rtl, setRtl] = useState(false);
  const bar = { $offset: offset, $side: side };
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={rtl}
          onChange={(event) => setRtl(event.target.checked)}
        />{" "}
        Tabs right to left
      </label>
      <label>
        Tab bar distance{" "}
        <select
          value={offset}
          onChange={(event) => setOffset(event.target.value)}
        >
          <option value="edge">Edge</option>
          <option value="halfway">Halfway</option>
          <option value="6px">6px</option>
          <option value="0px">Against the item</option>
          <option value="-3px">Over the item</option>
        </select>
      </label>
      <label>
        Tab bar side{" "}
        <select
          value={side}
          onChange={(event) =>
            setSide(event.target.value === "start" ? "start" : "end")
          }
        >
          <option value="end">Bottom</option>
          <option value="start">Top</option>
        </select>
      </label>
      <Tabs
        defaultSelectedId="placement-preview"
        $p={3}
        rtl={rtl}
        dir={rtl ? "rtl" : "ltr"}
        className="w-64 max-w-full"
      >
        <TabList
          aria-label="Bar placement"
          $p={3}
          className="[&>.control]:shrink-0 [&>.control]:whitespace-nowrap"
        >
          <Tab id="placement-preview" $kind="bevel" $selectedPush={1} bar={bar}>
            Preview
          </Tab>
          <Tab id="placement-code" $kind="flat" $selectedOffset={2} bar={bar}>
            Code
          </Tab>
          <Tab id="placement-settings" $kind="flat" bar={bar}>
            Project settings
          </Tab>
        </TabList>
        <TabPanel single>Switch tabs to move the bar.</TabPanel>
      </Tabs>
    </div>
  );
}

interface MessageProps {
  children: string;
}

// A message component, such as one from a translation library, makes the label
// children an element, so the label can't read its text.
function Message({ children }: MessageProps) {
  return <>{children}</>;
}

interface ActivityTabsProps {
  name: string;
  pinned?: boolean;
}

function ActivityTabs({ name, pinned }: ActivityTabsProps) {
  const activityId = `${name.toLowerCase()}-activity`;
  const reviewsId = `${name.toLowerCase()}-reviews`;
  const store = ak.useTabStore({ defaultSelectedId: activityId });
  const selectedId = ak.useStoreState(store, "selectedId");
  // Pinned panels keep their tabId when another tab becomes selected.
  return (
    <section className="grid gap-2">
      <h2>{name} updates</h2>
      <TabList store={store} aria-label={`${name} updates`}>
        <Tab id={activityId}>{name} activity</Tab>
        <Tab id={reviewsId}>{name} reviews</Tab>
      </TabList>
      <TabPanel store={store} single {...(pinned && { tabId: activityId })}>
        {selectedId === activityId
          ? `${name} activity updates`
          : `${name} review updates`}
      </TabPanel>
    </section>
  );
}

// Migrated from the tab-panel-shared-store sandbox without changes: Tab,
// TabList and TabPanel with explicit stores and no Tabs root.
function TabPanelSharedStore() {
  // Team's explicit store must take precedence over the surrounding provider.
  return (
    <div className="grid gap-6">
      <ActivityTabs name="Project" />
      <TabProvider defaultSelectedId="unrelated">
        <ActivityTabs name="Team" />
      </TabProvider>
      <ActivityTabs name="Pinned" pinned />
    </div>
  );
}

// Tabs built from permissions. Each hidden tab leaves a false, true, null, or
// undefined entry, which must render no tab.
function ConditionalTabs() {
  const [canEdit, setCanEdit] = useState(false);
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={canEdit}
          onChange={(event) => setCanEdit(event.target.checked)}
        />{" "}
        Can edit project settings
      </label>
      <Tabs defaultSelectedId="conditional-overview">
        <TabList
          aria-label="Project pages"
          tabs={[
            { id: "conditional-overview", children: "Overview" },
            canEdit && { id: "conditional-settings", children: "Settings" },
            canEdit || {
              id: "conditional-request",
              children: "Request access",
            },
            { id: "conditional-activity", children: "Activity" },
          ]}
        />
        <TabPanels>
          <TabPanel tabId="conditional-overview">Project overview</TabPanel>
          {canEdit && (
            <TabPanel tabId="conditional-settings">Project settings</TabPanel>
          )}
          {!canEdit && (
            <TabPanel tabId="conditional-request">Ask an owner</TabPanel>
          )}
          <TabPanel tabId="conditional-activity">Project activity</TabPanel>
        </TabPanels>
      </Tabs>
      <Tabs defaultSelectedId="conditional-record-overview">
        <TabList
          aria-label="Project pages record"
          tabs={{
            "conditional-record-overview": "Overview",
            "conditional-record-settings": canEdit ? "Settings" : undefined,
            "conditional-record-request": canEdit ? null : "Request access",
            "conditional-record-activity": "Activity",
          }}
        />
        <TabPanels>
          <TabPanel single>
            <p className="text-sm">Project page details.</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

interface BrandButtonsTabsProps {
  /** The name of the next button, which a parent can leave out. */
  nextLabel?: string;
}

/**
 * Tabs whose scroll buttons take the brand layer: the previous button as an
 * element, and the next button as props that pass an optional name through.
 */
function BrandButtonsTabs({ nextLabel }: BrandButtonsTabsProps) {
  return (
    <Tabs className="w-64 max-w-full">
      <TabList
        aria-label="Overflowing strip with brand buttons"
        previousButton={<CarouselButton $layer="brand" />}
        nextButton={{ $layer: "brand", "aria-label": nextLabel }}
        tabs={["Overview", "Usage", "Styling", "Changelog"]}
      />
      <TabPanels>
        <TabPanel single>
          <p className="text-sm">The buttons take the brand color.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

// Every box passes an explicit defaultSelectedId with page-unique ids, so the
// first render already marks the selected tab.

export default function TabsExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The selected tab drops its bottom corners and merges into its panel. Each tab has its own panel. The tabs sit on the root's edge, and the selected first tab takes the root's corner, so it has no start curve."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                …
              </TabPanel>
              <TabPanel>
                …
              </TabPanel>
              <TabPanel>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="folder-preview">
          <TabList aria-label="Default">
            <Tab id="folder-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="folder-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="folder-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel tabId="folder-preview">
              <p className="text-sm">The rendered component appears here.</p>
            </TabPanel>
            <TabPanel tabId="folder-code">
              <p className="text-sm">The source of the component.</p>
            </TabPanel>
            <TabPanel tabId="folder-usage">
              <p className="text-sm">How to use the component.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Shared panel"
        description="One shared panel follows the selected tab. With the middle tab selected, both curves show and the panel keeps its whole start corner."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="shared-code">
          <TabList aria-label="Shared panel">
            <Tab id="shared-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="shared-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="shared-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">One panel follows every tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="With padding"
        description="Padding on the root moves the tabs away from its edge. The selected first tab keeps its full start curve, and the root edge cuts the part that does not fit, so the panel corner stays square. The strip and the panel still reach the root's edge. Folder tabs take that padding from their own, so the strip grows only a little."
        stretch
        code={`
          <Tabs $p={1}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} defaultSelectedId="padded-preview">
          <TabList aria-label="With padding">
            <Tab id="padded-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="padded-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="padded-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The root has padding.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Block flow"
        description="The root sits in a block container instead of a flex one. The tabs and panels still sit on the root's edge, so the selected tab and the panels each show one edge, not two."
        stretch
        code={`
          <div>
            <Tabs>
              <TabList>
                <Tab>
                  <TabLabel>Preview</TabLabel>
                </Tab>
                <Tab>
                  <TabLabel>Code</TabLabel>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel single>
                  …
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        `}
      >
        <div>
          <Tabs defaultSelectedId="flush-block-preview">
            <TabList aria-label="Block flow">
              <Tab id="flush-block-preview">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab id="flush-block-code">
                <TabLabel>Code</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">The root is a block-level box.</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </Example>

      <Example
        title="Flex root"
        description="A display class on the root replaces its default display. Here, the root is a flex column, and the panels grow to fill its height."
        stretch
        code={`
          <Tabs className="flex h-40 flex-col">
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
            </TabList>
            <TabPanels className="grow">
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          defaultSelectedId="flex-root-preview"
          className="flex h-40 flex-col"
        >
          <TabList aria-label="Flex root">
            <Tab id="flex-root-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="flex-root-code">
              <TabLabel>Code</TabLabel>
            </Tab>
          </TabList>
          <TabPanels className="grow">
            <TabPanel single>
              <p className="text-sm">The panels fill the root.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Without outer edge"
        description="The selected tab and panel keep their borders. The root has no visible border, and the strip keeps the color around the root."
        stretch
        code={`
          <Tabs $outerEdge={false} $darken={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          $outerEdge={false}
          $darken={false}
          defaultSelectedId="flush-hidden-preview"
        >
          <TabList aria-label="Without outer edge">
            <Tab id="flush-hidden-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="flush-hidden-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="flush-hidden-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                Only the selected tab and panel have borders.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Indented without outer edge"
        description="$indent moves the tabs away from the panel edge without padding above them. The selected first tab meets a rounded panel corner, and the tabs keep the full radius."
        stretch
        code={`
          <Tabs $outerEdge={false} $indent={3} $darken={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          $outerEdge={false}
          $indent={3}
          $darken={false}
          defaultSelectedId="indented-preview"
        >
          <TabList aria-label="Indented without outer edge">
            <Tab id="indented-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="indented-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="indented-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                The first tab sits away from the panel edge.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Indented to full radii"
        description='$indent="auto" leaves room for the full panel corner and the full curve of the selected first tab. It replaces the root padding beside the tabs, and the padding above them stays.'
        stretch
        code={`
          <Tabs $p={1} $indent="auto">
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} $indent="auto" defaultSelectedId="auto-indent-preview">
          <TabList aria-label="Indented to full radii">
            <Tab id="auto-indent-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="auto-indent-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="auto-indent-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                The panel corner and the tab curve keep the full radius.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Indented to a full radius beside square panel corners"
        description='With square panel corners, $indent="auto" leaves room only for the full curve of the selected first tab.'
        stretch
        code={`
          <Tabs $p={1} $indent="auto" $panelRoundedTop={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          $p={1}
          $indent="auto"
          $panelRoundedTop={false}
          defaultSelectedId="auto-indent-square-preview"
        >
          <TabList aria-label="Indented to a full radius beside square panel corners">
            <Tab id="auto-indent-square-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="auto-indent-square-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="auto-indent-square-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The tab curve keeps the full radius.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Indented to full radii with a thick root edge"
        description='When the root edge is wider than half of both radii, $indent="auto" still leaves exactly enough room for them.'
        stretch
        code={`
          <Tabs $p={1} $indent="auto" $rounded="xs" $border={3}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          $p={1}
          $indent="auto"
          $rounded="xs"
          $border={3}
          defaultSelectedId="auto-indent-thick-preview"
        >
          <TabList aria-label="Indented to full radii with a thick root edge">
            <Tab id="auto-indent-thick-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="auto-indent-thick-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="auto-indent-thick-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                The thick edge fills part of the indent.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Adaptive folder curve"
        description='$folderCurve="adapt" shrinks the curve of the selected first tab and the panel corner together, so both fit the padding instead of the root edge cutting the curve.'
        stretch
        code={`
          <Tabs $p={1} $folderCurve="adapt">
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} $folderCurve="adapt" defaultSelectedId="adapt-preview">
          <TabList aria-label="Adaptive folder curve">
            <Tab id="adapt-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="adapt-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="adapt-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                The tab curve and the panel corner share the padding.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Full folder curve beside a rounded panel corner"
        description="When the indent has room for the full curve of the selected first tab, the root edge cuts nothing, and the panel corner rounds with the space left after the curve."
        stretch
        code={`
          <Tabs $p={1} $indent={4}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} $indent={4} defaultSelectedId="cut-corner-preview">
          <TabList aria-label="Full folder curve beside a rounded panel corner">
            <Tab id="cut-corner-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="cut-corner-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="cut-corner-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                The panel corner takes the space after the curve.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Full-width strip with an adaptive curve on the last tab"
        description='With $folderCurve="adapt", the end curve of the selected last tab and the end corner of the panel shrink together.'
        stretch
        code={`
          <Tabs $p={1} $folderCurve="adapt">
            <TabList $layout="stretch">
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} $folderCurve="adapt" defaultSelectedId="adapt-last-usage">
          <TabList
            $layout="stretch"
            aria-label="Full-width strip with an adaptive curve on the last tab"
          >
            <Tab id="adapt-last-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="adapt-last-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="adapt-last-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The end corner follows the last tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Cut folder curve without outer edge"
        description='Without the outer edge, the curve adapts by default. With $folderCurve="cut", the cut still shows the edge, so it continues from the curve into the edge of the panel.'
        stretch
        code={`
          <Tabs $p={1} $folderCurve="cut" $outerEdge={false} $darken={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          $p={1}
          $folderCurve="cut"
          $outerEdge={false}
          $darken={false}
          defaultSelectedId="cut-edgeless-preview"
        >
          <TabList aria-label="Cut folder curve without outer edge">
            <Tab id="cut-edgeless-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="cut-edgeless-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="cut-edgeless-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The cut joins the edge of the panel.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Automatic indent with flat tabs"
        description='Flat tabs have no curves, so $indent="auto" has no effect, and the strip keeps its own padding.'
        stretch
        code={`
          <Tabs $indent="auto">
            <TabList $p={3}>
              <Tab $kind="flat">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $indent="auto" defaultSelectedId="auto-indent-flat-preview">
          <TabList $p={3} aria-label="Automatic indent with flat tabs">
            <Tab $kind="flat" id="auto-indent-flat-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="auto-indent-flat-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="auto-indent-flat-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">
                The strip padding stays the same on every side.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Full-width strip"
        description="The tabs share the strip's width, and the strip still reaches both ends of the root."
        stretch
        code={`
          <Tabs>
            <TabList $layout="stretch">
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="wide-code">
          <TabList $layout="stretch" aria-label="Full-width strip">
            <Tab id="wide-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="wide-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="wide-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Every tab is as wide as the others.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Full-width strip with the last tab selected"
        description="The last tab mirrors the first: the root edge cuts its full end curve, and the panel's end corner stays square."
        stretch
        code={`
          <Tabs $p={1}>
            <TabList $layout="stretch">
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} defaultSelectedId="wide-last-usage">
          <TabList
            $layout="stretch"
            aria-label="Full-width strip with the last tab selected"
          >
            <Tab id="wide-last-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="wide-last-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="wide-last-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The end corner follows the last tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      {/*
        Nested tabs fixtures. The inner tabs use $forceRounded, because
        concentric corners would shrink their radius to the size of a meet value
        that leaks from the outer tabs, which would hide the leak.
       */}
      <Example
        title="Tabs nested under a stretched strip"
        description="The inner tabs keep their own corners, though the outer strip is stretched and its last tab is selected."
        stretch
        code={`
          <Tabs>
            <TabList $layout="stretch">…</TabList>
            <TabPanels>
              <TabPanel single>
                <Tabs>
                  <TabList>…</TabList>
                  <TabPanels>…</TabPanels>
                </Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="nested-outer-settings">
          <TabList $layout="stretch" aria-label="Nested outer tabs">
            <Tab id="nested-outer-profile">
              <TabLabel>Profile</TabLabel>
            </Tab>
            <Tab id="nested-outer-settings">
              <TabLabel>Settings</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <Tabs defaultSelectedId="nested-inner-general" $forceRounded>
                <TabList aria-label="Nested inner tabs">
                  <Tab id="nested-inner-general">
                    <TabLabel>General</TabLabel>
                  </Tab>
                  <Tab id="nested-inner-privacy">
                    <TabLabel>Privacy</TabLabel>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel single>
                    <p className="text-sm">
                      The inner panel keeps its corners.
                    </p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Tabs nested under a selected first tab"
        description="The inner start corner keeps its radius, though the outer first tab is selected."
        stretch
        code={`
          <Tabs>
            <TabList>…</TabList>
            <TabPanels>
              <TabPanel single>
                <Tabs>…</Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="nested-first-profile">
          <TabList aria-label="Tabs nested under a selected first tab outer">
            <Tab id="nested-first-profile">
              <TabLabel>Profile</TabLabel>
            </Tab>
            <Tab id="nested-first-settings">
              <TabLabel>Settings</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <Tabs
                defaultSelectedId="nested-first-inner-privacy"
                $forceRounded
              >
                <TabList aria-label="Tabs nested under a selected first tab inner">
                  <Tab id="nested-first-inner-general">
                    <TabLabel>General</TabLabel>
                  </Tab>
                  <Tab id="nested-first-inner-privacy">
                    <TabLabel>Privacy</TabLabel>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel single>
                    <p className="text-sm">The inner tabs keep their shape.</p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Folder tabs nested under flat tabs"
        description="The outer panel keeps square corners. Only its own strip decides whether it holds folder tabs."
        stretch
        code={`
          <Tabs $p={1}>
            <TabList><Tab $kind="flat" />…</TabList>
            <TabPanels>
              <TabPanel single>
                <Tabs>…</Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} defaultSelectedId="nested-flat-outer-profile">
          <TabList aria-label="Folder tabs nested under flat tabs outer">
            <Tab id="nested-flat-outer-profile" $kind="flat">
              <TabLabel>Profile</TabLabel>
            </Tab>
            <Tab id="nested-flat-outer-settings" $kind="flat">
              <TabLabel>Settings</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <Tabs
                defaultSelectedId="nested-flat-outer-inner-general"
                $forceRounded
              >
                <TabList aria-label="Folder tabs nested under flat tabs inner">
                  <Tab id="nested-flat-outer-inner-general">
                    <TabLabel>General</TabLabel>
                  </Tab>
                  <Tab id="nested-flat-outer-inner-privacy">
                    <TabLabel>Privacy</TabLabel>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel single>
                    <p className="text-sm">The inner tabs keep their shape.</p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Flat tabs nested under folder tabs"
        description="The inner panel keeps square corners, though the outer tabs are folders."
        stretch
        code={`
          <Tabs>
            <TabList>…</TabList>
            <TabPanels>
              <TabPanel single>
                <Tabs $p={1}>
                  <TabList>
                    <Tab $kind="flat" />…
                  </TabList>
                  …
                </Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="nested-flat-inner-profile">
          <TabList aria-label="Flat tabs nested under folder tabs outer">
            <Tab id="nested-flat-inner-profile">
              <TabLabel>Profile</TabLabel>
            </Tab>
            <Tab id="nested-flat-inner-settings">
              <TabLabel>Settings</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <Tabs
                defaultSelectedId="nested-flat-inner-inner-general"
                $p={1}
                $forceRounded
              >
                <TabList aria-label="Flat tabs nested under folder tabs inner">
                  <Tab id="nested-flat-inner-inner-general" $kind="flat">
                    <TabLabel>General</TabLabel>
                  </Tab>
                  <Tab id="nested-flat-inner-inner-privacy" $kind="flat">
                    <TabLabel>Privacy</TabLabel>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel single>
                    <p className="text-sm">The inner tabs keep their shape.</p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Square panel corners nested under folder tabs"
        description="The inner panel keeps the square corners that it asks for."
        stretch
        code={`
          <Tabs>
            <TabList>…</TabList>
            <TabPanels>
              <TabPanel single>
                <Tabs $p={1} $panelRoundedTop={false}>…</Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="nested-square-profile">
          <TabList aria-label="Square panel corners nested under folder tabs outer">
            <Tab id="nested-square-profile">
              <TabLabel>Profile</TabLabel>
            </Tab>
            <Tab id="nested-square-settings">
              <TabLabel>Settings</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <Tabs
                defaultSelectedId="nested-square-inner-general"
                $p={1}
                $forceRounded
                $panelRoundedTop={false}
              >
                <TabList aria-label="Square panel corners nested under folder tabs inner">
                  <Tab id="nested-square-inner-general">
                    <TabLabel>General</TabLabel>
                  </Tab>
                  <Tab id="nested-square-inner-privacy">
                    <TabLabel>Privacy</TabLabel>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel single>
                    <p className="text-sm">The inner tabs keep their shape.</p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Edgeless"
        description="The root has no edge, so the tabs and the panel draw none either."
        stretch
        code={`
          <Tabs $border={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $border={false} defaultSelectedId="edgeless-code">
          <TabList aria-label="Edgeless">
            <Tab id="edgeless-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="edgeless-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="edgeless-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">No edge around the folder.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Darkened strip without outer edge"
        description="The root paints its own edge transparent but keeps its padding and the darker strip. The selected tab and the panel keep drawing the edge."
        stretch
        code={`
          <Tabs $outerEdge={false} $p={1}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $outerEdge={false} $p={1} defaultSelectedId="hidden-code">
          <TabList aria-label="Darkened strip without outer edge">
            <Tab id="hidden-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="hidden-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="hidden-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">A folder with no card around it.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Adaptive root edge with padding"
        description="The root, the selected tab, and the panel show their edges only in high-contrast mode. Hidden, the panel border leaves no strip-colored line around the panel."
        stretch
        code={`
          <Tabs $edgeWeight="adaptive" $p={1}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $edgeWeight="adaptive" $p={1} defaultSelectedId="adaptive-code">
          <TabList aria-label="Adaptive root edge with padding">
            <Tab id="adaptive-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="adaptive-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="adaptive-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The edges show with more contrast.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Adaptive root edge"
        description="The selected tab lies on the hidden root edge and leaves no strip-colored line above it."
        stretch
        code={`
          <Tabs $edgeWeight="adaptive">
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $edgeWeight="adaptive" defaultSelectedId="adaptive-flush-code">
          <TabList aria-label="Adaptive root edge">
            <Tab id="adaptive-flush-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="adaptive-flush-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="adaptive-flush-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The edges show with more contrast.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Thick edge"
        description="A thicker root edge widens the seam that the selected tab and the panel share."
        stretch
        code={`
          <Tabs $border={3}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $border={3} defaultSelectedId="thick-code">
          <TabList aria-label="Thick edge">
            <Tab id="thick-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="thick-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="thick-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The seam is three pixels wide.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Brand edge"
        description="The brand edge keeps its own color around the root, along the selected tab's curves and around the panel."
        stretch
        code={`
          <Tabs $edge="brand" $edgeRaw>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $edge="brand" $edgeRaw defaultSelectedId="brand-edge-preview">
          <TabList aria-label="Brand edge">
            <Tab id="brand-edge-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="brand-edge-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="brand-edge-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The edge keeps the brand color.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Bold edge"
        description="A heavier translucent edge. The curves blend into the straight edges with no darker seams."
        stretch
        code={`
          <Tabs $edgeWeight="bold">
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $edgeWeight="bold" defaultSelectedId="bold-usage">
          <TabList aria-label="Bold edge">
            <Tab id="bold-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="bold-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="bold-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The edge is easier to see.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Square panel corners"
        description="The strip ends at the seam, and the panel keeps square top corners."
        stretch
        code={`
          <Tabs $panelRoundedTop={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $panelRoundedTop={false} defaultSelectedId="square-code">
          <TabList aria-label="Square panel corners">
            <Tab id="square-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="square-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="square-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The panel corners stay square.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Flat tabs"
        description="A flat tab is a plain button in the strip. The selected tab lifts off the strip as a pill."
        stretch
        code={`
          <Tabs $p={1}>
            <TabList>
              <Tab $kind="flat">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} defaultSelectedId="flat-code">
          <TabList aria-label="Flat tabs">
            <Tab $kind="flat" id="flat-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="flat-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="flat-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Flat tabs leave the corners square.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Bevel tabs"
        description="The selected tab rises with the gradient and inner shadow of a push button."
        stretch
        code={`
          <Tabs $p={1}>
            <TabList>
              <Tab $kind="bevel">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="bevel">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="bevel">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} defaultSelectedId="bevel-code">
          <TabList aria-label="Bevel tabs">
            <Tab $kind="bevel" id="bevel-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="bevel" id="bevel-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="bevel" id="bevel-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The selected tab looks pressable.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Folder tabs"
        description="The selected folder tab joins its panel. Arrow keys move focus without selecting."
        stretch
        code={`
          <Tabs selectOnMove={false}>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs selectOnMove={false} defaultSelectedId="folder-code">
          <TabList aria-label="Folder tabs">
            <Tab id="folder-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="folder-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="folder-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Press Enter to select a focused tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Static folder"
        description='A folder that is not a tab, such as a file name over its code. data-selected="true" makes it look selected, and it meets the panel like a selected first tab.'
        stretch
        code={`
          <Tabs>
            <div {...tabList.jsx()}>
              <div {...tab.jsx()} data-selected="true">
                <TabLabel>counter.tsx</TabLabel>
              </div>
            </div>
            <TabPanels>
              …
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs>
          <div {...tabList.jsx()}>
            <div {...tab.jsx()} data-selected="true">
              <TabLabel>counter.tsx</TabLabel>
            </div>
          </div>
          <TabPanels>
            <p className="text-sm">The code of the file.</p>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Stretched static folder"
        description="A static folder that fills its strip is both the first and the last folder, so it meets both panel corners like a selected tab in a full-width strip."
        stretch
        code={`
          <Tabs>
            <div {...tabList.jsx({ $layout: "stretch" })}>
              <div {...tab.jsx()} data-selected="true">
                <TabLabel>counter.tsx</TabLabel>
              </div>
            </div>
            <TabPanels>
              …
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs>
          <div {...tabList.jsx({ $layout: "stretch" })}>
            <div {...tab.jsx()} data-selected="true">
              <TabLabel>counter.tsx</TabLabel>
            </div>
          </div>
          <TabPanels>
            <p className="text-sm">The code of the file.</p>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Flat tabs without select on move"
        description="Arrow keys move focus without selecting. The brand fill marks the focused tab."
        stretch
        code={`
          <Tabs $p={1} selectOnMove={false}>
            <TabList>
              <Tab $kind="flat">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} selectOnMove={false} defaultSelectedId="manual-flat-code">
          <TabList aria-label="Flat tabs without select on move">
            <Tab $kind="flat" id="manual-flat-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="manual-flat-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="manual-flat-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Press Enter to select a focused tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Borderless flat tabs"
        description="A pill marks the selected tab while the tab panels have no border."
        stretch
        code={`
          <Tabs $border={false} $p={1}>
            <TabList>
              <Tab $kind="flat">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="flat">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          $border={false}
          $p={1}
          defaultSelectedId="borderless-flat-preview"
        >
          <TabList aria-label="Borderless flat tabs">
            <Tab $kind="flat" id="borderless-flat-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="borderless-flat-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="borderless-flat-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The panel has no edge.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Borderless bevel tabs"
        description="A bevel pill marks the selected tab while the tab panels have no border."
        stretch
        code={`
          <Tabs $border={false} $p={1}>
            <TabList>
              <Tab $kind="bevel">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="bevel">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="bevel">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $border={false} $p={1} defaultSelectedId="borderless-bevel-usage">
          <TabList aria-label="Borderless bevel tabs">
            <Tab $kind="bevel" id="borderless-bevel-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="bevel" id="borderless-bevel-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="bevel" id="borderless-bevel-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The pill looks pressable.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Tab bar"
        description="A bar underlines the selected tab, and the tab keeps its own fill."
        stretch
        code={`
          <Tabs $p={1}>
            <TabList>
              <Tab $kind="flat" bar>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab $kind="flat" bar>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab $kind="flat" bar>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs $p={1} defaultSelectedId="bar-code">
          <TabList aria-label="Tab bar">
            <Tab $kind="flat" id="bar-preview" bar>
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="bar-code" bar>
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="bar-usage" bar>
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The bar marks the selected tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Small tabs"
        description="The strip sets the size of all its tabs."
        stretch
        code={`
          <Tabs>
            <TabList $size="sm">
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="small-code">
          <TabList $size="sm" aria-label="Small tabs">
            <Tab id="small-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="small-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="small-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Smaller labels and padding.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Tabs with icons"
        description="An icon slot before each label."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabSlot>
                  <Eye />
                </TabSlot>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabSlot>
                  <Braces />
                </TabSlot>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabSlot>
                  <BookOpen />
                </TabSlot>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="icons-code">
          <TabList aria-label="Tabs with icons">
            <Tab id="icons-preview">
              <TabSlot>
                <EyeIcon />
              </TabSlot>
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="icons-code">
              <TabSlot>
                <BracesIcon />
              </TabSlot>
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="icons-usage">
              <TabSlot>
                <BookOpenIcon />
              </TabSlot>
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">An icon before each label.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Tab with a badge"
        description="A badge slot after the Code label shows a count."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Code</TabLabel>
                <TabSlot $kind="box">
                  <Badge $kind="solid" $round>3</Badge>
                </TabSlot>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="badge-code">
          <TabList aria-label="Tab with a badge">
            <Tab id="badge-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="badge-code">
              <TabLabel>Code</TabLabel>
              <TabSlot $kind="box">
                <Badge $kind="solid" $round>
                  3
                </Badge>
              </TabSlot>
            </Tab>
            <Tab id="badge-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Three files changed in this commit.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Grown tab labels"
        description="A grown label fills a stretched tab and starts its text, so the badge sits at the end of the tab."
        stretch
        code={`
          <Tabs>
            <TabList $layout="stretch">
              <Tab>
                <TabLabel $grow>Inbox</TabLabel>
                <TabSlot $kind="box">
                  <Badge $kind="solid" $round>3</Badge>
                </TabSlot>
              </Tab>
              …
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="grown-inbox">
          <TabList aria-label="Grown tab labels" $layout="stretch">
            <Tab id="grown-inbox">
              <TabLabel $grow>Inbox</TabLabel>
              <TabSlot $kind="box">
                <Badge $kind="solid" $round>
                  3
                </Badge>
              </TabSlot>
            </Tab>
            <Tab id="grown-archive">
              <TabLabel $grow>Archive</TabLabel>
              <TabSlot $kind="box">
                <Badge $round>12</Badge>
              </TabSlot>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Three unread messages.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Tab labels with layout classes"
        description="Layout classes on a label apply as $grow does: grow fills a stretched tab, so the badge sits at the end, and text-start starts the text."
        stretch
        code={`
          <Tabs>
            <TabList $layout="stretch">
              <Tab>
                <TabLabel className="grow text-start">Inbox</TabLabel>
                <TabSlot $kind="box">
                  <Badge $kind="solid" $round>3</Badge>
                </TabSlot>
              </Tab>
              …
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="layout-class-inbox">
          <TabList
            aria-label="Tab labels with layout classes"
            $layout="stretch"
          >
            <Tab id="layout-class-inbox">
              <TabLabel className="grow text-start">Inbox</TabLabel>
              <TabSlot $kind="box">
                <Badge $kind="solid" $round>
                  3
                </Badge>
              </TabSlot>
            </Tab>
            <Tab id="layout-class-archive">
              <TabLabel className="grow text-start">Archive</TabLabel>
              <TabSlot $kind="box">
                <Badge $round>12</Badge>
              </TabSlot>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Three unread messages.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Semibold tab labels"
        description="A weight class on the labels applies to every tab, including the selected one."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel className="font-semibold">Preview</TabLabel>
              </Tab>
              …
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="semibold-code">
          <TabList aria-label="Semibold tab labels">
            <Tab id="semibold-preview">
              <TabLabel className="font-semibold">Preview</TabLabel>
            </Tab>
            <Tab id="semibold-code">
              <TabLabel className="font-semibold">Code</TabLabel>
            </Tab>
            <Tab id="semibold-usage">
              <TabLabel className="font-semibold">Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Every label is semibold.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Medium tabs"
        description="A weight class on the tabs replaces the normal weight of idle tabs. A weight above the button weight goes on the labels instead."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab className="font-medium">Preview</Tab>
              …
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="medium-code">
          <TabList aria-label="Medium tabs">
            <Tab id="medium-preview" className="font-medium">
              Preview
            </Tab>
            <Tab id="medium-code" className="font-medium">
              Code
            </Tab>
            <Tab id="medium-usage" className="font-medium">
              Usage
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Every tab is medium.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Tabs with bigint counts"
        description="Text with a bigint, such as a count from a database, sets the label text, so the selected label turns heavier and the tabs don't move."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>Files {fileCount}</Tab>
              <Tab>Issues {issueCount}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="bigint-files">
          <TabList aria-label="Tabs with bigint counts">
            <Tab id="bigint-files">Files {BigInt(10)}</Tab>
            <Tab id="bigint-issues">Issues {BigInt(3)}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Counts can be bigints.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Rich tab labels"
        description="A label with an element child sets text to its visible text, so the label turns heavier while selected and the tabs don't move."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel text="Code" />
              </Tab>
              <Tab>
                <TabLabel text="Pull requests">
                  <Message>Pull requests</Message>
                </TabLabel>
              </Tab>
              <Tab>
                <TabLabel text="Actions">
                  <Message>Actions</Message>
                </TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="rich-code">
          <TabList aria-label="Rich tab labels">
            <Tab id="rich-code">
              <TabLabel text="Code" />
            </Tab>
            <Tab id="rich-pulls">
              <TabLabel text="Pull requests">
                <Message>Pull requests</Message>
              </TabLabel>
            </Tab>
            <Tab id="rich-actions">
              <TabLabel text="Actions">
                <Message>Actions</Message>
              </TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The selected label is heavier.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Rich tab labels without text"
        description="Without text, a label with an element child keeps the normal weight while selected, so the tabs don't move."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>
                  <Message>Code</Message>
                </TabLabel>
              </Tab>
              …
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="untexted-code">
          <TabList aria-label="Rich tab labels without text">
            <Tab id="untexted-code">
              <TabLabel>
                <Message>Code</Message>
              </TabLabel>
            </Tab>
            <Tab id="untexted-pulls">
              <TabLabel>
                <Message>Pull requests</Message>
              </TabLabel>
            </Tab>
            <Tab id="untexted-actions">
              <TabLabel>
                <Message>Actions</Message>
              </TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Every label keeps the normal weight.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Disabled tab"
        description="A disabled tab keeps its place in the strip and can take focus, but it cannot be selected."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab disabled>
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="disabled-usage">
          <TabList aria-label="Disabled tab">
            <Tab id="disabled-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="disabled-code" disabled>
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="disabled-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The Code tab is not available.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Chevron separators"
        description="Chevrons between the tabs show that the stages come in order."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>Drafts</TabLabel>
              </Tab>
              <TabSeparator $kind="chevron" />
              <Tab>
                <TabLabel>In review</TabLabel>
              </Tab>
              <TabSeparator $kind="chevron" />
              <Tab>
                <TabLabel>Published</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="stages-review">
          <TabList aria-label="Chevron separators">
            <Tab id="stages-drafts">
              <TabLabel>Drafts</TabLabel>
            </Tab>
            <TabSeparator $kind="chevron" />
            <Tab id="stages-review">
              <TabLabel>In review</TabLabel>
            </Tab>
            <TabSeparator $kind="chevron" />
            <Tab id="stages-published">
              <TabLabel>Published</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Two posts wait for a review.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Pipe separators"
        description="Pipes between the tabs, as in a browser. A pipe next to the selected, hovered or focused tab hides."
        stretch
        code={`
          <Tabs>
            <TabList>
              <Tab>
                <TabLabel>Preview</TabLabel>
              </Tab>
              <TabSeparator />
              <Tab>
                <TabLabel>Code</TabLabel>
              </Tab>
              <TabSeparator />
              <Tab>
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="pipes-preview">
          <TabList aria-label="Pipe separators">
            <Tab id="pipes-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <TabSeparator />
            <Tab id="pipes-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <TabSeparator />
            <Tab id="pipes-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The pipe next to Preview hides.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Right to left"
        description="The curves and the chevrons mirror. The selected first tab meets the panel's start corner on the right, where the root edge cuts its curve. The rtl prop makes the arrow keys follow the same direction."
        stretch
        code={`
          <div dir="rtl">
            <Tabs rtl $p={1}>
              <TabList>
                <Tab>
                  <TabLabel>المسودات</TabLabel>
                </Tab>
                <TabSeparator $kind="chevron" />
                <Tab>
                  <TabLabel>قيد المراجعة</TabLabel>
                </Tab>
                <TabSeparator $kind="chevron" />
                <Tab>
                  <TabLabel>المنشورة</TabLabel>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel single>
                  …
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        `}
      >
        {/* Drafts, In review and Published, with an Arabic panel line. */}
        <div dir="rtl" lang="ar">
          <Tabs rtl $p={1} defaultSelectedId="rtl-drafts">
            <TabList aria-label="مراحل النشر">
              <Tab id="rtl-drafts">
                <TabLabel>المسودات</TabLabel>
              </Tab>
              <TabSeparator $kind="chevron" />
              <Tab id="rtl-review">
                <TabLabel>قيد المراجعة</TabLabel>
              </Tab>
              <TabSeparator $kind="chevron" />
              <Tab id="rtl-published">
                <TabLabel>المنشورة</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">ثلاث مسودات قيد التحرير الآن.</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </Example>

      {/*
        No stretch and no wrapper: the root is a flex item of the box row, which
        is where a scrolling strip used to push the root past its container.
      */}
      <Example
        title="Overflowing strip"
        description="There are more tabs than fit, so the strip scrolls and cuts the last visible tab at its edge. The tabs come from a tabs array."
        code={`
          <Tabs>
            <TabList tabs={[…]} />
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs>
          <TabList
            aria-label="Overflowing strip"
            tabs={[
              "Overview",
              "Getting started",
              "Usage",
              "API reference",
              "Styling",
              "Accessibility",
              "Examples",
              "Changelog",
            ]}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Scroll the strip to see every tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Overflowing strip scrolled to its end"
        description="At the end of the scroll, the curve of the selected last tab stays clear of the panel's rounded corner."
        stretch
        code={`
          <Tabs>
            <TabList tabs={[…]} />
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs
          defaultSelectedId="scrolled-changelog"
          className="w-64 max-w-full"
        >
          <TabList
            aria-label="Overflowing strip scrolled to its end"
            ref={(element) => {
              element?.scrollTo({ left: element.scrollWidth });
            }}
            tabs={{
              "scrolled-overview": "Overview",
              "scrolled-usage": "Usage",
              "scrolled-styling": "Styling",
              "scrolled-changelog": "Changelog",
            }}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The last tab is at the end.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Overflowing strip with brand buttons"
        description="The scroll buttons take the brand layer, one as an element and one as props with an optional name left out, and they keep the Previous tabs and Next tabs names."
        stretch
        code={`
          <Tabs>
            <TabList
              tabs={[…]}
              previousButton={<CarouselButton $layer="brand" />}
              nextButton={{ $layer: "brand", "aria-label": nextLabel }}
            />
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <BrandButtonsTabs />
      </Example>

      <Example
        title="Overflowing strip with arrow icons"
        description="Fragments replace the chevrons of the scroll buttons with arrows, and the buttons keep the Previous tabs and Next tabs names."
        stretch
        code={`
          <Tabs>
            <TabList
              tabs={[…]}
              previousButton={<><ArrowLeftIcon /></>}
              nextButton={<><ArrowRightIcon /></>}
            />
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs className="w-64 max-w-full">
          <TabList
            aria-label="Overflowing strip with arrow icons"
            previousButton={
              <>
                <ArrowLeftIcon />
              </>
            }
            nextButton={
              <>
                <ArrowRightIcon />
              </>
            }
            tabs={["Overview", "Usage", "Styling", "Changelog"]}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The buttons show arrows.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="On a brand layer"
        description="The strip darkens the brand surface, and the panel and the selected tab lift off it together."
        stretch
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Tabs>
              <TabList>
                <Tab>
                  <TabLabel>Preview</TabLabel>
                </Tab>
                <Tab>
                  <TabLabel>Code</TabLabel>
                </Tab>
                <Tab>
                  <TabLabel>Usage</TabLabel>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel single>
                  …
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4}>
          <Tabs defaultSelectedId="on-brand-code">
            <TabList aria-label="On a brand layer">
              <Tab id="on-brand-preview">
                <TabLabel>Preview</TabLabel>
              </Tab>
              <Tab id="on-brand-code">
                <TabLabel>Code</TabLabel>
              </Tab>
              <Tab id="on-brand-usage">
                <TabLabel>Usage</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">The folder reads the brand surface.</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Frame>
      </Example>

      {/*
        Regression fixtures: Tabs scenarios migrated from the
        tab-panel-shared-store sandbox.
      */}
      <Example
        title="Tab panel shared store"
        description="Single panels with explicit stores: one nested in an unrelated TabProvider, and one pinned to its first tab with an explicit tabId."
        stretch
        code={`
          <TabList>
            <Tab>Project activity</Tab>
            <Tab>Project reviews</Tab>
          </TabList>
          <TabPanel single />
          <TabProvider>
            <TabList>
              <Tab>Team activity</Tab>
              <Tab>Team reviews</Tab>
            </TabList>
            <TabPanel single />
          </TabProvider>
        `}
      >
        <TabPanelSharedStore />
      </Example>

      <Example
        title="Tabs record"
        description="The tabs come from a record: its keys are the tab ids, and an entry can pass tab props, such as disabled."
        stretch
        code={`
          <Tabs>
            <TabList />
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="record-usage">
          <TabList
            aria-label="Tabs record"
            tabs={{
              "record-preview": "Preview",
              "record-code": { children: "Code", disabled: true },
              "record-usage": "Usage",
            }}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The Code tab is not available.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>
      <Example
        title="Conditional tabs"
        description="Tabs built from permissions. A hidden Settings or Request access entry is false, true, null, or undefined and renders no tab."
        stretch
        code={`
          <Tabs>
            <TabList
              tabs={[
                { id: "overview", children: "Overview" },
                canEdit && { id: "settings", children: "Settings" },
                canEdit || { id: "request", children: "Request access" },
                { id: "activity", children: "Activity" },
              ]}
            />
            <TabPanels>…</TabPanels>
          </Tabs>
        `}
      >
        <ConditionalTabs />
      </Example>
      {(["folder", "flat", "bevel"] as const).map((kind) => (
        <Example
          key={kind}
          title={`${kind} tab with a long label`}
          description="The label stays on one line and shows an ellipsis when the tab reaches its maximum width."
          stretch
          code={`
            <Tabs $p={1}>
              <TabList>
                <Tab $kind="${kind}" className="max-w-40">
                  <TabLabel>Project settings and permissions</TabLabel>
                </Tab>
                <Tab $kind="${kind}">
                  <TabLabel>Activity</TabLabel>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel single>…</TabPanel>
              </TabPanels>
            </Tabs>
          `}
        >
          <Tabs $p={1} defaultSelectedId={`long-${kind}-settings`}>
            <TabList aria-label={`${kind} tab with a long label`}>
              <Tab
                id={`long-${kind}-settings`}
                $kind={kind}
                className="max-w-40"
              >
                <TabLabel>Project settings and permissions</TabLabel>
              </Tab>
              <Tab id={`long-${kind}-activity`} $kind={kind}>
                <TabLabel>Activity</TabLabel>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel single>
                <p className="text-sm">Manage project access.</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Example>
      ))}
      <Example
        title="Bar placement"
        description="Set a bar's distance and side without changing the tab's surface or corner radius."
        code={`<Tab $kind="flat" bar={{ $offset: 1.5, $side: "end" }}>Code</Tab>`}
      >
        <BarPlacement />
      </Example>

      <Example
        title="Tint and solid badges in box slots"
        description="A badge fills a box slot after the tab label."
        code={`
          <TabList>
            <Tab>
              <TabLabel>Issues</TabLabel>
              <TabSlot $kind="box">
                <Badge $kind="solid" $round>3</Badge>
              </TabSlot>
            </Tab>
            <Tab>
              <TabLabel>Billing</TabLabel>
              <TabSlot $kind="box">
                <Badge $layer="success">Save 20%</Badge>
              </TabSlot>
            </Tab>
          </TabList>
        `}
      >
        <Tabs>
          <TabList aria-label="Tabs with badges">
            <Tab id="box-issues">
              <TabLabel>Issues</TabLabel>
              <TabSlot $kind="box">
                <Badge $kind="solid" $round>
                  3
                </Badge>
              </TabSlot>
            </Tab>
            <Tab id="box-billing">
              <TabLabel>Billing</TabLabel>
              <TabSlot $kind="box">
                <Badge $layer="success">Save 20%</Badge>
              </TabSlot>
            </Tab>
          </TabList>
        </Tabs>
      </Example>
    </ExampleGrid>
  );
}
