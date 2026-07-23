import * as ak from "@ariakit/react";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import {
  Dialog,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
} from "@ariakit/ui/ariakit/dialog.react.tsx";
import {
  SelectButton,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectProvider,
} from "@ariakit/ui/ariakit/select.react.tsx";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/ariakit/tabs.react.tsx";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/ui/ariakit/tooltip.react.tsx";
import { input } from "@ariakit/ui/styles/input.ts";

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

      <SelectProvider defaultValue="Apple">
        <SelectLabel>Fruit</SelectLabel>
        <SelectButton aria-label="Custom select label" />
        <SelectPopover>
          {/* The list keeps the raw Ariakit primitive: the explicit
              SelectList with its own aria-label is what this sandbox
              exercises, and @ariakit/ui has no wrapper for it. */}
          <ak.SelectList aria-label="Custom list label">
            <SelectItem value="Apple" />
            <SelectItem value="Banana" />
          </ak.SelectList>
        </SelectPopover>
      </SelectProvider>

      <ak.FormProvider>
        <ak.Form>
          <ak.FormLabel name="name">Name</ak.FormLabel>
          {/* Keeps the FormInput primitive (the @ariakit/ui Input isn't
              form-aware) and takes the field look from the input cv. */}
          <ak.FormInput
            name="name"
            aria-label="Custom input label"
            {...input.jsx({})}
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
        <TagListLabel>Tag label</TagListLabel>
        <TagList aria-label="Custom tag list label" />
      </TagProvider>

      <ak.Group aria-labelledby="explicit-labelledby">
        <ak.GroupLabel>Group heading 2</ak.GroupLabel>
        <span id="explicit-labelledby">Explicit label</span>
      </ak.Group>
    </div>
  );
}
