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
  ComboboxGroup,
  ComboboxItem,
  ComboboxSelect,
} from "@ariakit/ui/components/combobox.ariakit.react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import { useState } from "react";
import { Example, ExampleGrid } from "../example.react.tsx";

interface DetailsProps {
  name: string;
}

// Migrated from the disclosure-button-store sandbox with the same markup.
function Details({ name }: DetailsProps) {
  const store = ak.useDisclosureStore();
  return (
    <section className="grid gap-2">
      <DisclosureButton
        store={store}
        indicator={false}
        $p={3}
        $rounded="md"
        className="border data-open:border-green-700 data-open:bg-green-100 data-open:text-green-950"
      >
        {name} details
      </DisclosureButton>
      <DisclosureContent store={store}>
        {name} details are available.
      </DisclosureContent>
    </section>
  );
}

function DisclosureButtonStore() {
  // The surrounding open provider must not replace Details' explicit store.
  return (
    <div className="grid gap-6">
      <Details name="Project" />
      <ak.DisclosureProvider defaultOpen>
        <Details name="Team" />
      </ak.DisclosureProvider>
    </div>
  );
}

// Migrated from the disclosure-optional-content sandbox with the same markup.
function DisclosureOptionalContent() {
  const [headings, setHeadings] = useState(false);
  // False omits optional content; zero still renders as a label, icon, or
  // description.
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show filter headings
      </label>
      <Disclosure button={headings && "Project filters"}>
        <div className="grid gap-4">
          <Combobox label={headings && "Assignee"} aria-label="Assignee">
            <ComboboxGroup label={headings && "Team"}>
              <ComboboxItem value="Alice" />
              <ComboboxItem value="Bob" />
            </ComboboxGroup>
          </Combobox>
          <ComboboxSelect
            label={headings && "Status"}
            aria-label="Status"
            defaultValue="Active"
            items={[{ value: "Active" }, { value: "Complete" }]}
          />
        </div>
      </Disclosure>
      <Disclosure button={0}>No pending requests</Disclosure>
      <Disclosure button={{ description: "Advanced options" }}>
        Advanced controls
      </Disclosure>
      <Disclosure button={{ children: "Pending requests", description: 0 }}>
        No requests need review
      </Disclosure>
      <Disclosure
        button={{ children: "Archived requests", description: false }}
      >
        Archived requests are available
      </Disclosure>
      <Disclosure button={{ children: false, description: "Optional title" }}>
        Optional settings
      </Disclosure>
      <Disclosure button={{ children: "Unread messages", icon: 0 }}>
        No unread messages
      </Disclosure>
    </div>
  );
}

export function DisclosureFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Disclosure button store"
        description="A DisclosureButton and a DisclosureContent that share an explicit store follow it, even inside an open DisclosureProvider."
        stretch
        code={
          <>
            <DisclosureButton $p={3} $rounded="md">
              Project details
            </DisclosureButton>
            <DisclosureContent />
            <ak.DisclosureProvider>
              <DisclosureButton $p={3} $rounded="md">
                Team details
              </DisclosureButton>
              <DisclosureContent />
            </ak.DisclosureProvider>
          </>
        }
      >
        <DisclosureButtonStore />
      </Example>

      <Example
        title="Disclosure optional content"
        description="false omits the button, the label, the icon or the description, and 0 still renders as content. A checkbox toggles the filter headings."
        stretch
        code={
          <>
            <Disclosure>
              <Combobox>
                <ComboboxGroup>
                  <ComboboxItem />
                  <ComboboxItem />
                </ComboboxGroup>
              </Combobox>
              <ComboboxSelect />
            </Disclosure>
            <Disclosure>No pending requests</Disclosure>
            <Disclosure>Advanced controls</Disclosure>
            <Disclosure>No requests need review</Disclosure>
            <Disclosure>Archived requests</Disclosure>
            <Disclosure>Optional settings</Disclosure>
            <Disclosure>No unread messages</Disclosure>
          </>
        }
      >
        <DisclosureOptionalContent />
      </Example>

      <Example
        title="Named description-only button"
        description="An aria-label names a button that shows only a description, so the description describes the button instead of naming it."
      >
        <Disclosure
          button={{
            "aria-label": "Advanced filters",
            description: "Tune the results",
          }}
        >
          Filter controls
        </Disclosure>
      </Example>
    </ExampleGrid>
  );
}

export default DisclosureFixturesExamples;
