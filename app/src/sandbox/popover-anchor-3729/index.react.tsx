import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface ExampleCaseProps {
  anchorFirst?: boolean;
  label: string;
}

function ExampleCase({ anchorFirst, label }: ExampleCaseProps) {
  const [anchorMounted, setAnchorMounted] = useState(true);
  const store = Ariakit.usePopoverStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosure = (
    <Ariakit.PopoverDisclosure store={store} data-anchor="disclosure">
      Open {label}
    </Ariakit.PopoverDisclosure>
  );
  const anchor = anchorMounted ? (
    <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
      {label} anchor
    </Ariakit.PopoverAnchor>
  ) : null;

  return (
    <div
      style={{
        display: "grid",
        gap: 200,
        justifyItems: "start",
        padding: 64,
      }}
    >
      {anchorFirst ? anchor : disclosure}
      {anchorFirst ? disclosure : anchor}
      <Ariakit.Popover store={store} flip={false} slide={false} gutter={16}>
        <Ariakit.PopoverHeading>{label} details</Ariakit.PopoverHeading>
        <p>You have been invited to join the project.</p>
        <Ariakit.Button onClick={() => setAnchorMounted(false)}>
          Remove {label} anchor
        </Ariakit.Button>
      </Ariakit.Popover>
      <output aria-label={`${label} current anchor`}>
        {anchorElement?.dataset.anchor}
      </output>
    </div>
  );
}

export default function Example() {
  return (
    <>
      <ExampleCase label="Disclosure first" />
      <ExampleCase label="Anchor first" anchorFirst />
    </>
  );
}
