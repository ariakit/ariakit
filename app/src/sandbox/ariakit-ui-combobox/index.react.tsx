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
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemContent,
  ComboboxItemDescription,
  ComboboxItemLabel,
  ComboboxItemSlot,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectLabel,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
  ComboboxSelectValue,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import * as icons from "lucide-react";
import {
  Example,
  ExampleGrid,
  ExampleStage,
} from "#app/components/ariakit-ui-example.react.tsx";
import {
  BadgeSelectExample,
  CountryComboboxExample,
  FieldBoundariesExample,
  SearchableSelectExample,
  SelectPlaceholdersExample,
  openListProps,
} from "./combobox-examples.react.tsx";
import {
  ConditionalContent,
  ItemHighlight,
  OptionalProps,
  SelectContent,
} from "./combobox-fixtures-scenarios.react.tsx";

const startTimes = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

function selectedCountLabel(value: string | readonly string[]) {
  if (typeof value === "string") return value;
  return `${value.length} ${value.length === 1 ? "label" : "labels"}`;
}

export default function ComboboxExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Type to filter the countries. The first match completes inline, and a message shows when nothing matches."
        code={`
          <Combobox label="Destination">
            <ComboboxList>{options}</ComboboxList>
            {empty && <ComboboxEmpty aria-hidden />}
          </Combobox>
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {empty ? "No results found" : ""}
          </div>
        `}
      >
        <CountryComboboxExample />
      </Example>

      <Example
        title="Open suggestions"
        description="The list below its input, as wide as the input. The active item is highlighted, and a disabled item is dimmed."
        code={`
          <ComboboxProvider open>
            <ComboboxLabel>Snack</ComboboxLabel>
            <ComboboxInput />
            <ComboboxPopover>
              <ComboboxItem value="Almonds" />
              <ComboboxItem value="Cashews" />
              <ComboboxItem value="Pistachios" />
              <ComboboxItem value="Walnuts" disabled />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxProvider open defaultActiveId="snack-cashews">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxLabel>Snack</ComboboxLabel>
              <ComboboxInput placeholder="Search snacks" />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxItem value="Almonds" />
              <ComboboxItem id="snack-cashews" value="Cashews" />
              <ComboboxItem value="Pistachios" />
              <ComboboxItem value="Walnuts" disabled />
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Groups"
        description="Suggestions in labeled groups. A group label is small, muted text above its items."
        code={`
          <ComboboxProvider open>
            <ComboboxLabel>Find records</ComboboxLabel>
            <ComboboxInput />
            <ComboboxPopover>
              <ComboboxGroup>
                <ComboboxItem value="Emma Johnson" />
                <ComboboxItem value="Liam Carter" />
              </ComboboxGroup>
              <ComboboxGroup>
                <ComboboxItem value="annual_report.pdf" />
                <ComboboxItem value="team_photo.jpg" />
              </ComboboxGroup>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={82}>
          <ComboboxProvider open>
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxLabel>Find records</ComboboxLabel>
              <ComboboxInput placeholder="Search records" />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxGroup label="Members">
                <ComboboxItem value="Emma Johnson" />
                <ComboboxItem value="Liam Carter" />
              </ComboboxGroup>
              <ComboboxGroup label="Files">
                <ComboboxItem value="annual_report.pdf" />
                <ComboboxItem value="team_photo.jpg" />
              </ComboboxGroup>
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Custom items"
        description="Rows with an avatar, a name and an email. The list is as wide as the input, so a long email is truncated."
        code={`
          <ComboboxProvider open>
            <ComboboxLabel>Member</ComboboxLabel>
            <ComboboxInput />
            <ComboboxPopover>
              <ComboboxItem value="Ava Thompson">
                <ComboboxItemSlot $kind="avatar" $rowSpan={2} $layer="brand" $contrast>AT</ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Ava Thompson</ComboboxItemLabel>
                  <ComboboxItemDescription>ava@example.com</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
              <ComboboxItem value="Noah Patel">
                <ComboboxItemSlot $kind="avatar" $rowSpan={2}>NP</ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Noah Patel</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={56}>
          <ComboboxProvider open>
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxLabel>Member</ComboboxLabel>
              <ComboboxInput placeholder="Search members" className="w-64" />
            </div>
            <ComboboxPopover {...openListProps} sameWidth>
              <ComboboxItem value="Ava Thompson">
                <ComboboxItemSlot
                  $kind="avatar"
                  $rowSpan={2}
                  $layer="brand"
                  $contrast
                  aria-hidden
                >
                  AT
                </ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Ava Thompson</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    ava@example.com
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
              <ComboboxItem value="Noah Patel">
                <ComboboxItemSlot $kind="avatar" $rowSpan={2} aria-hidden>
                  NP
                </ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Noah Patel</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    noah.patel.engineering@example.com
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Command items"
        description="Rows with a leading icon and a trailing shortcut or badge. The shortcut is hidden from the option name, and aria-keyshortcuts announces it."
        code={`
          <ComboboxProvider open>
            <ComboboxLabel>Command</ComboboxLabel>
            <ComboboxInput />
            <ComboboxPopover>
              <ComboboxItem value="New file">
                <ComboboxItemSlot>
                  <FilePlus />
                </ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>New file</ComboboxItemLabel>
                </ComboboxItemContent>
                <ComboboxItemSlot $kind="shortcut">
                  <Kbd>⌘</Kbd>
                  <Kbd>N</Kbd>
                </ComboboxItemSlot>
              </ComboboxItem>
              <ComboboxItem value="Share">
                <ComboboxItemSlot>
                  <Share2 />
                </ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Share</ComboboxItemLabel>
                </ComboboxItemContent>
                <ComboboxItemSlot $kind="badge">New</ComboboxItemSlot>
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={44}>
          <ComboboxProvider open>
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxLabel>Command</ComboboxLabel>
              <ComboboxInput placeholder="Type a command" />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxItem value="New file" aria-keyshortcuts="Meta+N">
                <ComboboxItemSlot>
                  <icons.FilePlus />
                </ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>New file</ComboboxItemLabel>
                </ComboboxItemContent>
                <ComboboxItemSlot $kind="shortcut" aria-hidden>
                  <Kbd>⌘</Kbd>
                  <Kbd>N</Kbd>
                </ComboboxItemSlot>
              </ComboboxItem>
              <ComboboxItem value="Share">
                <ComboboxItemSlot>
                  <icons.Share2 />
                </ComboboxItemSlot>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Share</ComboboxItemLabel>
                </ComboboxItemContent>
                <ComboboxItemSlot $kind="badge">New</ComboboxItemSlot>
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Empty state"
        description="The message sits outside the option list. The Default example announces filtering changes through a status region that stays mounted outside the popup."
        code={`
          <ComboboxProvider open>
            <ComboboxLabel>Ingredient</ComboboxLabel>
            <ComboboxInput />
            <ComboboxPopover>
              <ComboboxList />
              <ComboboxEmpty />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={36}>
          <ComboboxProvider open defaultInputValue="Saffron">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxLabel>Ingredient</ComboboxLabel>
              <ComboboxInput />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxList />
              <ComboboxEmpty />
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Default select"
        description="A select that shows the chosen value. At rest it looks like a text field: sunk into the surface, with a border."
        code={`
          <ComboboxSelect items={[…]} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            label="Favorite fruit"
            items={[
              { value: "Apple" },
              { value: "Banana" },
              { value: "Cherry" },
            ]}
            defaultValue="Apple"
            // The page holds other lists open, and a list that already exists
            // when they open is marked as outside them and ignores Escape. A
            // portaled list that mounts on open is not.
            // https://github.com/ariakit/ariakit/issues/7463
            popover={{ unmountOnHide: true }}
          />
        </div>
      </Example>

      <Example
        title="Open select"
        description="The list below its button. A check marks the selected item, and a disabled item is dimmed."
        code={`
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Dessert</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Brownie" />
              <ComboboxSelectItem value="Cheesecake" />
              <ComboboxSelectItem value="Tiramisu" />
              <ComboboxSelectItem value="Sold-out macaron" disabled />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxSelectProvider open defaultValue="Cheesecake">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Dessert</ComboboxSelectLabel>
              <ComboboxSelectButton />
            </div>
            <ComboboxSelectPopover {...openListProps}>
              <ComboboxSelectItem value="Brownie" />
              <ComboboxSelectItem value="Cheesecake" />
              <ComboboxSelectItem value="Tiramisu" />
              <ComboboxSelectItem value="Sold-out macaron" disabled />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        </ExampleStage>
      </Example>

      <Example
        title="In a form"
        description="A select below a text input, with the same look and height. Its list is at least as wide as its button."
        code={`
          Full name
          <Input />
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Country</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Ireland" />
              <ComboboxSelectItem value="Portugal" />
              <ComboboxSelectItem value="United Kingdom" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <ExampleStage anchor="start" height={76}>
          <div className="grid w-full content-start gap-4">
            <label className="grid gap-2">
              Full name
              <Input defaultValue="Ada Lovelace" />
            </label>
            <ComboboxSelectProvider open defaultValue="United Kingdom">
              <div className="grid gap-2">
                <ComboboxSelectLabel>Country</ComboboxSelectLabel>
                <ComboboxSelectButton className="w-full" />
              </div>
              <ComboboxSelectPopover {...openListProps}>
                <ComboboxSelectItem value="Ireland" />
                <ComboboxSelectItem value="Portugal" />
                <ComboboxSelectItem value="United Kingdom" />
              </ComboboxSelectPopover>
            </ComboboxSelectProvider>
          </div>
        </ExampleStage>
      </Example>

      <Example
        title="Rich items"
        description="Items with a label and a description. In the disabled item, the description dims with the label."
        code={`
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Plan</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Starter">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Starter</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxSelectItem>
              <ComboboxSelectItem value="Team">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Team</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxSelectItem>
              <ComboboxSelectItem value="Enterprise" disabled>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Enterprise</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxSelectItem>
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <ExampleStage anchor="start" height={70}>
          <ComboboxSelectProvider open defaultValue="Team">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Plan</ComboboxSelectLabel>
              <ComboboxSelectButton />
            </div>
            <ComboboxSelectPopover {...openListProps}>
              <ComboboxSelectItem value="Starter">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Starter</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    One project and community support
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxSelectItem>
              <ComboboxSelectItem value="Team">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Team</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    Unlimited projects and email support
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxSelectItem>
              <ComboboxSelectItem value="Enterprise" disabled>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Enterprise</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    Contact sales to turn it on
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxSelectItem>
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Icons"
        description="An icon on the button and on each item, with the check after the label."
        code={`
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Framework</ComboboxSelectLabel>
            <ComboboxSelectButton icon={<Atom />} />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="React" icon={<Atom />} checkmark="after" />
              <ComboboxSelectItem value="Solid" icon={<Hexagon />} checkmark="after" />
              <ComboboxSelectItem value="Vue" icon={<Triangle />} checkmark="after" />
              <ComboboxSelectItem value="Svelte" icon={<Flame />} checkmark="after" disabled />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxSelectProvider open defaultValue="React">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Framework</ComboboxSelectLabel>
              <ComboboxSelectButton icon={<icons.Atom />} />
            </div>
            <ComboboxSelectPopover {...openListProps}>
              <ComboboxSelectItem
                value="React"
                icon={<icons.Atom />}
                checkmark="after"
              />
              <ComboboxSelectItem
                value="Solid"
                icon={<icons.Hexagon />}
                checkmark="after"
              />
              <ComboboxSelectItem
                value="Vue"
                icon={<icons.Triangle />}
                checkmark="after"
              />
              <ComboboxSelectItem
                value="Svelte"
                icon={<icons.Flame />}
                checkmark="after"
                disabled
              />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Bevel select"
        description="A raised select that looks like a push button."
        code={`
          <ComboboxSelect $kind="bevel" items={[…]} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            $kind="bevel"
            label="Size"
            items={[
              { value: "Small" },
              { value: "Medium" },
              { value: "Large" },
            ]}
            defaultValue="Medium"
          />
        </div>
      </Example>

      <Example
        title="Flat select"
        description="A see-through select for a toolbar that already owns the surface. It paints a background only on hover."
        code={`
          <ComboboxSelect $layer="transparent" items={[…]} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            $layer="transparent"
            label="View"
            items={[
              { value: "Board" },
              { value: "List" },
              { value: "Timeline" },
            ]}
            defaultValue="Board"
          />
        </div>
      </Example>

      <Example
        title="Chevron first"
        description="The chevron starts the row, and the icon moves after the value."
        code={`
          <ComboboxSelect chevron="before" icon={<Layers />} items={[…]} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            label="Group by"
            chevron="before"
            icon={<icons.Layers />}
            items={[
              { value: "Status" },
              { value: "Owner" },
              { value: "Priority" },
            ]}
            defaultValue="Status"
          />
        </div>
      </Example>

      <Example
        title="Without chevron"
        description="A select with no chevron. A leading icon still shows that the control opens a list."
        code={`
          <ComboboxSelect chevron={false} icon={<ArrowUpDown />} items={[…]} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            label="Sort by"
            chevron={false}
            icon={<icons.ArrowUpDown />}
            items={[
              { value: "Newest" },
              { value: "Oldest" },
              { value: "Name" },
            ]}
            defaultValue="Newest"
          />
        </div>
      </Example>

      <Example
        title="Placeholder"
        description="An empty value shows a prompt with placeholder ink until the user picks an item. Set defaultValue to an empty string to prevent the first item from being selected automatically."
        code={`
          <ComboboxSelect items={[…]} defaultValue="" placeholder="Choose a region" />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            label="Shipping region"
            defaultValue=""
            items={[
              { value: "Europe" },
              { value: "North America" },
              { value: "Asia" },
            ]}
            placeholder="Choose a region"
            popover={{ unmountOnHide: true }}
          />
          <SelectPlaceholdersExample />
        </div>
      </Example>

      <Example
        title="Badge select"
        description="A select that looks like a status badge. Its color follows the selected status."
        code={`
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Review status</ComboboxSelectLabel>
            <ComboboxSelectButton badge $layer="brand" />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Draft" />
              <ComboboxSelectItem value="In review" />
              <ComboboxSelectItem value="Published" />
              <ComboboxSelectItem value="Archived" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <BadgeSelectExample />
      </Example>

      <Example
        title="Disabled select"
        description="The value and the chevron are dimmed, the border is faint, and hover and press do nothing."
        code={`
          <ComboboxSelect items={[…]} disabled />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelect
            label="Billing cycle"
            items={[{ value: "Monthly" }, { value: "Yearly" }]}
            defaultValue="Yearly"
            disabled
          />
        </div>
      </Example>

      <Example
        title="Multiple selection"
        description="An array value keeps more than one item. Each selected item has a check, and the button lists the selected values."
        code={`
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Toppings</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Cheese" />
              <ComboboxSelectItem value="Olives" />
              <ComboboxSelectItem value="Mushrooms" />
              <ComboboxSelectItem value="Peppers" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxSelectProvider open defaultValue={["Cheese", "Olives"]}>
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Toppings</ComboboxSelectLabel>
              <ComboboxSelectButton />
            </div>
            <ComboboxSelectPopover {...openListProps}>
              <ComboboxSelectItem value="Cheese" />
              <ComboboxSelectItem value="Olives" />
              <ComboboxSelectItem value="Mushrooms" />
              <ComboboxSelectItem value="Peppers" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Selection count"
        description="A render function in ComboboxSelectValue changes the text on the button, here to the number of selected items."
        code={`
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Issue labels</ComboboxSelectLabel>
            <ComboboxSelectButton displayValue={<ComboboxSelectValue />} />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Bug" />
              <ComboboxSelectItem value="Docs" />
              <ComboboxSelectItem value="Feature" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxSelectProvider defaultValue={["Bug", "Docs"]}>
            <ComboboxSelectLabel>Issue labels</ComboboxSelectLabel>
            <ComboboxSelectButton
              displayValue={
                <ComboboxSelectValue>{selectedCountLabel}</ComboboxSelectValue>
              }
            />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Bug" />
              <ComboboxSelectItem value="Docs" />
              <ComboboxSelectItem value="Feature" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        </div>
      </Example>

      <Example
        title="Searchable select"
        description="A search field above the items filters the list. A ComboboxList keeps the items in a listbox of their own, apart from the field."
        code={`
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Timezone</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxInput />
              <ComboboxList>
                <ComboboxSelectItem value="UTC" />
                <ComboboxSelectItem value="Europe/London" />
              </ComboboxList>
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <SearchableSelectExample />
      </Example>

      <Example
        title="Long list"
        description="A list taller than the height limit of the popover scrolls inside it. It has an item for every hour."
        code={`
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Start time</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="00:00" />
              <ComboboxSelectItem value="01:00" />
              <ComboboxSelectItem value="02:00" />
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <ExampleStage anchor="start" height={104}>
          <ComboboxSelectProvider open defaultValue="02:00">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Start time</ComboboxSelectLabel>
              <ComboboxSelectButton />
            </div>
            <ComboboxSelectPopover {...openListProps}>
              {startTimes.map((time) => (
                <ComboboxSelectItem key={time} value={time} />
              ))}
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Field boundaries"
        description="Labels inherit the layer's text color. Long options stay inside the available viewport width."
        code={`
          <Layer $layer="brand" render={<Text $text="danger" />}>
            <Combobox label="Long suggestion">…</Combobox>
            <ComboboxSelect label="Long selection" items={[…]} />
          </Layer>
        `}
      >
        <FieldBoundariesExample />
      </Example>

      {/*
        Regression fixtures: Combobox and ComboboxSelect scenarios migrated from
        the combobox-item-highlight, combobox-select-content and
        input-combobox-optional-props sandboxes.
      */}
      {/* It spans the grid, like the full-width page it came from. */}
      <Example
        title="input-combobox-optional-props"
        description="Explicitly undefined optional props keep the defaults: an editable input, a combobox list in a portal, and the gutter and shift of both lists."
        wide
        code={`
          <Input />
          <Input render={<textarea />} />
          <Combobox>
            <ComboboxItem value="Alice" />
            <ComboboxItem value="Bob" />
          </Combobox>
          <ComboboxSelect items={[…]} />
        `}
      >
        <OptionalProps />
      </Example>

      <Example
        title="combobox-select-content"
        description="An undefined size keeps the badge size, a supplied store drives the select, and a numeric zero stays content in the button and in an item."
        code={`
          <ComboboxSelect badge />
          <ComboboxSelect badge />
          <ComboboxSelect badge $size="lg" />
          <ComboboxSelect items={[…]} />
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Unread messages</ComboboxSelectLabel>
            <ComboboxSelectButton>All</ComboboxSelectButton>
          </ComboboxSelectProvider>
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Open issues</ComboboxSelectLabel>
            <ComboboxSelectButton>0</ComboboxSelectButton>
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="no-issues">0</ComboboxSelectItem>
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        `}
      >
        <SelectContent />
      </Example>

      <Example
        title="combobox-select-content conditional content"
        description="False labels, icons and display values fall back or leave nothing behind, a zero icon stays, and explicit empty strings stay blank."
        code={`
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Status filter</ComboboxSelectLabel>
            <ComboboxSelectButton chevron={false} />
            <ComboboxSelectPopover>
              <ComboboxSelectItem value="Open" checkmark={false} />
              <ComboboxSelectItem value="Closed" checkmark={false} />
              <ComboboxSelectItem value="No activity" checkmark={false} />
              <ComboboxSelectItem value="Blank" checkmark={false} />
            </ComboboxSelectPopover>
            <ComboboxSelectButton chevron={false} />
            <ComboboxSelectButton chevron={false} />
            <ComboboxSelectButton chevron={false} />
          </ComboboxSelectProvider>
        `}
      >
        <ConditionalContent />
      </Example>

      <Example
        title="combobox-item-highlight"
        description="The highlighted row of the static combobox-group thumbnail paints like the active item of a real list on the same lifted canvas."
        code={`
          <ak.ComboboxProvider>
            <ak.ComboboxList>
              <ak.ComboboxItem>Reference highlight</ak.ComboboxItem>
              <ak.ComboboxItem>Reference rest</ak.ComboboxItem>
            </ak.ComboboxList>
          </ak.ComboboxProvider>
        `}
      >
        <ItemHighlight />
      </Example>
    </ExampleGrid>
  );
}
