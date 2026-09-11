/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { inputPlaceholder } from "@ariakit/ui/styles/input";
import { ListFilter, Search } from "lucide-react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";

export function InputExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="An empty field that shows its placeholder in the muted ink."
      >
        <Input
          aria-label="Full name"
          placeholder="Ada Lovelace"
          {...screenshotFocus}
        />
      </Example>

      <Example
        title="Labeled field with hint"
        description="A visible label above a field that has a value, and a hint that the field references as its description."
      >
        <div className="grid w-full gap-1.5">
          <Text
            render={<label htmlFor="input-display-name" />}
            className="text-sm font-medium"
          >
            Display name
          </Text>
          <Input
            id="input-display-name"
            defaultValue="Ada Lovelace"
            aria-describedby="input-display-name-hint"
          />
          <Text id="input-display-name-hint" className="ak-ink-70 text-sm">
            Shown on your public profile.
          </Text>
        </div>
      </Example>

      <Example
        title="Invalid"
        description="A field marked invalid, with a danger edge and an error message that the field references."
      >
        <div className="grid w-full gap-1.5">
          <Text
            render={<label htmlFor="input-email" />}
            className="text-sm font-medium"
          >
            Email
          </Text>
          <Input
            id="input-email"
            defaultValue="not an email"
            aria-invalid
            aria-describedby="input-email-error"
            $edge="danger"
          />
          <Text id="input-email-error" $text="danger" className="text-sm">
            Enter a valid email address.
          </Text>
        </div>
      </Example>

      <Example
        title="Disabled"
        description="The field lies flat on the surface, with a faint edge, dimmed text and a not-allowed cursor."
      >
        <Input aria-label="Username" defaultValue="ada" disabled />
      </Example>

      <Example
        title="Subtle edge"
        description="A lighter edge. The default is the lightest edge that meets the contrast minimum for a field boundary, so use this only where something else marks the field."
      >
        <Input
          aria-label="Company"
          placeholder="Analytical Engines Ltd."
          $edgeWeight="normal"
        />
      </Example>

      <Example title="Pill" description="A full radius, as on search fields.">
        <Input
          aria-label="Search articles"
          placeholder="Search articles"
          $rounded="full"
        />
      </Example>

      <Example
        title="Compact"
        description="Less padding around the text, at the same font size."
      >
        <Input aria-label="City" placeholder="London" $p={2} />
      </Example>

      <Example
        title="Small"
        description="A text-sm class on the label around the field. The field takes that font size, and its padding and radius scale with it."
      >
        <Text render={<label />} className="grid w-full gap-1.5 text-sm">
          <span className="font-medium">Postal code</span>
          <Input placeholder="SW1A 1AA" />
        </Text>
      </Example>

      <Example
        title="Thick focus ring"
        description="Tab into the field to see a thicker ring. A click shows it too."
      >
        <Input aria-label="Tag" placeholder="design" $focus={3} />
      </Example>

      <Example
        title="Textarea"
        description="The same recipe on a multi-line field. The rows keep a comfortable line height."
      >
        <Input
          render={<textarea rows={3} />}
          aria-label="Notes"
          defaultValue={"First line\nSecond line\nThird line"}
          className="w-full resize-y"
        />
      </Example>

      <Example
        title="Date field"
        description="A native date input keeps the height of a text field next to the browser's picker controls."
      >
        <Input type="date" aria-label="Start date" defaultValue="2026-09-10" />
      </Example>

      <Example
        title="Field with leading icon"
        description="The field style on a label around a plain input, so an icon shares the box. The ring shows when the input inside takes focus."
      >
        <Input
          render={<label />}
          focusable={false}
          className="flex items-center gap-2"
        >
          <ListFilter className="ak-ink-60 size-[1em] flex-none" />
          <input
            aria-label="Filter components"
            placeholder="Filter components"
            className="min-w-0 flex-1"
          />
        </Input>
      </Example>

      <Example
        title="Share link with copy button"
        description="A read-only link with a prefix and an action button in one field. A label inside the field keeps the button out of it."
      >
        <Input
          render={<div />}
          focusable={false}
          $p={1}
          className="flex items-center gap-2"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 self-stretch ps-2">
            <Text className="ak-ink-60">https://</Text>
            <input
              aria-label="Share link"
              defaultValue="ariakit.com/ui"
              readOnly
              className="min-w-0 flex-1"
            />
          </label>
          <Button $size="sm">Copy</Button>
        </Input>
      </Example>

      <Example
        title="Search trigger"
        description="A button that looks like an empty field, to open a search dialog. The label uses the inputPlaceholder recipe."
      >
        <Input
          render={<button type="button" />}
          className="flex items-center gap-2 text-start"
        >
          <Search className="ak-ink-60 size-[1em] flex-none" />
          <Text {...inputPlaceholder.jsx({ className: "flex-1 truncate" })}>
            Search docs
          </Text>
          {/*
            The key cap is taller than the one-line row of the field, so the
            negative margin keeps the trigger at the height of a text field.
          */}
          <Kbd aria-hidden className="-my-1">
            ⌘K
          </Kbd>
        </Input>
      </Example>

      <Example
        title="Inline form with submit button"
        description="A field beside a submit button. The row stretches both to one height."
      >
        <form
          className="flex w-full gap-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <Input
            type="email"
            aria-label="Newsletter email"
            placeholder="you@example.com"
            className="min-w-0 flex-1"
          />
          <Button type="submit" $layer="brand" $kind="bevel">
            Subscribe
          </Button>
        </form>
      </Example>

      <Example
        title="On a brand layer"
        description="The field sinks into a saturated brand surface, and its edge and placeholder adapt to it."
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="grid w-full">
          <Input aria-label="Invite email" placeholder="teammate@example.com" />
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default InputExamples;
