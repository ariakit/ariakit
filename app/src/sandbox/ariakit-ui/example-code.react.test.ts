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
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { CheckboxCard } from "@ariakit/ui/components/checkbox.ariakit.react";
import { ComboboxSelect } from "@ariakit/ui/components/combobox.ariakit.react";
import {
  Disclosure,
  DisclosureButton,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { List } from "@ariakit/ui/components/list.ariakit.react";
import { Popover } from "@ariakit/ui/components/popover.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import { Table } from "@ariakit/ui/components/table.ariakit.react";
import { Plus } from "lucide-react";
import { createElement as h, Fragment } from "react";
import type { ReactNode } from "react";
import { expect, test } from "vitest";
import {
  markExampleCodeTransparent,
  serializeExample,
} from "./example-code.react.ts";

test("prints a component with no children as a leaf", () => {
  expect(serializeExample(h(Separator))).toBe("<Separator />");
});

test("indents nested components by two spaces", () => {
  const element = h(
    Frame,
    { $layer: "brand", $rounded: "xl", $p: 4 },
    h(Prose, null, h(Separator)),
  );

  expect(serializeExample(element)).toBe(
    `<Frame $layer="brand" $rounded="xl" $p={4}>
  <Prose>
    <Separator />
  </Prose>
</Frame>`,
  );
});

test("prints only the children of host elements and fragments", () => {
  const element = h(
    "div",
    { className: "grid gap-4" },
    h(Fragment, null, h(Separator)),
    h("section", null, h(Badge, null, h(BadgeLabel, null, "New"))),
  );

  expect(serializeExample(element)).toBe(
    `<Separator />
<Badge>
  <BadgeLabel>New</BadgeLabel>
</Badge>`,
  );
});

test("prints each kind of variant value", () => {
  const element = h(Button, {
    $size: "lg",
    $p: 4,
    $border: true,
    $lightnessOffset: false,
  });

  expect(serializeExample(element)).toBe(
    '<Button $size="lg" $p={4} $border $lightnessOffset={false} />',
  );
  expect(serializeExample(h(Separator, { $gap: "2rem" }))).toBe(
    '<Separator $gap="2rem" />',
  );
});

test("skips variants with no value", () => {
  const element = h(Frame, {
    $rounded: undefined,
    $lightnessMin: null,
    $border: true,
  });

  expect(serializeExample(element)).toBe("<Frame $border />");
});

test("prints the state props and skips every other plain prop", () => {
  const element = h(CheckboxCard, {
    defaultChecked: true,
    disabled: true,
    name: "terms",
    className: "w-full",
    onChange: () => {},
  });

  expect(serializeExample(element)).toBe(
    "<CheckboxCard defaultChecked disabled />",
  );
});

test("prints element props inline, keeping the host tag", () => {
  const element = h(DisclosureButton, {
    render: h("a", { href: "#top" }),
    icon: h(Plus),
  });

  expect(serializeExample(element)).toBe(
    "<DisclosureButton render={<a />} icon={<Plus />} />",
  );
});

test("prints the variants and children of an element prop", () => {
  const element = h(Button, {
    render: h(ak.Radio, { value: "light", render: h(Button, { $px: "sm" }) }),
  });

  expect(serializeExample(element)).toBe(
    '<Button render={<ak.Radio value="light" render={<Button $px="sm" />} />} />',
  );
});

test("prints the semantic props that choose a rendering", () => {
  const button = h(DisclosureButton, {
    indicator: "chevron-down-next",
    description: "Details",
    name: "details",
  });

  expect(serializeExample(button)).toBe(
    '<DisclosureButton indicator="chevron-down-next" description="Details" />',
  );
  expect(serializeExample(h(List, { ordered: false }))).toBe(
    "<List ordered={false} />",
  );
  expect(serializeExample(h(HeadingLevel, { level: 4 }))).toBe(
    "<HeadingLevel level={4} />",
  );
});

test("prints the variants and semantic keys of object-valued part props", () => {
  const disclosure = h(Disclosure, {
    split: true,
    button: { indicator: "plus-end", onClick: () => {} },
    content: { guide: true, className: "w-full" },
  });
  const table = h(Table, {
    container: { $border: true, className: "w-full" },
  });

  expect(serializeExample(disclosure)).toBe(
    '<Disclosure split button={{ indicator: "plus-end" }} content={{ guide: true }} />',
  );
  expect(serializeExample(table)).toBe(
    "<Table container={{ $border: true }} />",
  );
});

test("skips object props with nothing to print, such as a style", () => {
  const element = h(Frame, { style: { width: 200 }, $border: true });

  expect(serializeExample(element)).toBe("<Frame $border />");
});

test("prints data arrays as a placeholder and long copy as an ellipsis", () => {
  const select = h(ComboboxSelect, { items: [{ value: "Apple" }] });
  const button = h(DisclosureButton, {
    description: "A description long enough to be copy rather than a token.",
  });

  expect(serializeExample(select)).toBe("<ComboboxSelect items={[…]} />");
  expect(serializeExample(button)).toBe('<DisclosureButton description="…" />');
});

test("prints a host wrapper that sets a writing direction", () => {
  const element = h(
    "div",
    { dir: "rtl", lang: "ar", className: "grid" },
    h(List, { ordered: true }),
  );

  expect(serializeExample(element)).toBe(
    `<div dir="rtl">
  <List ordered />
</div>`,
  );
});

test("keeps the plumbing props that pin an overlay out of the snippet", () => {
  const element = h(Popover, {
    portal: false,
    flip: false,
    slide: false,
    gutter: 8,
    autoFocusOnShow: false,
    hideOnInteractOutside: false,
    $shadow: "md",
  });

  expect(serializeExample(element)).toBe('<Popover $shadow="md" />');
});

test("inlines a lone text child and collapses its whitespace", () => {
  const element = h(Button, null, "  Save\n  the file  ");

  expect(serializeExample(element)).toBe("<Button>Save the file</Button>");
});

test("replaces text longer than a label with an ellipsis", () => {
  const element = h(
    Prose,
    null,
    h("p", null, "A paragraph long enough to be copy rather than a label."),
    h(Separator),
  );

  expect(serializeExample(element)).toBe(
    `<Prose>
  …
  <Separator />
</Prose>`,
  );
});

test("puts text on its own line next to sibling elements", () => {
  const element = h(Button, null, h(ButtonSlot, null, h(Plus)), "Add item");

  expect(serializeExample(element)).toBe(
    `<Button>
  <ButtonSlot>
    <Plus />
  </ButtonSlot>
  Add item
</Button>`,
  );
});

test("names @ariakit/react components under the ak namespace", () => {
  const element = h(ak.Radio, { value: "dark", checked: true });

  expect(serializeExample(element)).toBe('<ak.Radio value="dark" checked />');
});

test("prints a component with a display name as a leaf", () => {
  expect(serializeExample(h(Plus, { strokeWidth: 1.5 }))).toBe("<Plus />");
});

test("prints only the children of a marked sandbox helper", () => {
  function Stage({ children }: { children?: ReactNode }) {
    return children;
  }
  markExampleCodeTransparent(Stage);

  expect(serializeExample(h(Stage, null, h(Separator)))).toBe("<Separator />");
});

test("keeps the heading context visible in the snippet", () => {
  const element = h(
    Prose,
    null,
    h(Separator),
    h(HeadingLevel, { level: 3 }, h(Heading, null, "Section heading")),
  );

  expect(serializeExample(element)).toBe(
    `<Prose>
  <Separator />
  <HeadingLevel level={3}>
    <Heading>Section heading</Heading>
  </HeadingLevel>
</Prose>`,
  );
});

test("throws for a component it cannot name", () => {
  function StatefulHelper() {
    return null;
  }

  expect(() => serializeExample(h(StatefulHelper))).toThrow(
    "Pass the code prop to <Example> to describe <StatefulHelper>",
  );
});

test("ignores nullish and boolean children", () => {
  const element = h("div", null, null, undefined, false, "", h(Separator));

  expect(serializeExample(element)).toBe("<Separator />");
});
