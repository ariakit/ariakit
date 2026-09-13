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
import { Input, InputSlot } from "@ariakit/ui/components/input.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { inputPlaceholder } from "@ariakit/ui/styles/input";
import { ListFilter, Search } from "lucide-react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

export default function InputExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="An empty field that shows its placeholder in the muted ink."
        code={`
          <Input />
        `}
      >
        <Input aria-label="Full name" placeholder="Ada Lovelace" />
      </Example>

      <Example
        title="Labeled field with hint"
        description="A visible label above a field that has a value, and a hint that the field references as its description."
        code={`
          <Text render={<label />}>Display name</Text>
          <Input />
          <Text>…</Text>
        `}
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
        code={`
          <Text render={<label />}>Email</Text>
          <Input aria-invalid />
          <Text $text="danger">…</Text>
        `}
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
          />
          <Text id="input-email-error" $text="danger" className="text-sm">
            Enter a valid email address.
          </Text>
        </div>
      </Example>

      <Example
        title="Disabled"
        description="The field lies flat on the surface, with a faint edge, dimmed text and a not-allowed cursor."
        code={`
          <Input disabled />
        `}
      >
        <Input aria-label="Username" defaultValue="ada" disabled />
      </Example>

      <Example
        title="Subtle edge"
        description="A lighter edge. The default is the lightest edge that meets the contrast minimum for a field boundary, so use this only where something else marks the field."
        code={`
          <Input $edgeWeight="normal" />
        `}
      >
        <Input
          aria-label="Company"
          placeholder="Analytical Engines Ltd."
          $edgeWeight="normal"
        />
      </Example>

      <Example
        title="Pill"
        description="A full radius, as on search fields."
        code={`
          <Input $rounded="full" />
        `}
      >
        <Input
          aria-label="Search articles"
          placeholder="Search articles"
          $rounded="full"
        />
      </Example>

      <Example
        title="Compact"
        description="Less padding around the text, at the same font size."
        code={`
          <Input $p={1} />
        `}
      >
        <Input aria-label="City" placeholder="London" $p={1} />
      </Example>

      <Example
        title="Small"
        description="The small control size. The field sets its own font size, and its padding and radius scale with it."
        code={`
          <Text render={<label />}>
            Postal code
            <Input $size="sm" />
          </Text>
        `}
      >
        <Text render={<label />} className="grid w-full gap-1.5">
          <span className="font-medium">Postal code</span>
          <Input placeholder="SW1A 1AA" $size="sm" />
        </Text>
      </Example>

      <Example
        title="Thick focus ring"
        description="Tab into the field to see a thicker ring. A click shows it too."
        code={`
          <Input $focus={3} />
        `}
      >
        <Input aria-label="Tag" placeholder="design" $focus={3} />
      </Example>

      <Example
        title="Textarea"
        description="The same recipe on a multi-line field. The rows keep a comfortable line height."
        code={`
          <Input render={<textarea rows={3} />} />
        `}
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
        code={`
          <Input type="date" />
        `}
      >
        <Input type="date" aria-label="Start date" defaultValue="2026-09-10" />
      </Example>

      <Example
        title="Field with leading icon"
        description="The field style on a label around a plain input, so an icon shares the box. The ring shows when the input inside takes focus."
        code={`
          <Input render={<label />}>
            <InputSlot><ListFilter /></InputSlot>
            <input aria-label="Filter components" />
          </Input>
        `}
      >
        <Input render={<label />} focusable={false}>
          <InputSlot className="ak-ink-60">
            <ListFilter />
          </InputSlot>
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
        code={`
          <Input render={<div />}>
            <label className="-ms-(--px) -my-(--py) flex min-w-0 flex-1 items-center gap-2 ps-(--px) py-(--py)">
              <Text>https://</Text>
              <input aria-label="Share link" readOnly />
            </label>
            <InputSlot $size="2xl" $square={false}>
              <Button $size="sm">Copy</Button>
            </InputSlot>
          </Input>
        `}
      >
        <Input render={<div />} focusable={false}>
          {/* Extend native label activation over the field padding. */}
          <label className="-ms-(--px) -my-(--py) flex min-w-0 flex-1 items-center gap-2 ps-(--px) py-(--py)">
            <Text className="ak-ink-60">https://</Text>
            <input
              aria-label="Share link"
              defaultValue="ariakit.com/ui"
              readOnly
              className="min-w-0 flex-1"
            />
          </label>
          <InputSlot $size="2xl" $square={false}>
            <Button $size="sm">Copy</Button>
          </InputSlot>
        </Input>
      </Example>

      <Example
        title="Search trigger"
        description="A button that looks like an empty field, to open a search dialog. The label uses the inputPlaceholder recipe."
        code={`
          <Input render={<button type="button" />}>
            <InputSlot><Search /></InputSlot>
            <Text>Search docs</Text>
            <InputSlot $kind="shortcut" $size="xl"><kbd aria-hidden>⌘K</kbd></InputSlot>
          </Input>
        `}
      >
        <Input render={<button type="button" />} className="text-start">
          <InputSlot className="ak-ink-60">
            <Search />
          </InputSlot>
          <Text {...inputPlaceholder.jsx({ className: "flex-1 truncate" })}>
            Search docs
          </Text>
          <InputSlot $kind="shortcut" $size="xl">
            <kbd aria-hidden>⌘K</kbd>
          </InputSlot>
        </Input>
      </Example>

      <Example
        title="Inline form with submit button"
        description="A field beside a submit button, with both centered to show their intrinsic heights."
        code={`
          <Input type="email" />
          <Button type="submit" $layer="brand" $kind="bevel">Subscribe</Button>
        `}
      >
        <form
          className="flex w-full items-center gap-2"
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
        title="Control sizes"
        description="Each field shares its size with the button beside it. The row centers the controls without stretching them."
        code={`
          <Input $size="sm" />
          <Button $size="sm" $kind="bevel">Save</Button>
        `}
      >
        <div className="grid w-full gap-3">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
            <div key={size} className="flex items-center gap-2">
              <Input
                $size={size}
                aria-label={`${size} field`}
                placeholder={`${size} field`}
                className="w-0 min-w-0 flex-1"
              />
              <Button $size={size} $kind="bevel" aria-label={`Save ${size}`}>
                Save
              </Button>
            </div>
          ))}
        </div>
      </Example>

      <Example
        title="On a brand layer"
        description="The field separates from a saturated brand surface, and its edge and placeholder adapt to it."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Input />
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="grid w-full">
          <Input aria-label="Invite email" placeholder="teammate@example.com" />
        </Frame>
      </Example>
    </ExampleGrid>
  );
}
