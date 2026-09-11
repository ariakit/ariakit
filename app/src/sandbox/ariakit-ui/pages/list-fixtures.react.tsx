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
  List,
  ListDisclosure,
  ListItem,
  ListItemMarker,
} from "@ariakit/ui/components/list.ariakit.react";
import { useState } from "react";
import { Example, ExampleGrid } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

// Migrated from the list-disclosure-optional-button sandbox with the same
// props, markup and initial state.
function ListDisclosureOptionalButton() {
  const [headings, setHeadings] = useState(false);
  // A hidden heading supplies false; zero must still render a button label.
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show task headings
      </label>
      <List ordered>
        <li>
          <ListDisclosure button={headings && "Project tasks"}>
            Review assigned issues
          </ListDisclosure>
        </li>
        <li>
          <ListDisclosure button={0}>No pending tasks</ListDisclosure>
        </li>
      </List>
    </div>
  );
}

export function ListFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="list-disclosure-optional-button"
        description="A button shorthand of false renders the content with no button, and a button of 0 still renders a button labeled 0."
        code={
          <List ordered>
            <li>
              <ListDisclosure>Review assigned issues</ListDisclosure>
            </li>
            <li>
              <ListDisclosure>No pending tasks</ListDisclosure>
            </li>
          </List>
        }
      >
        <ListDisclosureOptionalButton />
      </Example>

      <Example
        title="list-item-marker-checked"
        description="A progress of 1 completes the marker by default, and an explicit checked value overrides a conflicting progress in both directions."
      >
        {/* Explicit checked values must override the conflicting progress values. */}
        <div className="grid gap-4">
          <List aria-label="Completed progress">
            <ListItem progress={1}>Ready for review</ListItem>
          </List>
          <List aria-label="Explicit unchecked state">
            <ListItem progress={1} checked={false}>
              Awaiting approval
            </ListItem>
          </List>
          <List aria-label="Explicit checked state">
            <ListItem progress={0.5} checked>
              Approved early
            </ListItem>
          </List>
        </div>
      </Example>

      <Example
        title="Raw marker edge"
        description="A raw edge paints the ring of an empty slot in the exact edge color, not at the slot's lighter weight."
      >
        <span className="flex items-center gap-2">
          <span className="relative inline-block size-[1lh]">
            <ListItemMarker checked={false} $edge="brand" $edgeRaw />
          </span>
          Review pending
        </span>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("list-fixtures", ListFixturesExamples);
