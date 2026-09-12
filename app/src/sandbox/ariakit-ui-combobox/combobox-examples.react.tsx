/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSelect,
  ComboboxSelectLabel,
  ComboboxPopover,
  ComboboxProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { useState } from "react";
import type { CSSProperties } from "react";
import {
  ExampleStage,
  openPopoverProps,
} from "#app/components/ariakit-ui-example.react.tsx";

// The stateful examples of the Combobox sandbox and the plumbing its held-open
// lists share.

/**
 * `openPopoverProps` for a combobox or select list held open inline. The list
 * caps its height at `--popover-available-height`, which Ariakit measures from
 * the viewport: a stage below the fold at load measures no room at all, and the
 * list collapses to its padding. Pinning the variable on the popover to the
 * recipe's own cap makes the list independent of the scroll position.
 */
export const openListProps = {
  ...openPopoverProps,
  style: { "--popover-available-height": "20rem" } as CSSProperties,
};

const countries = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Japan",
  "Kenya",
  "Mexico",
  "Norway",
];

const reviewStatuses = [
  { value: "Draft", layer: "warning" },
  { value: "In review", layer: "brand" },
  { value: "Published", layer: "success" },
  { value: "Archived", layer: "danger" },
] as const;

const timezones = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function filterByText(values: readonly string[], text: string) {
  const query = text.trim().toLowerCase();
  if (!query) return [...values];
  return values.filter((value) => value.toLowerCase().includes(query));
}

/**
 * The page's one interactive Combobox. It starts closed, and a filter owns the
 * input value.
 */
