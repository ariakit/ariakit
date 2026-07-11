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
  Disclosure,
  DisclosureGroup,
} from "@ariakit/ui/ariakit/disclosure.react.tsx";
import { RocketIcon } from "lucide-react";
import {
  Disclosure as LegacyDisclosure,
  DisclosureGroup as LegacyDisclosureGroup,
} from "#app/examples/_lib/ariakit/disclosure.react.tsx";

export function CompareDisclosureLegacy() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <LegacyDisclosure
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        button="What is Ariakit?"
      >
        Ariakit is an open source component library.
      </LegacyDisclosure>
      <LegacyDisclosure
        split
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        button="Split layout"
      >
        The content area is visually separated from the button.
      </LegacyDisclosure>
      <LegacyDisclosure
        defaultOpen
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        button={{ children: "Guide", indicator: "plus-end" }}
        content={{ guide: true }}
      >
        Content indented with a vertical guide line.
      </LegacyDisclosure>
      <LegacyDisclosure
        className="ak-layer-9 ak-frame ak-frame-xl/2 ak-disclosure-icon-5"
        button={{
          children: "With icon",
          description: "And a description",
          icon: <RocketIcon />,
        }}
      >
        Icon-aligned content.
      </LegacyDisclosure>
      <LegacyDisclosureGroup>
        <LegacyDisclosure button="First">First content.</LegacyDisclosure>
        <LegacyDisclosure button="Second">Second content.</LegacyDisclosure>
      </LegacyDisclosureGroup>
    </div>
  );
}

export function CompareDisclosureNew() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Disclosure
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        button="What is Ariakit?"
      >
        Ariakit is an open source component library.
      </Disclosure>
      <Disclosure
        split
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        button="Split layout"
      >
        The content area is visually separated from the button.
      </Disclosure>
      <Disclosure
        defaultOpen
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        button={{ children: "Guide", indicator: "plus-end" }}
        content={{ guide: true }}
      >
        Content indented with a vertical guide line.
      </Disclosure>
      <Disclosure
        className="ak-layer-9 ak-frame ak-frame-xl/2"
        $iconSize={5}
        button={{
          children: "With icon",
          description: "And a description",
          icon: <RocketIcon />,
        }}
      >
        Icon-aligned content.
      </Disclosure>
      <DisclosureGroup>
        <Disclosure button="First">First content.</Disclosure>
        <Disclosure button="Second">Second content.</Disclosure>
      </DisclosureGroup>
    </div>
  );
}
