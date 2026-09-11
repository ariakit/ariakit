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
  ComboboxSelect,
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectLabel,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { comboboxItem } from "@ariakit/ui/styles/combobox";
import { layer } from "@ariakit/ui/styles/layer";
import * as React from "react";
import Thumbnail from "#app/examples/combobox-group/thumbnail.react.tsx";

// The scenarios of the old combobox-item-highlight, combobox-select-content and
// input-combobox-optional-props sandboxes, with their props, markup and initial
// state unchanged. Their regression tests depend on every detail here.

/**
 * The combobox-select-content sandbox's index, without the conditional content
 * that has an article of its own.
 */
export function SelectContent() {
  const store = Ariakit.useComboboxStore({ defaultSelectedValue: "Apple" });
  const selectedValue = Ariakit.useStoreState(store, "selectedValue");
  // Undefined sizes keep the badge default, and numeric zero remains content.
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <ComboboxSelect
          badge
          aria-label="Default status"
          displayValue="Pending"
        />
        <ComboboxSelect
          badge
          $size={undefined}
          aria-label="Optional status"
          displayValue="Active"
        />
        <ComboboxSelect
          badge
          $size="lg"
          aria-label="Large status"
          displayValue="Complete"
        />
      </div>
      <div>
        <ComboboxSelect
          store={store}
          label="Fruit"
          items={[{ value: "Apple" }, { value: "Orange" }]}
        />
        <p>Selected fruit: {selectedValue}</p>
      </div>
      <div className="flex gap-4">
        <div>
          <ComboboxSelectProvider defaultValue="All">
            <ComboboxSelectLabel>Unread messages</ComboboxSelectLabel>
            <ComboboxSelectButton displayValue={0}>All</ComboboxSelectButton>
          </ComboboxSelectProvider>
        </div>
        <div>
          <ComboboxSelectProvider defaultValue="All">
            <ComboboxSelectLabel>Open issues</ComboboxSelectLabel>
            <ComboboxSelectButton>{0}</ComboboxSelectButton>
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="no-issues">{0}</ComboboxSelectItem>
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
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
      <ComboboxSelectProvider defaultValue="Open">
        <ComboboxSelectLabel>Status filter</ComboboxSelectLabel>
        <ComboboxSelectButton
          chevron={false}
          icon={icon}
          displayValue={labels && "Custom status"}
        >
          {labels && "Status summary"}
        </ComboboxSelectButton>
        <ComboboxSelectPopover>
          <ComboboxSelectItem value="Open" checkmark={false} icon={icon}>
            {labels && "Open status"}
          </ComboboxSelectItem>
          <ComboboxSelectItem value="Closed" checkmark={false} icon={icon}>
            {labels && "Closed status"}
          </ComboboxSelectItem>
          <ComboboxSelectItem value="No activity" checkmark={false} icon={0} />
          <ComboboxSelectItem
            value="Blank"
            aria-label="Blank status"
            checkmark={false}
          >
            {""}
          </ComboboxSelectItem>
        </ComboboxSelectPopover>
        {/* A false display value falls through to children, and an icon of 0 stays. */}
        <ComboboxSelectButton
          aria-label="Status summary"
          displayValue={false}
          chevron={false}
          icon={0}
        >
          Summary
        </ComboboxSelectButton>
        {/* An explicit empty string requests blank content instead of a fallback. */}
        <ComboboxSelectButton
          aria-label="Blank display"
          displayValue=""
          chevron={false}
        >
          Fallback
        </ComboboxSelectButton>
        <ComboboxSelectButton aria-label="Blank summary" chevron={false}>
          {""}
        </ComboboxSelectButton>
      </ComboboxSelectProvider>
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
      <ComboboxSelect
        label="Status"
        defaultValue="Active"
        popover={{ gutter: undefined, shift: undefined }}
        items={[{ value: "Active" }, { value: "Complete" }]}
      />
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
