import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useState } from "react";

function CaseLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 200,
        justifyItems: "start",
        padding: 64,
      }}
    >
      {children}
    </div>
  );
}

interface PopoverCaseProps {
  anchorFirst?: boolean;
  label: string;
}

function PopoverCase({ anchorFirst, label }: PopoverCaseProps) {
  const [anchorMounted, setAnchorMounted] = useState(true);
  const [disclosureMounted, setDisclosureMounted] = useState(true);
  const store = Ariakit.usePopoverStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosureElement = Ariakit.useStoreState(store, "disclosureElement");

  const disclosure = disclosureMounted ? (
    <Ariakit.PopoverDisclosure store={store} data-disclosure="button">
      Open {label}
    </Ariakit.PopoverDisclosure>
  ) : null;

  const anchor = anchorMounted ? (
    <Ariakit.PopoverAnchor store={store} data-anchor="explicit">
      {label} anchor
    </Ariakit.PopoverAnchor>
  ) : null;

  return (
    <CaseLayout>
      {anchorFirst ? anchor : disclosure}
      {anchorFirst ? disclosure : anchor}
      <Ariakit.Popover
        store={store}
        aria-label={`${label} details`}
        flip={false}
        slide={false}
        gutter={16}
      >
        Popover content
        <Ariakit.Button onClick={() => setAnchorMounted(false)}>
          Remove {label} anchor
        </Ariakit.Button>
        <Ariakit.Button onClick={() => setDisclosureMounted(false)}>
          Remove {label} disclosure
        </Ariakit.Button>
      </Ariakit.Popover>
      <output aria-label={`${label} current anchor`}>
        {anchorElement?.dataset.anchor ||
          anchorElement?.dataset.disclosure ||
          "none"}
      </output>
      <output aria-label={`${label} current disclosure`}>
        {disclosureElement?.dataset.disclosure || "none"}
      </output>
    </CaseLayout>
  );
}

function HovercardCase() {
  const store = Ariakit.useHovercardStore({
    placement: "right",
    timeout: 0,
  });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");

  return (
    <CaseLayout>
      <Ariakit.HovercardProvider store={store}>
        <Ariakit.HovercardAnchor data-anchor="explicit">
          Hovercard anchor
        </Ariakit.HovercardAnchor>
        <Ariakit.HovercardDisclosure
          aria-label="Open Hovercard"
          data-disclosure="button"
        />
        <Ariakit.Hovercard
          aria-label="Hovercard details"
          flip={false}
          slide={false}
          gutter={16}
        >
          Hovercard content
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
      <output aria-label="Hovercard current anchor">
        {anchorElement?.dataset.anchor ||
          anchorElement?.dataset.disclosure ||
          "none"}
      </output>
    </CaseLayout>
  );
}

function MenuCase() {
  const store = Ariakit.useMenuStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosureElement = Ariakit.useStoreState(store, "disclosureElement");

  return (
    <CaseLayout>
      <Ariakit.MenuProvider store={store}>
        <Ariakit.MenuButton data-disclosure="button">
          Open Menu
        </Ariakit.MenuButton>
        <Ariakit.MenuAnchor data-anchor="explicit">
          Menu anchor
        </Ariakit.MenuAnchor>
        <Ariakit.Menu
          aria-label="Menu items"
          flip={false}
          slide={false}
          gutter={16}
        >
          <Ariakit.MenuItem>Menu item</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <output aria-label="Menu current anchor">
        {anchorElement?.dataset.anchor || "none"}
      </output>
      <output aria-label="Menu current disclosure">
        {disclosureElement?.dataset.disclosure || "none"}
      </output>
    </CaseLayout>
  );
}

