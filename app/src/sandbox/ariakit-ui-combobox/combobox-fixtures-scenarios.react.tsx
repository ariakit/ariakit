/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as Ariakit from "@ariakit/react";
import {
  Combobox,
  ComboboxItem,
  ComboboxItemCheck,
  ComboboxItemLabel,
  ComboboxSelect,
  ComboboxSelectArrow,
  ComboboxSelectedValue,
  ComboboxSelectLabel,
  ComboboxPopover,
  ComboboxProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { comboboxItem, comboboxSelect } from "@ariakit/ui/styles/combobox";
import { layer } from "@ariakit/ui/styles/layer";
import { ChevronsUpDownIcon, CircleCheckIcon } from "lucide-react";
import * as React from "react";
import Thumbnail from "#app/examples/combobox-group/thumbnail.react.tsx";

// These scenarios keep the state and content cases from the former standalone
// fixtures while using the shared combobox parts.

export function CustomSelectionIcons() {
  return (
    <ComboboxProvider defaultSelectedValue={["Email"]}>
      <div className="flex flex-col items-start gap-2">
        <ComboboxSelectLabel>Notifications</ComboboxSelectLabel>
        <Ariakit.ComboboxSelect {...comboboxSelect.jsx()}>
          <ComboboxSelectedValue />
          <ComboboxSelectArrow $size="xl" style={{ width: 32, height: 24 }}>
            <ChevronsUpDownIcon />
          </ComboboxSelectArrow>
        </Ariakit.ComboboxSelect>
      </div>
      <ComboboxPopover>
        {["Email", "SMS"].map((value) => (
          <ComboboxItem key={value} value={value}>
            <ComboboxItemCheck
              $size="xl"
              aria-hidden={undefined}
              style={{ width: 32, height: 24 }}
            >
              {value === "Email" && <CircleCheckIcon />}
            </ComboboxItemCheck>
            <ComboboxItemLabel>{value}</ComboboxItemLabel>
          </ComboboxItem>
        ))}
      </ComboboxPopover>
    </ComboboxProvider>
  );
}

/**
 * The combobox-select-content sandbox's index, without the conditional content
 * that has an article of its own.
 */
export function SelectContent() {
  const store = Ariakit.useComboboxStore({ defaultSelectedValue: "Apple" });
  const selectedValue = Ariakit.useStoreState(store, "selectedValue");
  // Undefined sizes keep the default, and numeric zero remains content.
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <ComboboxProvider>
          <ComboboxSelect aria-label="Default status" displayValue="Pending" />
        </ComboboxProvider>
        <ComboboxProvider>
          <ComboboxSelect
            $size={undefined}
            aria-label="Optional status"
            displayValue="Active"
          />
        </ComboboxProvider>
        <ComboboxProvider>
          <ComboboxSelect
            $size="lg"
            aria-label="Large status"
            displayValue="Complete"
          />
        </ComboboxProvider>
      </div>
      <div>
        <ComboboxProvider store={store}>
          <ComboboxSelectLabel>Fruit</ComboboxSelectLabel>
          <ComboboxSelect />
          <ComboboxPopover>
            <ComboboxItem value="Apple" checkmark="before" />
            <ComboboxItem value="Orange" checkmark="before" />
          </ComboboxPopover>
        </ComboboxProvider>
        <p>Selected fruit: {selectedValue}</p>
      </div>
      <div className="flex gap-4">
        <div>
          <ComboboxProvider defaultSelectedValue="All">
            <ComboboxSelectLabel>Unread messages</ComboboxSelectLabel>
            <ComboboxSelect displayValue={0}>All</ComboboxSelect>
          </ComboboxProvider>
        </div>
        <div>
          <ComboboxProvider defaultSelectedValue="All">
            <ComboboxSelectLabel>Open issues</ComboboxSelectLabel>
            <ComboboxSelect>{0}</ComboboxSelect>
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="no-issues">
                {0}
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </div>
    </div>
  );
}

