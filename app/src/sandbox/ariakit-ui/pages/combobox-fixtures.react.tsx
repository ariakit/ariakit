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
  ComboboxItem,
  ComboboxSelect,
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectLabel,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { Example, ExampleGrid } from "../example.react.tsx";
import {
  ConditionalContent,
  ItemHighlight,
  OptionalProps,
  SelectContent,
} from "./combobox-fixtures-scenarios.react.tsx";

export function ComboboxFixturesExamples() {
  return (
    <ExampleGrid>
      {/* It spans the grid, like the full-width page it came from. */}
      <Example
        title="input-combobox-optional-props"
        description="Explicitly undefined optional props keep the defaults: an editable input, a combobox list in a portal, and the gutter and shift of both lists."
        wide
        code={
          <>
            <Input />
            <Input render={<textarea />} />
            <Combobox>
              <ComboboxItem value="Alice" />
              <ComboboxItem value="Bob" />
            </Combobox>
            <ComboboxSelect items={[]} />
          </>
        }
      >
        <OptionalProps />
      </Example>

      <Example
        title="combobox-select-content"
        description="An undefined size keeps the badge size, a supplied store drives the select, and a numeric zero stays content in the button and in an item."
        code={
          <>
            <ComboboxSelect badge />
            <ComboboxSelect badge />
            <ComboboxSelect badge $size="lg" />
            <ComboboxSelect items={[]} />
            <ComboboxSelectProvider>
              <ComboboxSelectLabel>Unread messages</ComboboxSelectLabel>
              <ComboboxSelectButton displayValue={0}>All</ComboboxSelectButton>
            </ComboboxSelectProvider>
            <ComboboxSelectProvider>
              <ComboboxSelectLabel>Open issues</ComboboxSelectLabel>
              <ComboboxSelectButton>{0}</ComboboxSelectButton>
              <ComboboxSelectPopover>
                <ComboboxSelectItem value="no-issues">{0}</ComboboxSelectItem>
              </ComboboxSelectPopover>
            </ComboboxSelectProvider>
          </>
        }
      >
        <SelectContent />
      </Example>

      <Example
        title="combobox-select-content conditional content"
        description="False labels, icons and display values fall back or leave nothing behind, a zero icon stays, and explicit empty strings stay blank."
        code={
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Status filter</ComboboxSelectLabel>
            <ComboboxSelectButton chevron={false} />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Open" checkmark={false} />
              <ComboboxSelectItem value="Closed" checkmark={false} />
              <ComboboxSelectItem value="No activity" checkmark={false} />
              <ComboboxSelectItem value="Blank" checkmark={false} />
            </ComboboxSelectPopover>
            <ComboboxSelectButton displayValue={false} chevron={false} />
            <ComboboxSelectButton displayValue="" chevron={false} />
            <ComboboxSelectButton chevron={false} />
          </ComboboxSelectProvider>
        }
      >
        <ConditionalContent />
      </Example>

      <Example
        title="combobox-item-highlight"
        description="The highlighted row of the static combobox-group thumbnail paints like the active item of a real list on the same lifted canvas."
        code={
          <ak.ComboboxProvider>
            <ak.ComboboxList>
              <ak.ComboboxItem>Reference highlight</ak.ComboboxItem>
              <ak.ComboboxItem>Reference rest</ak.ComboboxItem>
            </ak.ComboboxList>
          </ak.ComboboxProvider>
        }
      >
        <ItemHighlight />
      </Example>
    </ExampleGrid>
  );
}

export default ComboboxFixturesExamples;
