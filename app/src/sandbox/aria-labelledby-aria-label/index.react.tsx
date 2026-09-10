import * as ak from "@ariakit/react";
import { TagControl } from "@ariakit/react-components/tag/tag-control";
import { TagLabel } from "@ariakit/react-components/tag/tag-label";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectLabel,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import {
  Dialog,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DialogProvider>
        <DialogDisclosure>Open dialog</DialogDisclosure>
        <Dialog aria-label="Custom dialog label">
          <DialogHeading>Dialog heading</DialogHeading>
          <p>Dialog with aria-label should not have aria-labelledby.</p>
          <DialogDismiss>Close</DialogDismiss>
        </Dialog>
      </DialogProvider>

      <Tabs>
        <TabList aria-label="Tabs">
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel aria-label="Custom panel label">
            Tab panel with aria-label
          </TabPanel>
          <TabPanel>Tab panel 2</TabPanel>
        </TabPanels>
      </Tabs>

      <ComboboxSelectProvider defaultValue="Apple">
        <ComboboxSelectLabel>Fruit</ComboboxSelectLabel>
        <ComboboxSelectButton aria-label="Custom select label" />
        <ComboboxSelectPopover>
          {/* The list keeps the raw Ariakit primitive: the explicit
              ComboboxList with its own aria-label is what this sandbox
              exercises, and @ariakit/ui has no wrapper for it. */}
          <ak.ComboboxList aria-label="Custom list label">
            <ComboboxSelectItem value="Apple" />
            <ComboboxSelectItem value="Banana" />
          </ak.ComboboxList>
        </ComboboxSelectPopover>
      </ComboboxSelectProvider>

      <ak.FormProvider>
        <ak.Form>
          <ak.FormLabel name="name">Name</ak.FormLabel>
          <ak.FormInput
            name="name"
            aria-label="Custom input label"
            render={<Input />}
          />
        </ak.Form>
      </ak.FormProvider>

      <ak.Group aria-label="Custom group label">
        <ak.GroupLabel>Group heading</ak.GroupLabel>
        <Button type="button">Item</Button>
      </ak.Group>

      <TooltipProvider type="label">
        <TooltipAnchor aria-label="Custom anchor label" render={<Button />}>
          Tooltip anchor
        </TooltipAnchor>
        <Tooltip>Tooltip label</Tooltip>
      </TooltipProvider>

      <TagProvider>
        <TagLabel>Tag label</TagLabel>
        <TagList
          aria-label="Custom tag list label"
          style={{ display: "contents" }}
        />
      </TagProvider>

      <TagProvider>
        <TagLabel>Tag control label</TagLabel>
        <TagControl aria-label="Custom tag control label" />
      </TagProvider>

      <ak.Group aria-labelledby="explicit-labelledby">
        <ak.GroupLabel>Group heading 2</ak.GroupLabel>
        <span id="explicit-labelledby">Explicit label</span>
      </ak.Group>
    </div>
  );
}