/** The combobox-select-content sandbox's conditional-content.react.tsx. */
export function ConditionalContent() {
  const [labels, setLabels] = React.useState(false);
  const icon = labels && <span aria-hidden>★</span>;
  return (
    <section aria-label="Conditional status content" className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={labels}
          onChange={(event) => setLabels(event.target.checked)}
        />
        Show status labels
      </label>
      <ComboboxProvider defaultSelectedValue="Open">
        <ComboboxSelectLabel>Status filter</ComboboxSelectLabel>
        <ComboboxSelect
          chevron={false}
          icon={icon}
          displayValue={labels && "Custom status"}
        >
          {labels && "Status summary"}
        </ComboboxSelect>
        <ComboboxPopover>
          <ComboboxItem value="Open" checkmark={false} icon={icon}>
            {labels && "Open status"}
          </ComboboxItem>
          <ComboboxItem value="Closed" checkmark={false} icon={icon}>
            {labels && "Closed status"}
          </ComboboxItem>
          <ComboboxItem value="No activity" checkmark={false} icon={0} />
          <ComboboxItem
            value="Blank"
            aria-label="Blank status"
            checkmark={false}
          >
            {""}
          </ComboboxItem>
        </ComboboxPopover>
        {/*
         * A false display value falls through to children, and an icon of 0
         * stays.
         */}
        <ComboboxSelect
          aria-label="Status summary"
          displayValue={false}
          chevron={false}
          icon={0}
        >
          Summary
        </ComboboxSelect>
        {/*
         * An explicit empty string requests blank content instead of a
         * fallback.
         */}
        <ComboboxSelect
          aria-label="Blank display"
          displayValue=""
          chevron={false}
        >
          Fallback
        </ComboboxSelect>
        <ComboboxSelect aria-label="Blank summary" chevron={false}>
          {""}
        </ComboboxSelect>
      </ComboboxProvider>
    </section>
  );
}

/** The input-combobox-optional-props sandbox. */
export function OptionalProps() {
  const [name, setName] = React.useState("");
  // Explicit undefined models unset optional props forwarded by a wrapper.
  return (
    <section aria-label="Project editor" className="grid gap-8">
      <label>
        Project name
        <Input
          render={undefined}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <p>Project: {name || "Untitled"}</p>
      <label>
        Notes
        <Input render={<textarea />} />
      </label>
      <Combobox
        label="Assignee"
        popover={{ portal: undefined, gutter: undefined }}
      >
        <ComboboxItem
          value="Alice"
          focusOnHover={undefined}
          blurOnHoverEnd={undefined}
        />
        <ComboboxItem
          value="Bob"
          focusOnHover={undefined}
          blurOnHoverEnd={undefined}
        />
      </Combobox>
      <ComboboxProvider defaultSelectedValue="Active">
        <ComboboxSelectLabel>Status</ComboboxSelectLabel>
        <ComboboxSelect />
        <ComboboxPopover gutter={undefined} shift={undefined}>
          <ComboboxItem value="Active" checkmark="before" />
          <ComboboxItem value="Complete" checkmark="before" />
        </ComboboxPopover>
      </ComboboxProvider>
    </section>
  );
}

/** The combobox-item-highlight sandbox. */
export function ItemHighlight() {
  return (
    <div className="grid gap-6">
      <section aria-label="Static thumbnail">
        <Thumbnail />
      </section>
      <Ariakit.ComboboxProvider
        defaultOpen
        defaultActiveId="highlighted-member"
      >
        <Ariakit.ComboboxList
          aria-label="Reference members"
          // Match the lifted canvas used by the thumbnail's popover.
          {...layer.jsx({
            $layer: "canvas",
            $lighten: true,
            className: "w-66",
          })}
        >
          <Ariakit.ComboboxItem id="highlighted-member" {...comboboxItem.jsx()}>
            Reference highlight
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem {...comboboxItem.jsx()}>
            Reference rest
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
