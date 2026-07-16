/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { List, ListItem } from "@ariakit/ui/ariakit/list.react.tsx";
import { Heading } from "@ariakit/ui/html/heading.react.tsx";
import { Link } from "@ariakit/ui/html/link.react.tsx";
import { Prose } from "@ariakit/ui/html/prose.react.tsx";

export function CompareProseLegacy() {
  return (
    <div className="ak-prose w-full">
      <h2>Getting started</h2>
      <p>
        Use the <code>create-app</code> CLI to scaffold a{" "}
        <strong>starter project</strong> with sensible defaults. Read the{" "}
        <a href="#">installation guide</a> for details.
      </p>
      <p>
        Press <kbd>⌘</kbd>
        <kbd>K</kbd> to open the command palette.
      </p>
      <pre>
        <code>npm create app@latest</code>
      </pre>
      <hr />
      {/* h4 dodges the compare grid styling every h3 as a section label. */}
      <h4>Milestones</h4>
      <p>Ship these before the first release.</p>
      <ul>
        <li>Choose how to accept payments</li>
        <li>
          Create a one-off product
          <ul>
            <li>Set a price</li>
          </ul>
        </li>
        <li>View Checkout docs</li>
      </ul>
      <div className="ak-layer ak-layer-3 rounded-xl p-4 grid gap-2">
        <p>Layered note about payments.</p>
        <ul>
          <li>Choose a provider</li>
        </ul>
      </div>
    </div>
  );
}

export function CompareProseNew() {
  return (
    <Prose className="w-full">
      <Heading>Getting started</Heading>
      <p>
        Use the <code>create-app</code> CLI to scaffold a{" "}
        <strong>starter project</strong> with sensible defaults. Read the{" "}
        <Link href="#">installation guide</Link> for details.
      </p>
      <p>
        Press <kbd>⌘</kbd>
        <kbd>K</kbd> to open the command palette.
      </p>
      <pre>
        <code>npm create app@latest</code>
      </pre>
      <hr />
      <Heading level={4}>Milestones</Heading>
      <p>Ship these before the first release.</p>
      <List>
        <ListItem>Choose how to accept payments</ListItem>
        <ListItem>
          Create a one-off product
          <List>
            <ListItem>Set a price</ListItem>
          </List>
        </ListItem>
        <ListItem>View Checkout docs</ListItem>
      </List>
      <div className="ak-layer ak-layer-3 rounded-xl p-4 grid gap-2">
        <p>Layered note about payments.</p>
        <List>
          <ListItem>Choose a provider</ListItem>
        </List>
      </div>
    </Prose>
  );
}
