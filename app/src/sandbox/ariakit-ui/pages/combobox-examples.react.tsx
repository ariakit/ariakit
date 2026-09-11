/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectLabel,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { useState } from "react";
import type { CSSProperties } from "react";
import { ExampleStage, openPopoverProps } from "../example.react.tsx";

// The stateful examples of the Combobox page and the plumbing its held-open
// lists share. The boxes of the stateful examples pass a code prop, because the
// snippet serializer cannot name these helpers.

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

export const countries = [
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

export const reviewStatuses = [
  { value: "Draft", layer: "warning" },
  { value: "In review", layer: "brand" },
  { value: "Published", layer: "success" },
  { value: "Archived", layer: "danger" },
] as const;

export const timezones = [
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
        // The page holds other lists open, and a list that already exists
        // when they open is marked as outside them and ignores Escape. A
        // portaled list that mounts on open is not.
        // https://github.com/ariakit/ariakit/issues/7463
        popover={{ unmountOnHide: true }}
      >
        {matches.map((country) => (
          <ComboboxItem key={country} value={country} />
        ))}
        {!matches.length && <ComboboxEmpty />}
      </Combobox>
    </div>
  );
}

/** A status badge that takes the color of the selected status. */
export function BadgeSelectExample() {
  const [value, setValue] = useState("In review");
  const status = reviewStatuses.find((entry) => entry.value === value);
  return (
    <div className="flex flex-col items-start gap-2">
      <ComboboxSelectProvider
        value={value}
        setValue={(next) => {
          // A single select only ever reports one string.
          if (typeof next !== "string") return;
          setValue(next);
        }}
      >
        <ComboboxSelectLabel>Review status</ComboboxSelectLabel>
        <ComboboxSelectButton badge $layer={status?.layer} />
        {/*
          Mounted on open, so the lists held open on the page do not mark it
          as outside them, which would make it ignore Escape.
          https://github.com/ariakit/ariakit/issues/7463
        */}
        <ComboboxSelectPopover unmountOnHide>
          {reviewStatuses.map((entry) => (
            <ComboboxSelectItem key={entry.value} value={entry.value} />
          ))}
        </ComboboxSelectPopover>
      </ComboboxSelectProvider>
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
      <ComboboxSelectProvider
        open
        defaultValue="UTC"
        inputValue={search}
        setInputValue={setSearch}
        resetValueOnHide
      >
        <div className="flex w-full flex-col items-start gap-2">
          <ComboboxSelectLabel>Timezone</ComboboxSelectLabel>
          <ComboboxSelectButton />
        </div>
        <ComboboxSelectPopover {...openListProps}>
          <ComboboxInput
            autoSelect
            placeholder="Search timezones"
            aria-label="Search timezones"
          />
          <ak.ComboboxList>
            {matches.map((zone) => (
              <ComboboxSelectItem key={zone} value={zone} />
            ))}
          </ak.ComboboxList>
        </ComboboxSelectPopover>
      </ComboboxSelectProvider>
    </ExampleStage>
  );
}
