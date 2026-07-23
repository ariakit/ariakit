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
        {anchorElement?.dataset.anchor || "none"}
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

function DisclosureUnmountCase() {
  const [anchorMounted, setAnchorMounted] = useState(true);
  const [disclosureMounted, setDisclosureMounted] = useState(true);
  const store = Ariakit.usePopoverStore();
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosureElement = Ariakit.useStoreState(store, "disclosureElement");

  return (
    <div>
      {disclosureMounted && (
        <Ariakit.PopoverDisclosure
          store={store}
          data-anchor="disclosure"
          ref={() => {}}
        >
          Open removable disclosure
        </Ariakit.PopoverDisclosure>
      )}
      {anchorMounted && (
        <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
          Removable disclosure anchor
        </Ariakit.PopoverAnchor>
      )}
      <Ariakit.Button onClick={() => setDisclosureMounted(false)}>
        Remove Popover disclosure
      </Ariakit.Button>
      <Ariakit.Button onClick={() => setAnchorMounted(false)}>
        Remove Popover anchor
      </Ariakit.Button>
      <Ariakit.Popover store={store} aria-label="Removable disclosure details">
        Popover content
      </Ariakit.Popover>
      <output aria-label="Removable disclosure current anchor">
        {anchorElement?.dataset.anchor || "none"}
      </output>
      <output aria-label="Removable disclosure current disclosure">
        {disclosureElement?.dataset.anchor || "none"}
      </output>
    </div>
  );
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
      <Ariakit.MenuAnchor store={store} data-anchor="explicit">
        {label} anchor
      </Ariakit.MenuAnchor>
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
        {anchorElement?.dataset.anchor || "none"}
      </output>
    </div>
  );
}

function HoverMenuButtonCase() {
  const store = Ariakit.useMenuStore({
    placement: "right",
    timeout: 0,
  });

  return (
    <div>
      <Ariakit.MenuButton store={store} showOnHover>
        Open Hover Menu
      </Ariakit.MenuButton>
      <Ariakit.MenuAnchor store={store}>Hover Menu anchor</Ariakit.MenuAnchor>
      <Ariakit.Menu store={store} aria-label="Hover Menu items">
        <Ariakit.MenuItem>Hover menu item</Ariakit.MenuItem>
      </Ariakit.Menu>
    </div>
  );
}

function SelectCase() {
  const store = Ariakit.useSelectStore({
    defaultValue: "Apple",
    placement: "right",
  });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");

  return (
    <Ariakit.SelectProvider store={store}>
      <div
        style={{
          display: "grid",
          gap: 200,
          justifyItems: "start",
          padding: 64,
        }}
      >
        <Ariakit.SelectAnchor data-anchor="explicit">
          Select anchor
        </Ariakit.SelectAnchor>
        <Ariakit.Select aria-label="Open Select" data-anchor="select" />
        <Ariakit.SelectPopover
          aria-label="Select items"
          flip={false}
          slide={false}
          gutter={16}
        >
          <Ariakit.SelectItem value="Apple" />
          <Ariakit.SelectItem value="Orange" />
        </Ariakit.SelectPopover>
        <output aria-label="Select current anchor">
          {anchorElement?.dataset.anchor || "none"}
        </output>
      </div>
    </Ariakit.SelectProvider>
  );
}

function ComboboxCase() {
  const [anchorMounted, setAnchorMounted] = useState(true);
  const [comboboxMounted, setComboboxMounted] = useState(true);
  const store = Ariakit.useComboboxStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosureElement = Ariakit.useStoreState(store, "disclosureElement");

  return (
    <Ariakit.ComboboxProvider store={store}>
      <div
        style={{
          display: "grid",
          gap: 200,
          justifyItems: "start",
          padding: 64,
        }}
      >
        {anchorMounted && (
          <Ariakit.ComboboxAnchor data-anchor="explicit">
            Combobox anchor
          </Ariakit.ComboboxAnchor>
        )}
        <div style={{ display: "grid", gap: 100 }}>
          {comboboxMounted && (
            <Ariakit.Combobox aria-label="Combobox" data-anchor="combobox" />
          )}
          <Ariakit.ComboboxDisclosure
            aria-label="Open Combobox"
            data-anchor="disclosure"
          />
        </div>
        <Ariakit.Button onClick={() => setAnchorMounted(false)}>
          Remove Combobox anchor
        </Ariakit.Button>
        <Ariakit.Button onClick={() => setComboboxMounted(false)}>
          Remove Combobox input
        </Ariakit.Button>
        <Ariakit.ComboboxPopover
          aria-label="Combobox items"
          flip={false}
          slide={false}
          gutter={16}
        >
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxPopover>
        <output aria-label="Combobox current anchor">
          {anchorElement?.dataset.anchor || "none"}
        </output>
        <output aria-label="Combobox current disclosure">
          {disclosureElement?.dataset.anchor || "none"}
        </output>
      </div>
    </Ariakit.ComboboxProvider>
  );
}