export function CountryComboboxExample() {
  const [value, setValue] = useState("");
  const matches = filterByText(countries, value);
  return (
    <div className="flex flex-col items-start gap-2">
      <Combobox
        label="Destination"
        placeholder="Search countries"
        autoSelect
        autoComplete="both"
        inputValue={value}
        setInputValue={setValue}
        // The page holds other lists open, and a list that already exists when
        // they open is marked as outside them and ignores Escape. A portaled
        // list that mounts on open is not.
        // https://github.com/ariakit/ariakit/issues/7463
        popover={{ unmountOnHide: true }}
      >
        <ComboboxList>
          {matches.map((country) => (
            <ComboboxItem key={country} value={country} />
          ))}
        </ComboboxList>
        {!matches.length && <ComboboxEmpty aria-hidden />}
      </Combobox>
      {/* The region stays mounted when the popup is closed or has matches. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {matches.length ? "" : "No results found"}
      </div>
    </div>
  );
}

/** A select that takes the color of the selected status. */
export function StatusSelectExample() {
  const [value, setValue] = useState("In review");
  const status = reviewStatuses.find((entry) => entry.value === value);
  return (
    <div className="flex flex-col items-start gap-2">
      <ComboboxProvider
        selectedValue={value}
        setSelectedValue={(next) => {
          // A single select only ever reports one string.
          if (typeof next !== "string") return;
          setValue(next);
        }}
      >
        <ComboboxSelectLabel>Review status</ComboboxSelectLabel>
        <ComboboxSelect $layer={status?.layer} />
        {/*
          Mounted on open, so the lists held open on the page do not mark it as
          outside them, which would make it ignore Escape.
          https://github.com/ariakit/ariakit/issues/7463
        */}
        <ComboboxPopover unmountOnHide>
          {reviewStatuses.map((entry) => (
            <ComboboxItem
              checkmark="before"
              key={entry.value}
              value={entry.value}
            />
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
    </div>
  );
}

/**
 * A select whose popover holds a search input above the list, held open inline.
 * One combobox store drives both the search input and the selected value.
 */
export function SearchableSelectExample() {
  const [search, setSearch] = useState("");
  const matches = filterByText(timezones, search);
  return (
    <ExampleStage anchor="start" height={100}>
      <ComboboxProvider
        open
        defaultSelectedValue="UTC"
        inputValue={search}
        setInputValue={setSearch}
        resetValueOnHide
      >
        <div className="flex w-full flex-col items-start gap-2">
          <ComboboxSelectLabel>Timezone</ComboboxSelectLabel>
          <ComboboxSelect />
        </div>
        <ComboboxPopover {...openListProps}>
          <ComboboxInput
            autoSelect
            placeholder="Search timezones"
            aria-label="Search timezones"
          />
          <ComboboxList>
            {matches.map((zone) => (
              <ComboboxItem checkmark="before" key={zone} value={zone} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </ComboboxProvider>
    </ExampleStage>
  );
}

/** The search field stays in place while a long list scrolls below it. */
export function ScrollableSearchExample() {
  const [search, setSearch] = useState("");
  const matches = filterByText(countries, search);
  return (
    <ExampleStage anchor="start" height={100}>
      <ComboboxProvider
        open
        defaultSelectedValue="Argentina"
        inputValue={search}
        setInputValue={setSearch}
      >
        <div className="flex w-full flex-col items-start gap-2">
          <ComboboxSelectLabel>Shipping country</ComboboxSelectLabel>
          <ComboboxSelect />
        </div>
        <ComboboxPopover {...openListProps}>
          <ComboboxInput
            autoSelect
            placeholder="Search shipping countries"
            aria-label="Search shipping countries"
          />
          <ComboboxList>
            {matches.map((country) => (
              <ComboboxItem key={country} value={country} checkmark="before" />
            ))}
          </ComboboxList>
          {!matches.length && <ComboboxEmpty />}
        </ComboboxPopover>
      </ComboboxProvider>
    </ExampleStage>
  );
}

export function FieldBoundariesExample() {
  const longValue =
    "international-shipping-region-with-an-unbreakable-identifier";
  return (
    <Layer
      $layer="brand"
      render={<Text $text="danger" />}
      className="grid gap-4 p-4"
    >
      <Combobox
        label="Long suggestion"
        className="w-48"
        popover={{ unmountOnHide: true }}
      >
        <ComboboxItem value="Europe" />
        <ComboboxItem value={longValue} />
      </Combobox>
      <ComboboxProvider defaultSelectedValue="Europe">
        <ComboboxSelectLabel>Long selection</ComboboxSelectLabel>
        <ComboboxSelect className="w-48" />
        <ComboboxPopover unmountOnHide>
          <ComboboxItem value="Europe" checkmark="before" />
          <ComboboxItem value={longValue} checkmark="before" />
        </ComboboxPopover>
      </ComboboxProvider>
    </Layer>
  );
}

export function SelectPlaceholdersExample() {
  const items = [{ value: "Europe" }, { value: "Asia" }];
  return (
    <div className="grid gap-4">
      <ComboboxProvider defaultSelectedValue={[]}>
        <ComboboxSelectLabel>Extra regions</ComboboxSelectLabel>
        <ComboboxSelect placeholder={<em>No regions selected</em>} />
        <ComboboxPopover unmountOnHide>
          {items.map((item) => (
            <ComboboxItem key={item.value} {...item} checkmark="before" />
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
      <ComboboxProvider>
        <ComboboxSelectLabel>Automatic region</ComboboxSelectLabel>
        <ComboboxSelect placeholder="Choose automatically" />
        <ComboboxPopover>
          {items.map((item) => (
            <ComboboxItem key={item.value} {...item} checkmark="before" />
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
      <ComboboxProvider defaultSelectedValue="">
        <ComboboxSelectLabel>Custom prompt</ComboboxSelectLabel>
        <ComboboxSelect displayValue={0} placeholder="Unspecified" />
        <ComboboxSelect aria-label="Blank prompt" placeholder="Unspecified">
          {""}
        </ComboboxSelect>
        <ComboboxSelect aria-label="Zero prompt" placeholder={0} />
      </ComboboxProvider>
    </div>
  );
}
