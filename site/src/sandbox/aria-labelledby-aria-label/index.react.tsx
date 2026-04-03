import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ak.DialogProvider>
        <ak.DialogDisclosure className="ak-button">
          Open dialog
        </ak.DialogDisclosure>
        <ak.Dialog aria-label="Custom dialog label" className="ak-dialog">
          <ak.DialogHeading className="ak-dialog-heading">
            Dialog heading
          </ak.DialogHeading>
          <p>Dialog with aria-label should not have aria-labelledby.</p>
          <ak.DialogDismiss className="ak-button">Close</ak.DialogDismiss>
        </ak.Dialog>
      </ak.DialogProvider>

      <ak.TabProvider>
        <ak.TabList aria-label="Tabs">
          <ak.Tab className="ak-tab">Tab 1</ak.Tab>
          <ak.Tab className="ak-tab">Tab 2</ak.Tab>
        </ak.TabList>
        <ak.TabPanel aria-label="Custom panel label">
          Tab panel with aria-label
        </ak.TabPanel>
        <ak.TabPanel>Tab panel 2</ak.TabPanel>
      </ak.TabProvider>

      <ak.SelectProvider defaultValue="Apple">
        <ak.SelectLabel>Fruit</ak.SelectLabel>
        <ak.Select aria-label="Custom select label" className="ak-button" />
        <ak.SelectPopover className="ak-popover">
          <ak.SelectList aria-label="Custom list label">
            <ak.SelectItem value="Apple" className="ak-option" />
            <ak.SelectItem value="Banana" className="ak-option" />
          </ak.SelectList>
        </ak.SelectPopover>
      </ak.SelectProvider>

      <ak.FormProvider>
        <ak.Form>
          <ak.FormLabel name="name">Name</ak.FormLabel>
          <ak.FormInput
            name="name"
            aria-label="Custom input label"
            className="ak-input"
          />
        </ak.Form>
      </ak.FormProvider>

      <ak.Group aria-label="Custom group label">
        <ak.GroupLabel>Group heading</ak.GroupLabel>
        <button type="button" className="ak-button">
          Item
        </button>
      </ak.Group>

      <ak.TooltipProvider type="label">
        <ak.TooltipAnchor
          aria-label="Custom anchor label"
          className="ak-button"
          render={<button />}
        >
          Tooltip anchor
        </ak.TooltipAnchor>
        <ak.Tooltip className="ak-tooltip">Tooltip label</ak.Tooltip>
      </ak.TooltipProvider>
    </div>
  );
}