function DefaultOpenComboboxCase() {
  const [comboboxMounted, setComboboxMounted] = useState(true);
  const [firstDisclosureMounted, setFirstDisclosureMounted] = useState(true);
  const [secondDisclosureMounted, setSecondDisclosureMounted] = useState(true);
  const store = Ariakit.useComboboxStore({ defaultOpen: true });
  const disclosureElement = Ariakit.useStoreState(store, "disclosureElement");

  return (
    <Ariakit.ComboboxProvider store={store}>
      {comboboxMounted && (
        <Ariakit.Combobox
          aria-label="Default open Combobox"
          data-anchor="combobox"
        />
      )}
      {firstDisclosureMounted && (
        <Ariakit.ComboboxDisclosure
          aria-label="First default open Combobox disclosure"
          data-anchor="first-disclosure"
        />
      )}
      {secondDisclosureMounted && (
        <Ariakit.ComboboxDisclosure
          aria-label="Second default open Combobox disclosure"
          data-anchor="second-disclosure"
        />
      )}
      <Ariakit.Button
        onClick={() => setFirstDisclosureMounted((mounted) => !mounted)}
      >
        {firstDisclosureMounted ? "Remove" : "Mount"} first default open
        Combobox disclosure
      </Ariakit.Button>
      <Ariakit.Button onClick={() => setSecondDisclosureMounted(false)}>
        Remove second default open Combobox disclosure
      </Ariakit.Button>
      <Ariakit.Button
        onClick={() => {
          setComboboxMounted(false);
          setFirstDisclosureMounted(false);
          setSecondDisclosureMounted(false);
        }}
      >
        Remove all default open Combobox controls
      </Ariakit.Button>
      <Ariakit.ComboboxPopover aria-label="Default open Combobox items">
        <Ariakit.ComboboxItem value="Apple" />
      </Ariakit.ComboboxPopover>
      <output aria-label="Default open Combobox current disclosure">
        {disclosureElement?.dataset.anchor || "none"}
      </output>
    </Ariakit.ComboboxProvider>
  );
}

function ComposedComboboxDisclosureCase() {
  const store = Ariakit.useComboboxStore();
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");

  return (
    <Ariakit.ComboboxProvider store={store}>
      <Ariakit.Combobox aria-label="Composed Combobox" data-anchor="combobox" />
      <Ariakit.DialogDisclosure
        store={store}
        render={
          <Ariakit.ComboboxDisclosure
            store={store}
            aria-label="Open composed Combobox"
          />
        }
      />
      <Ariakit.ComboboxPopover aria-label="Composed Combobox items">
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Orange" />
      </Ariakit.ComboboxPopover>
      <output aria-label="Composed Combobox current anchor">
        {anchorElement?.dataset.anchor || "none"}
      </output>
    </Ariakit.ComboboxProvider>
  );
}

function HovercardCase() {
  const [anchorMounted, setAnchorMounted] = useState(false);
  const [secondAnchorMounted, setSecondAnchorMounted] = useState(false);
  const store = Ariakit.useHovercardStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");

  return (
    <Ariakit.HovercardProvider store={store}>
      <div
        style={{
          display: "grid",
          gap: 200,
          justifyItems: "start",
          padding: 64,
        }}
      >
        <Ariakit.HovercardDisclosure data-anchor="disclosure">
          Open Hovercard
        </Ariakit.HovercardDisclosure>
        {anchorMounted && (
          <Ariakit.HovercardAnchor href="#hovercard" data-anchor="first">
            Hovercard anchor
          </Ariakit.HovercardAnchor>
        )}
        {secondAnchorMounted && (
          <Ariakit.HovercardAnchor href="#hovercard" data-anchor="second">
            Second Hovercard anchor
          </Ariakit.HovercardAnchor>
        )}
        <Ariakit.Button onClick={() => setAnchorMounted(true)}>
          Mount Hovercard anchor
        </Ariakit.Button>
        <Ariakit.Button
          onClick={() => {
            store.setDisclosureElement(store.getState().anchorElement);
            setSecondAnchorMounted(true);
          }}
        >
          Mount second Hovercard anchor
        </Ariakit.Button>
        <Ariakit.Hovercard
          aria-label="Hovercard details"
          flip={false}
          slide={false}
          gutter={16}
        >
          Hovercard content
        </Ariakit.Hovercard>
        <output aria-label="Hovercard current anchor">
          {anchorElement?.dataset.anchor || "none"}
        </output>
      </div>
    </Ariakit.HovercardProvider>
  );
}

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 32, width: "100%" }}>
      <ExampleCase label="Disclosure first" removable />
      <ExampleCase label="Anchor first" anchorFirst />
      <ExampleCase label="Provider store" anchorFirst provider />
      <DisclosureUnmountCase />
      <MenuButtonCase label="Menu" />
      <MenuButtonCase label="Override Menu" customAnchor />
      <HoverMenuButtonCase />
      <SelectCase />
      <ComboboxCase />
      <DefaultOpenComboboxCase />
      <ComposedComboboxDisclosureCase />
      <HovercardCase />
    </div>
  );
}
