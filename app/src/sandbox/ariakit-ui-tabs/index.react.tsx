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
// TODO: Use TabLabel after its element is fixed.
// https://github.com/ariakit/ariakit/issues/7482
import { ButtonLabel as TabLabel } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Tab,
  TabGlider,
  TabList,
  TabPanel,
  TabPanels,
  TabProvider,
  TabSeparator,
  TabSlot,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { BookOpenIcon, BracesIcon, EyeIcon } from "lucide-react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

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

// Every box passes an explicit defaultSelectedId with page-unique ids, so the
// first render already marks the selected tab and no glider travels while the
// tabs register.

export default function TabsExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The selected tab drops its bottom corners and merges into its panel. Each tab has its own panel."
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
        title="Without padding"
        description="The tabs sit on the root's edge, and the selected first tab takes the root's corner, so it has no start curve."
        stretch
        code={`
          <Tabs $p="none">
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
        <Tabs $p="none" defaultSelectedId="flush-preview">
          <TabList aria-label="Without padding">
            <Tab id="flush-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="flush-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="flush-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The strip has no padding.</p>
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
        title="Hidden root edge"
        description="The root paints its own edge transparent. The selected tab and the panel keep drawing it."
        stretch
        code={`
          <Tabs $edgeHidden>
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
        <Tabs $edgeHidden defaultSelectedId="hidden-code">
          <TabList aria-label="Hidden root edge">
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
          <Tabs>
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
        <Tabs defaultSelectedId="flat-code">
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
          <Tabs>
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
        <Tabs defaultSelectedId="bevel-code">
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
        title="Folder glider"
        description="A folder glider stands in for the selected tab. Hover and focus gliders follow the pointer and the keyboard, and arrow keys move focus without selecting."
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
              <TabGlider $kind="folder" $state="selected" />
              <TabGlider $kind="folder" $state="hover" />
              <TabGlider $kind="folder" $state="focus" />
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs selectOnMove={false} defaultSelectedId="glider-code">
          <TabList aria-label="Folder glider">
            <Tab id="glider-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab id="glider-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab id="glider-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
            <TabGlider $kind="folder" $state="selected" />
            <TabGlider $kind="folder" $state="hover" />
            <TabGlider $kind="folder" $state="focus" />
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Press Enter to select a focused tab.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Flat glider"
        description="A pill glider travels behind flat tabs. The focus glider covers it with the brand pill."
        stretch
        code={`
          <Tabs selectOnMove={false}>
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
              <TabGlider $kind="flat" $state="selected" />
              <TabGlider $kind="flat" $state="focus" />
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs selectOnMove={false} defaultSelectedId="flat-glider-preview">
          <TabList aria-label="Flat glider">
            <Tab $kind="flat" id="flat-glider-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="flat-glider-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="flat-glider-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
            <TabGlider $kind="flat" $state="selected" />
            <TabGlider $kind="flat" $state="focus" />
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The pill travels between tabs.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Bevel glider"
        description="The glider paints the bevel pill behind flat tabs."
        stretch
        code={`
          <Tabs>
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
              <TabGlider $kind="bevel" />
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="bevel-glider-usage">
          <TabList aria-label="Bevel glider">
            <Tab $kind="flat" id="bevel-glider-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="bevel-glider-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="bevel-glider-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
            <TabGlider $kind="bevel" />
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The pill looks pressable.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>

      <Example
        title="Bar glider"
        description="A bar underlines the selected tab, and the tab keeps its own fill."
        stretch
        code={`
          <Tabs>
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
              <TabGlider $kind="bar" />
            </TabList>
            <TabPanels>
              <TabPanel single>
                …
              </TabPanel>
            </TabPanels>
          </Tabs>
        `}
      >
        <Tabs defaultSelectedId="bar-code">
          <TabList aria-label="Bar glider">
            <Tab $kind="flat" id="bar-preview">
              <TabLabel>Preview</TabLabel>
            </Tab>
            <Tab $kind="flat" id="bar-code">
              <TabLabel>Code</TabLabel>
            </Tab>
            <Tab $kind="flat" id="bar-usage">
              <TabLabel>Usage</TabLabel>
            </Tab>
            <TabGlider $kind="bar" />
          </TabList>
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The bar travels between tabs.</p>
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
                <TabSlot $kind="badge">3</TabSlot>
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
              <TabSlot $kind="badge">3</TabSlot>
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
        description="The curves and the chevrons mirror. The selected first tab meets the panel's start corner on the right."
        stretch
        code={`
          <div dir="rtl">
            <Tabs>
              <TabProvider rtl>
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
              </TabProvider>
            </Tabs>
          </div>
        `}
      >
        {/* Drafts, In review and Published, with an Arabic panel line. */}
        <div dir="rtl" lang="ar">
          <Tabs>
            <TabProvider rtl defaultSelectedId="rtl-drafts">
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
            </TabProvider>
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
            ].map((label) => ({ children: <TabLabel>{label}</TabLabel> }))}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">Scroll the strip to see every tab.</p>
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
              "record-preview": { children: <TabLabel>Preview</TabLabel> },
              "record-code": {
                children: <TabLabel>Code</TabLabel>,
                disabled: true,
              },
              "record-usage": { children: <TabLabel>Usage</TabLabel> },
            }}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The Code tab is not available.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>
      {(["folder", "flat", "bevel"] as const).map((kind) => (
        <Example
          key={kind}
          title={`${kind} tab with a long label`}
          description="The label stays on one line and shows an ellipsis when the tab reaches its maximum width."
          stretch
          code={`
            <Tabs>
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
          <Tabs defaultSelectedId={`long-${kind}-settings`}>
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
    </ExampleGrid>
  );
}
