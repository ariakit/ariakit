import type { ComboboxSelectItemProps } from "@ariakit/ui/components/combobox.ariakit.react";
import {
  ComboboxSelect,
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import * as icons from "lucide-react";
import * as React from "react";
import {
  Caption,
  Labeled,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

const fruits = [
  { value: "Apple" },
  { value: "Banana" },
  { value: "Cherry" },
  { value: "Grape" },
  { value: "Orange" },
] satisfies ComboboxSelectItemProps[];

const frameworks = [
  { value: "React", icon: <icons.Atom /> },
  { value: "Solid", icon: <icons.Hexagon /> },
  { value: "Vue", icon: <icons.Triangle /> },
  { value: "Svelte", icon: <icons.Flame />, disabled: true, $disabled: true },
] satisfies ComboboxSelectItemProps[];

const statuses = [
  { value: "Draft", layer: "warning" },
  { value: "In review", layer: "brand" },
  { value: "Published", layer: "success" },
  { value: "Archived", layer: "danger" },
] as const;

const many = Array.from({ length: 24 }, (_, index) => ({
  value: `Option ${index + 1}`,
})) satisfies ComboboxSelectItemProps[];

function StatusSelect({ size }: { size?: "sm" }) {
  const [value, setValue] = React.useState("In review");
  const status = statuses.find((status) => status.value === value);
  return (
    <ComboboxSelectProvider
      value={value}
      setValue={(next) => {
        // A single select only ever reports one string.
        if (typeof next !== "string") return;
        setValue(next);
      }}
    >
      <ComboboxSelectButton badge $layer={status?.layer} $size={size} />
      <ComboboxSelectPopover>
        {statuses.map((status) => (
          <ComboboxSelectItem key={status.value} value={status.value} />
        ))}
      </ComboboxSelectPopover>
    </ComboboxSelectProvider>
  );
}

/**
 * A select whose popover is held open inside the card, so the list renders
 * without interaction. The provider owns the open state, and the popover is
 * positioned inside the stage rather than portalled.
 */
function OpenSelect({
  children,
  ...props
}: React.ComponentProps<typeof ComboboxSelectPopover> & {
  children?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-72">
      <ComboboxSelectProvider open defaultValue="Banana">
        <ComboboxSelectButton />
        <ComboboxSelectPopover
          portal={false}
          hideOnInteractOutside={false}
          // Focus stays where it was, so the page does not jump to the open
          // popover on load.
          autoFocusOnShow={false}
          // Pinned to its placement for the same reason as the popover
          // samples: the position is computed against the viewport.
          flip={false}
          slide={false}
          {...props}
        >
          {children ??
            fruits.map((fruit) => (
              <ComboboxSelectItem key={fruit.value} {...fruit} />
            ))}
        </ComboboxSelectPopover>
      </ComboboxSelectProvider>
    </div>
  );
}

export function SelectSection() {
  return (
    <Samples>
      <Sample
        title="Basic"
        code="ComboboxSelect label items defaultValue"
        description="The high-level component wires the provider, label, button and popover. Open it to see the checkmark on the selected item."
      >
        <Stage direction="column" className="items-start">
          <ComboboxSelect
            label="Fruit"
            items={fruits}
            defaultValue="Apple"
            className="min-w-40"
          />
          <ComboboxSelect
            items={fruits}
            defaultValue="Cherry"
            $kind="bevel"
            className="min-w-40"
          />
          <ComboboxSelect
            items={fruits}
            defaultValue="Grape"
            displayValue="A custom display value"
            className="min-w-40"
          />
        </Stage>
      </Sample>

      <Sample
        title="Icons and checkmarks"
        code='icon · ComboboxSelectItem icon · checkmark="before" | "after" | false'
        description="An icon before the value on the button, icons on the items, and the checkmark on either side or hidden."
      >
        <Stage direction="column" className="items-start">
          <ComboboxSelect
            defaultValue="React"
            icon={<icons.Atom />}
            className="min-w-44"
          >
            {frameworks.map((framework) => (
              <ComboboxSelectItem key={framework.value} {...framework} />
            ))}
          </ComboboxSelect>
          <ComboboxSelect defaultValue="React" className="min-w-44">
            {frameworks.map((framework) => (
              <ComboboxSelectItem
                key={framework.value}
                {...framework}
                checkmark="after"
              />
            ))}
          </ComboboxSelect>
          <ComboboxSelect defaultValue="React" className="min-w-44">
            {frameworks.map((framework) => (
              <ComboboxSelectItem
                key={framework.value}
                {...framework}
                checkmark={false}
              />
            ))}
          </ComboboxSelect>
        </Stage>
      </Sample>

      <Sample
        title="Chevron"
        code='chevron="after" | "before" | false'
        description="The chevron ends the row by default. It can lead the row or go away."
      >
        <Stage>
          <ComboboxSelect items={fruits} defaultValue="Apple" />
          <ComboboxSelect
            items={fruits}
            defaultValue="Apple"
            chevron="before"
          />
          <ComboboxSelect items={fruits} defaultValue="Apple" chevron={false} />
          <ComboboxSelect
            items={fruits}
            defaultValue="Apple"
            icon={<icons.Apple />}
            chevron="before"
          />
        </Stage>
      </Sample>

      <Sample
        title="Badge mode"
        code="ComboboxSelectButton badge $layer"
        description="The button borrows the badge recipe, tinted by the selected status."
      >
        <Stage>
          <StatusSelect />
          <StatusSelect size="sm" />
        </Stage>
      </Sample>

      <Sample
        title="Kinds, sizes and layers"
        code='$kind="bevel" · $size · $rounded="full" · $layer="brand" · $lightnessOffset · disabled'
        description="The button is a Button, so every button knob applies."
      >
        <Stage>
          <ComboboxSelect items={fruits} defaultValue="Apple" $size="sm" />
          <ComboboxSelect items={fruits} defaultValue="Apple" $size="lg" />
          <ComboboxSelect
            items={fruits}
            defaultValue="Apple"
            $rounded="full"
            $kind="bevel"
          />
          <ComboboxSelect items={fruits} defaultValue="Apple" $layer="brand" />
          <ComboboxSelect
            items={fruits}
            defaultValue="Apple"
            $lightnessOffset
          />
          <ComboboxSelect items={fruits} defaultValue="Apple" disabled />
        </Stage>
      </Sample>

      <Sample
        title="Long list"
        code='popover={{ className: "max-h-56 overflow-y-auto" }}'
        description="A popover taller than its cap scrolls its items."
      >
        <Stage className="items-start">
          <ComboboxSelect
            items={many}
            defaultValue="Option 7"
            popover={{ className: "max-h-56 overflow-y-auto" }}
          />
        </Stage>
      </Sample>

      <Sample
        title="Open popover"
        code="ComboboxSelectProvider open · ComboboxSelectPopover portal={false}"
        description="The popover held open below its button: canvas layer, compact padding, checkmark on the selected item and a disabled item at the end."
      >
        <OpenSelect>
          {fruits.map((fruit) => (
            <ComboboxSelectItem key={fruit.value} {...fruit} />
          ))}
          <ComboboxSelectItem value="Sold out pear" disabled $disabled />
        </OpenSelect>
      </Sample>

      <Sample
        title="Open popover variants"
        code='ComboboxSelectPopover $shadow="md" $rounded="lg" $p={2} · icons'
        description="The popover is a Popover, so the shadow, radius and padding knobs apply. Items can carry icons with the checkmark after them."
      >
        <OpenSelect $shadow="md" $rounded="lg" $p={2}>
          {frameworks.map((framework) => (
            <ComboboxSelectItem
              key={framework.value}
              {...framework}
              checkmark="after"
            />
          ))}
        </OpenSelect>
      </Sample>

      <Sample
        title="On layers"
        code="ComboboxSelect inside Layer"
        description="The button follows the surface. The popover stays on the canvas layer so the list reads the same everywhere."
      >
        <SwatchGrid min="12rem">
          <Layer $lightnessOffset={2} className="grid gap-2 rounded-xl p-4">
            <Caption>Offset</Caption>
            <Labeled label="Flat">
              <ComboboxSelect items={fruits} defaultValue="Apple" />
            </Labeled>
          </Layer>
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <Labeled label="Bevel">
              <ComboboxSelect
                items={fruits}
                defaultValue="Apple"
                $kind="bevel"
              />
            </Labeled>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <Labeled label="Badge">
              <StatusSelect />
            </Labeled>
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
