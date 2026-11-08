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
  Hovercard,
  HovercardAnchor,
  HovercardDescription,
  HovercardDisclosure,
  HovercardDismiss,
  HovercardHeading,
  HovercardProvider,
} from "@ariakit/ui/components/hovercard.ariakit.react";
import { useEffect, useState } from "react";

interface Person {
  name: string;
  handle: string;
  role: string;
}

const people: Person[] = [
  { name: "Kai Tanaka", handle: "kai", role: "Designer in Lisbon" },
  { name: "Noor Haddad", handle: "noor", role: "Engineer in Amman" },
  { name: "Lena Fischer", handle: "lena", role: "Writer in Leipzig" },
];

/**
 * Counts the slides of a shared hovercard, which are transform transitions of
 * the wrapper that Ariakit positions. A slide is motion that no attribute
 * reports, so the count is the visible state that the tests read.
 */
function useSlideCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const onTransitionRun = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      // The listener is on this document, so its targets are from this window.
      if (!(event.target instanceof HTMLElement)) return;
      const popup = event.target.firstElementChild;
      if (!popup?.hasAttribute("data-shared-hovercard")) return;
      setCount((count) => count + 1);
    };
    document.addEventListener("transitionrun", onTransitionRun);
    return () => document.removeEventListener("transitionrun", onTransitionRun);
  }, []);
  return count;
}

function PersonCard({ person }: { person?: Person }) {
  return (
    <>
      <HovercardHeading>{person?.name}</HovercardHeading>
      <HovercardDescription>{person?.role}</HovercardDescription>
    </>
  );
}

function SingleSection() {
  const person = people[0];
  return (
    <section aria-label="Single" className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">Single</h2>
      <HovercardProvider>
        <div className="flex items-center gap-1">
          <HovercardAnchor href={`#${person?.handle}`} className="underline">
            {person?.name}
          </HovercardAnchor>
          {/* Without children, the disclosure takes its default name. */}
          <HovercardDisclosure />
        </div>
        <Hovercard className="grid gap-1">
          <HovercardDismiss className="justify-self-end" />
          <PersonCard person={person} />
        </Hovercard>
      </HovercardProvider>
    </section>
  );
}

/** Shows the person of the active anchor in the shared hovercard. */
function SharedHovercard() {
  const store = ak.useHovercardContext();
  const anchor = ak.useStoreState(store, "anchorElement");
  const handle = anchor?.getAttribute("href")?.slice(1);
  const person = people.find((person) => person.handle === handle);
  return (
    <Hovercard
      $slide
      // The hovercard stays mounted while hidden, so it reopens at another
      // anchor from its previous place.
      unmountOnHide={false}
      data-shared-hovercard
      className="grid gap-1"
    >
      <PersonCard person={person} />
    </Hovercard>
  );
}

function SharedSection() {
  const slides = useSlideCount();
  return (
    <section aria-label="Shared" className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">Shared</h2>
      <HovercardProvider placement="right">
        <ul className="grid gap-6">
          {people.map((person) => (
            <li key={person.handle}>
              <HovercardAnchor href={`#${person.handle}`} className="underline">
                {person.name}
              </HovercardAnchor>
            </li>
          ))}
        </ul>
        <SharedHovercard />
      </HovercardProvider>
      <output className="text-sm">Slides: {slides}</output>
    </section>
  );
}

function DisclosureSection() {
  const person = people[1];
  return (
    <section aria-label="Disclosure" className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">Disclosure</h2>
      <HovercardProvider>
        <div className="flex items-center gap-1">
          <HovercardAnchor href={`#${person?.handle}`} className="underline">
            {person?.name}
          </HovercardAnchor>
          <HovercardDisclosure
            aria-label={`More details about ${person?.name}`}
          />
        </div>
        <Hovercard>
          <PersonCard person={person} />
        </Hovercard>
      </HovercardProvider>
    </section>
  );
}

interface OptionalLabelHovercardProps {
  person?: Person;
  /** The text of the buttons, which can be empty, as from a missing message. */
  label: string | null;
}

/** Buttons whose optional label is empty, which keep their icon and name. */
function OptionalLabelHovercard({
  person,
  label,
}: OptionalLabelHovercardProps) {
  return (
    <HovercardProvider>
      <div className="flex items-center gap-1">
        <HovercardAnchor href={`#${person?.handle}`} className="underline">
          {person?.name}
        </HovercardAnchor>
        <HovercardDisclosure>{label}</HovercardDisclosure>
      </div>
      <Hovercard className="grid gap-1">
        <HovercardDismiss className="justify-self-end">
          {label}
        </HovercardDismiss>
        <PersonCard person={person} />
      </Hovercard>
    </HovercardProvider>
  );
}

function OptionalLabelSection() {
  return (
    <section
      aria-label="Optional label"
      className="grid justify-items-start gap-2"
    >
      <h2 className="text-sm font-medium">Optional label</h2>
      <OptionalLabelHovercard person={people[2]} label={null} />
    </section>
  );
}

export default function Example() {
  return (
    <div className="grid gap-12 p-12">
      <SingleSection />
      <SharedSection />
      <DisclosureSection />
      <OptionalLabelSection />
    </div>
  );
}
