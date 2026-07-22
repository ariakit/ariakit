import * as Ariakit from "@ariakit/react";

interface ExampleCaseProps {
  anchorFirst?: boolean;
  label: string;
  provider?: boolean;
}

function ExampleCase({ anchorFirst, label, provider }: ExampleCaseProps) {
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
  const anchor = (
    <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
      {label} anchor
    </Ariakit.PopoverAnchor>
  );

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
      <ExampleCase label="Disclosure first" />
      <ExampleCase label="Anchor first" anchorFirst />
      <ExampleCase label="Provider store" anchorFirst provider />
      <MenuButtonCase />
    </>
  );
}
