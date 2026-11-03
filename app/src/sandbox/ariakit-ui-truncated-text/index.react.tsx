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
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";
import { BellIcon, SettingsIcon } from "lucide-react";
import { createContext, useContext, useState } from "react";

const SHORT_NAME = "Roadmap";
const LONG_NAME = "Roadmap for the second half of the year";

const NameContext = createContext(SHORT_NAME);

// Renders the name on its own, as a translated text or a resolved Suspense
// boundary does.
function DocumentName() {
  return useContext(NameContext);
}

// The element stays the same on every render, so TruncatedText gets no new
// children when the name changes.
const documentName = <DocumentName />;

// The link keeps its width when its text changes, so only the new text can cut
// it off.
function RenamedLink() {
  const [name, setName] = useState(SHORT_NAME);
  return (
    <div className="flex flex-col items-start gap-2">
      <NameContext.Provider value={name}>
        <Tooltip text={name}>
          <TruncatedText
            render={<Link href="#roadmap" className="block w-40 truncate" />}
          >
            {documentName}
          </TruncatedText>
        </Tooltip>
      </NameContext.Provider>
      <Button
        $border
        onClick={() =>
          setName((current) =>
            current === SHORT_NAME ? LONG_NAME : SHORT_NAME,
          )
        }
      >
        Rename the document
      </Button>
    </div>
  );
}

// The label hides with display: none and stays mounted, as with a container
// query, and the tooltip then names the icon button.
function HideableLabelItem() {
  const [hidden, setHidden] = useState(false);
  return (
    <div className="flex flex-col items-start gap-2">
      <Tooltip text="Notifications">
        <Button aria-label="Notifications">
          <ButtonSlot aria-hidden>
            <BellIcon />
          </ButtonSlot>
          <TruncatedText
            render={<ButtonLabel className={hidden ? "hidden" : undefined} />}
          >
            Notifications
          </TruncatedText>
        </Button>
      </Tooltip>
      <Button $border onClick={() => setHidden((current) => !current)}>
        {hidden ? "Show the label" : "Hide the label"}
      </Button>
    </div>
  );
}

// The label leaves the button when the sidebar collapses, and the tooltip then
// names the icon button.
function CollapsibleItem() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="flex flex-col items-start gap-2">
      <Tooltip text="Settings">
        <Button aria-label={expanded ? undefined : "Settings"}>
          <ButtonSlot aria-hidden>
            <SettingsIcon />
          </ButtonSlot>
          {expanded && (
            <TruncatedText render={<ButtonLabel />}>Settings</TruncatedText>
          )}
        </Button>
      </Tooltip>
      <Button $border onClick={() => setExpanded((current) => !current)}>
        {expanded ? "Collapse the sidebar" : "Expand the sidebar"}
      </Button>
    </div>
  );
}

// A larger font makes the text wider, and the sizes in rem keep the size of the
// element.
function EnlargedText() {
  const [large, setLarge] = useState(false);
  return (
    <div className="flex flex-col items-start gap-2">
      <Tooltip text="Quarterly report">
        <TruncatedText
          className={`block w-[10rem] truncate leading-[1.5rem] ${large ? "text-2xl" : ""}`}
        >
          Quarterly report
        </TruncatedText>
      </Tooltip>
      <Button $border onClick={() => setLarge((current) => !current)}>
        {large ? "Shrink the text" : "Enlarge the text"}
      </Button>
    </div>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col items-start gap-8">
      <RenamedLink />
      <CollapsibleItem />
      <HideableLabelItem />
      {/* Static text gets a tab stop from the tooltip only while it is cut
          off. */}
      <div className="flex flex-col gap-2">
        <Tooltip text="Quarterly revenue by region and product line">
          <TruncatedText className="block w-40 truncate">
            Quarterly revenue by region and product line
          </TruncatedText>
        </Tooltip>
        <Tooltip text="Revenue">
          <TruncatedText className="block w-40 truncate">Revenue</TruncatedText>
        </Tooltip>
        {/* The glyphs are taller than the tight lines, so they overflow below
            the text that shows in full. */}
        <Tooltip text="Gross margin">
          <TruncatedText className="w-40 text-lg leading-none line-clamp-2">
            Gross margin
          </TruncatedText>
        </Tooltip>
      </div>
      <EnlargedText />
    </div>
  );
}