function HoverMenuCase() {
  const store = Ariakit.useMenuStore({ placement: "right", timeout: 0 });

  return (
    <CaseLayout>
      <Ariakit.MenuProvider store={store}>
        <Ariakit.MenuButton showOnHover>Open Hover Menu</Ariakit.MenuButton>
        <Ariakit.MenuAnchor>Hover Menu anchor</Ariakit.MenuAnchor>
        <Ariakit.Menu aria-label="Hover Menu items" hideOnHoverOutside>
          <Ariakit.MenuItem>Hover menu item</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </CaseLayout>
  );
}

function SelectCase() {
  const store = Ariakit.useSelectStore({
    defaultValue: "Apple",
    placement: "right",
  });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");

  return (
    <CaseLayout>
      <Ariakit.SelectProvider store={store}>
        <Ariakit.SelectAnchor data-anchor="explicit">
          Select anchor
        </Ariakit.SelectAnchor>
        <Ariakit.Select aria-label="Open Select" />
        <Ariakit.SelectPopover
          aria-label="Select items"
          flip={false}
          slide={false}
          gutter={16}
        >
          <Ariakit.SelectItem value="Apple" />
          <Ariakit.SelectItem value="Orange" />
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
      <output aria-label="Select current anchor">
        {anchorElement?.dataset.anchor || "none"}
      </output>
    </CaseLayout>
  );
}

type ComboboxCaseType = "explicit" | "input" | "disclosure";

function ComboboxCase({ type }: { type: ComboboxCaseType }) {
  const [inputMounted, setInputMounted] = useState(true);
  const label = `${type[0]?.toUpperCase()}${type.slice(1)}`;
  const store = Ariakit.useComboboxStore({ placement: "right" });
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  const disclosureElement = Ariakit.useStoreState(store, "disclosureElement");

  return (
    <CaseLayout>
      <Ariakit.ComboboxProvider store={store}>
        {type === "explicit" && (
          <Ariakit.ComboboxAnchor data-anchor="explicit">
            {label} Combobox anchor
          </Ariakit.ComboboxAnchor>
        )}
        {type !== "disclosure" && inputMounted && (
          <Ariakit.Combobox
            aria-label={`${label} Combobox input`}
            data-anchor="input"
          />
        )}
        <Ariakit.ComboboxDisclosure
          aria-label={`Open ${label} Combobox`}
          data-disclosure="button"
        />
        <Ariakit.ComboboxPopover
          aria-label={`${label} Combobox items`}
          flip={false}
          slide={false}
          gutter={16}
        >
          <Ariakit.ComboboxItem value="Apple" />
          {type === "input" && (
            <Ariakit.Button onClick={() => setInputMounted(false)}>
              Remove Input Combobox input
            </Ariakit.Button>
          )}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <output aria-label={`${label} Combobox current anchor`}>
        {anchorElement?.dataset.anchor ||
          anchorElement?.dataset.disclosure ||
          "none"}
      </output>
      <output aria-label={`${label} Combobox current disclosure`}>
        {disclosureElement?.dataset.disclosure ||
          disclosureElement?.dataset.anchor ||
          "none"}
      </output>
    </CaseLayout>
  );
}

function PopoverContextPlacement() {
  const store = Ariakit.usePopoverContext();
  return (
    <output aria-label="Scoped Combobox context">
      {store?.getState().placement}
    </output>
  );
}

function ScopedComboboxDisclosureCase() {
  const store = Ariakit.useComboboxStore({ placement: "right" });

  return (
    <Ariakit.PopoverProvider placement="left">
      <Ariakit.ComboboxDisclosure store={store}>
        Scoped Combobox Disclosure
        <PopoverContextPlacement />
      </Ariakit.ComboboxDisclosure>
    </Ariakit.PopoverProvider>
  );
}

export default function Example() {
  return (
    <>
      <PopoverCase label="Disclosure first" />
      <PopoverCase label="Anchor first" anchorFirst />
      <MenuCase />
      <HoverMenuCase />
      <SelectCase />
      <ComboboxCase type="explicit" />
      <ComboboxCase type="input" />
      <ComboboxCase type="disclosure" />
      <HovercardCase />
      <ScopedComboboxDisclosureCase />
    </>
  );
}
