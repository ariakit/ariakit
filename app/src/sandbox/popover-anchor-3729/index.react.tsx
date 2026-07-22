import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface ExampleCaseProps {
  anchorFirst?: boolean;
  label: string;
  provider?: boolean;
  removable?: boolean;
}

function ExampleCase({
  anchorFirst,
  label,
  provider,
  removable,
}: ExampleCaseProps) {
  const [anchorMounted, setAnchorMounted] = useState(true);
  const store = Ariakit.usePopoverStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosure = (
    <Ariakit.PopoverDisclosure
      store={provider ? undefined : store}
      data-anchor="disclosure"
    >
      Open {label}
    </Ariakit.PopoverDisclosure>
  );
  const anchor = anchorMounted ? (
    <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
      {label} anchor
    </Ariakit.PopoverAnchor>
  ) : null;

  const content = (
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
      <Ariakit.Popover
        store={provider ? undefined : store}
        flip={false}
        slide={false}
        gutter={16}
      >
        <Ariakit.PopoverHeading>{label} details</Ariakit.PopoverHeading>
        <p>You have been invited to join the project.</p>
        {removable && (
          <Ariakit.Button onClick={() => setAnchorMounted(false)}>
            Remove {label} anchor
          </Ariakit.Button>
        )}
      </Ariakit.Popover>
      <output aria-label={`${label} current anchor`}>
        {anchorElement?.dataset.anchor}
      </output>
    </div>
  );

  if (provider) {
    return (
      <Ariakit.PopoverProvider store={store}>{content}</Ariakit.PopoverProvider>
    );
  }

  return content;
}

function MenuButtonCase() {
  const store = Ariakit.useMenuStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");

  return (
    <div
      style={{
        display: "grid",
        gap: 200,
        justifyItems: "start",
        padding: 64,
      }}
    >
      <Ariakit.MenuButton store={store} data-anchor="menu-button">
        Open Menu
      </Ariakit.MenuButton>
      <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
        Menu anchor
      </Ariakit.PopoverAnchor>
      <Ariakit.Menu store={store} flip={false} slide={false} gutter={16}>
        <Ariakit.MenuItem>Menu item</Ariakit.MenuItem>
      </Ariakit.Menu>
      <output aria-label="Menu current anchor">
        {anchorElement?.dataset.anchor}
      </output>
    </div>
  );
}

export default function Example() {
  return (
    <>
      <ExampleCase label="Disclosure first" removable />
      <ExampleCase label="Anchor first" anchorFirst />
      <ExampleCase label="Provider store" anchorFirst provider />
      <MenuButtonCase />
    </>
  );
}
