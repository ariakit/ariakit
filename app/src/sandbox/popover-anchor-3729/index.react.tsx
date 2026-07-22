import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

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

interface MenuButtonCaseProps {
  customAnchor?: boolean;
  label: string;
}

function MenuButtonCase({ customAnchor, label }: MenuButtonCaseProps) {
  const store = Ariakit.useMenuStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const groupRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: "grid",
        gap: 200,
        justifyItems: "start",
        padding: 64,
      }}
    >
      <div ref={groupRef} data-anchor="group">
        <Ariakit.MenuButton
          store={store}
          data-anchor="menu-button"
          onClick={
            customAnchor
              ? () => store.setAnchorElement(groupRef.current)
              : undefined
          }
        >
          Open {label}
        </Ariakit.MenuButton>
      </div>
      <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
        {label} anchor
      </Ariakit.PopoverAnchor>
      <Ariakit.Menu
        store={store}
        aria-label={`${label} items`}
        flip={false}
        slide={false}
        gutter={16}
      >
        <Ariakit.MenuItem>Menu item</Ariakit.MenuItem>
      </Ariakit.Menu>
      <output aria-label={`${label} current anchor`}>
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
      <MenuButtonCase label="Menu" />
      <MenuButtonCase label="Override Menu" customAnchor />
    </>
  );
}
