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
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
  ComboboxSelectLabel,
  ComboboxSelectedValue,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import * as icons from "lucide-react";
import {
  Example,
  ExampleGrid,
  ExampleStage,
} from "#app/components/ariakit-ui-example.react.tsx";
import {
  StatusSelectExample,
  CountryComboboxExample,
  SearchableSelectExample,
  ScrollableSearchExample,
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
          <Combobox>
            <ComboboxItem value="Argentina" />
            <ComboboxItem value="Australia" />
            <ComboboxEmpty />
          </Combobox>
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
                  <kbd>⌘</kbd>
                  <kbd>N</kbd>
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
                  <kbd>⌘</kbd>
                  <kbd>N</kbd>
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
        description="The message in the list when the typed text matches no item."
        code={`
          <ComboboxProvider open>
            <ComboboxLabel>Ingredient</ComboboxLabel>
            <ComboboxInput />
            <ComboboxPopover>
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
              <ComboboxEmpty />
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Default select"
        description="A select that shows the chosen value. At rest it looks like a text field: sunk into the surface, with a border."
        code={`
          <ComboboxProvider defaultSelectedValue="Apple">
            <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxItem value="Apple" checkmark="before" />
              <ComboboxItem value="Banana" checkmark="before" />
              <ComboboxItem value="Cherry" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue="Apple">
            <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover unmountOnHide>
              <ComboboxItem value="Apple" checkmark="before" />
              <ComboboxItem value="Banana" checkmark="before" />
              <ComboboxItem value="Cherry" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Open select"
        description="The list below its button. A check marks the selected item, and a disabled item is dimmed."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Dessert</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Brownie" />
              <ComboboxItem checkmark="before" value="Cheesecake" />
              <ComboboxItem checkmark="before" value="Tiramisu" />
              <ComboboxItem checkmark="before" value="Sold-out macaron" disabled />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxProvider open defaultSelectedValue="Cheesecake">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Dessert</ComboboxSelectLabel>
              <ComboboxSelect />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxItem checkmark="before" value="Brownie" />
              <ComboboxItem checkmark="before" value="Cheesecake" />
              <ComboboxItem checkmark="before" value="Tiramisu" />
              <ComboboxItem
                checkmark="before"
                value="Sold-out macaron"
                disabled
              />
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="In a form"
        description="A select below a text input, with the same look and height. Its list is at least as wide as its button."
        code={`
          Full name
          <Input />
          <ComboboxProvider open>
            <ComboboxSelectLabel>Country</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Ireland" />
              <ComboboxItem checkmark="before" value="Portugal" />
              <ComboboxItem checkmark="before" value="United Kingdom" />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={76}>
          <div className="grid w-full content-start gap-4">
            <label className="grid gap-2">
              Full name
              <Input defaultValue="Ada Lovelace" />
            </label>
            <ComboboxProvider open defaultSelectedValue="United Kingdom">
              <div className="grid gap-2">
                <ComboboxSelectLabel>Country</ComboboxSelectLabel>
                <ComboboxSelect className="w-full" />
              </div>
              <ComboboxPopover {...openListProps}>
                <ComboboxItem checkmark="before" value="Ireland" />
                <ComboboxItem checkmark="before" value="Portugal" />
                <ComboboxItem checkmark="before" value="United Kingdom" />
              </ComboboxPopover>
            </ComboboxProvider>
          </div>
        </ExampleStage>
      </Example>

      <Example
        title="Rich items"
        description="Items with a label and a description. In the disabled item, the description dims with the label."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Plan</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Starter">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Starter</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
              <ComboboxItem checkmark="before" value="Team">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Team</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
              <ComboboxItem checkmark="before" value="Enterprise" disabled>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Enterprise</ComboboxItemLabel>
                  <ComboboxItemDescription>…</ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={70}>
          <ComboboxProvider open defaultSelectedValue="Team">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Plan</ComboboxSelectLabel>
              <ComboboxSelect />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxItem checkmark="before" value="Starter">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Starter</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    One project and community support
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
              <ComboboxItem checkmark="before" value="Team">
                <ComboboxItemContent>
                  <ComboboxItemLabel>Team</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    Unlimited projects and email support
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
              <ComboboxItem checkmark="before" value="Enterprise" disabled>
                <ComboboxItemContent>
                  <ComboboxItemLabel>Enterprise</ComboboxItemLabel>
                  <ComboboxItemDescription>
                    Contact sales to turn it on
                  </ComboboxItemDescription>
                </ComboboxItemContent>
              </ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Icons"
        description="An icon on the button and on each item, with the check after the label."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Framework</ComboboxSelectLabel>
            <ComboboxSelect icon={<Atom />} />
            <ComboboxPopover>
              <ComboboxItem value="React" icon={<Atom />} checkmark="after" />
              <ComboboxItem value="Solid" icon={<Hexagon />} checkmark="after" />
              <ComboboxItem value="Vue" icon={<Triangle />} checkmark="after" />
              <ComboboxItem value="Svelte" icon={<Flame />} checkmark="after" disabled />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxProvider open defaultSelectedValue="React">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Framework</ComboboxSelectLabel>
              <ComboboxSelect icon={<icons.Atom />} />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxItem
                value="React"
                icon={<icons.Atom />}
                checkmark="after"
              />
              <ComboboxItem
                value="Solid"
                icon={<icons.Hexagon />}
                checkmark="after"
              />
              <ComboboxItem
                value="Vue"
                icon={<icons.Triangle />}
                checkmark="after"
              />
              <ComboboxItem
                value="Svelte"
                icon={<icons.Flame />}
                checkmark="after"
                disabled
              />
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Bevel select"
        description="A raised select that looks like a push button."
        code={`
          <ComboboxSelect $kind="bevel" />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue="Medium">
            <ComboboxSelectLabel>Size</ComboboxSelectLabel>
            <ComboboxSelect $kind="bevel" />
            <ComboboxPopover>
              <ComboboxItem value="Small" checkmark="before" />
              <ComboboxItem value="Medium" checkmark="before" />
              <ComboboxItem value="Large" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Flat select"
        description="A see-through select for a toolbar that already owns the surface. It paints a background only on hover."
        code={`
          <ComboboxSelect $layer="transparent" />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue="Board">
            <ComboboxSelectLabel>View</ComboboxSelectLabel>
            <ComboboxSelect $layer="transparent" />
            <ComboboxPopover>
              <ComboboxItem value="Board" checkmark="before" />
              <ComboboxItem value="List" checkmark="before" />
              <ComboboxItem value="Timeline" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Chevron first"
        description="The chevron starts the row, and the icon moves after the value."
        code={`
          <ComboboxSelect chevron="before" icon={<Layers />} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue="Status">
            <ComboboxSelectLabel>Group by</ComboboxSelectLabel>
            <ComboboxSelect chevron="before" icon={<icons.Layers />} />
            <ComboboxPopover>
              <ComboboxItem value="Status" checkmark="before" />
              <ComboboxItem value="Owner" checkmark="before" />
              <ComboboxItem value="Priority" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Without chevron"
        description="A select with no chevron. A leading icon still shows that the control opens a list."
        code={`
          <ComboboxSelect chevron={false} icon={<ArrowUpDown />} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue="Newest">
            <ComboboxSelectLabel>Sort by</ComboboxSelectLabel>
            <ComboboxSelect chevron={false} icon={<icons.ArrowUpDown />} />
            <ComboboxPopover>
              <ComboboxItem value="Newest" checkmark="before" />
              <ComboboxItem value="Oldest" checkmark="before" />
              <ComboboxItem value="Name" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Placeholder"
        description="An empty value shows a prompt until the user picks an item. The prompt has the ink of a value, not of a placeholder."
        code={`
          <ComboboxSelect displayValue={<ComboboxSelectedValue fallback="Choose a region" />} />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider>
            <ComboboxSelectLabel>Shipping region</ComboboxSelectLabel>
            <ComboboxSelect
              displayValue={
                <ComboboxSelectedValue fallback="Choose a region" />
              }
            />
            <ComboboxPopover>
              <ComboboxItem value="Europe" checkmark="before" />
              <ComboboxItem value="North America" checkmark="before" />
              <ComboboxItem value="Asia" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Status select"
        description="The color of the select follows the selected status."
        code={`
          <ComboboxProvider>
            <ComboboxSelectLabel>Review status</ComboboxSelectLabel>
            <ComboboxSelect $layer="brand" />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Draft" />
              <ComboboxItem checkmark="before" value="In review" />
              <ComboboxItem checkmark="before" value="Published" />
              <ComboboxItem checkmark="before" value="Archived" />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <StatusSelectExample />
      </Example>

      <Example
        title="Disabled select"
        description="The value and the chevron are dimmed, the border is faint, and hover and press do nothing."
        code={`
          <ComboboxSelect disabled />
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue="Yearly">
            <ComboboxSelectLabel>Billing cycle</ComboboxSelectLabel>
            <ComboboxSelect disabled />
            <ComboboxPopover>
              <ComboboxItem value="Monthly" checkmark="before" />
              <ComboboxItem value="Yearly" checkmark="before" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Multiple selection"
        description="An array value keeps more than one item. Each selected item has a check, and the button lists the selected values."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Toppings</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Cheese" />
              <ComboboxItem checkmark="before" value="Olives" />
              <ComboboxItem checkmark="before" value="Mushrooms" />
              <ComboboxItem checkmark="before" value="Peppers" />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <ComboboxProvider open defaultSelectedValue={["Cheese", "Olives"]}>
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Toppings</ComboboxSelectLabel>
              <ComboboxSelect />
            </div>
            <ComboboxPopover {...openListProps}>
              <ComboboxItem checkmark="before" value="Cheese" />
              <ComboboxItem checkmark="before" value="Olives" />
              <ComboboxItem checkmark="before" value="Mushrooms" />
              <ComboboxItem checkmark="before" value="Peppers" />
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Selection count"
        description="A render function in ComboboxSelectedValue changes the text on the button, here to the number of selected items."
        code={`
          <ComboboxProvider>
            <ComboboxSelectLabel>Issue labels</ComboboxSelectLabel>
            <ComboboxSelect displayValue={<ComboboxSelectedValue />} />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Bug" />
              <ComboboxItem checkmark="before" value="Docs" />
              <ComboboxItem checkmark="before" value="Feature" />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <div className="flex flex-col items-start gap-2">
          <ComboboxProvider defaultSelectedValue={["Bug", "Docs"]}>
            <ComboboxSelectLabel>Issue labels</ComboboxSelectLabel>
            <ComboboxSelect
              displayValue={
                <ComboboxSelectedValue>
                  {selectedCountLabel}
                </ComboboxSelectedValue>
              }
            />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="Bug" />
              <ComboboxItem checkmark="before" value="Docs" />
              <ComboboxItem checkmark="before" value="Feature" />
            </ComboboxPopover>
          </ComboboxProvider>
        </div>
      </Example>

      <Example
        title="Searchable select"
        description="A search field above the items filters the list. A ComboboxList keeps the items in a listbox of their own, apart from the field."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Timezone</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxInput />
              <ComboboxList>
                <ComboboxItem checkmark="before" value="UTC" />
                <ComboboxItem checkmark="before" value="Europe/London" />
              </ComboboxList>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <SearchableSelectExample />
      </Example>

      <Example
        title="Scrollable search"
        description="The list scrolls below the search field. The field stays visible while you move through the countries."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Shipping country</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxInput />
              <ComboboxList>
                <ComboboxItem value="Argentina" checkmark="before" />
                <ComboboxItem value="Australia" checkmark="before" />
              </ComboboxList>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ScrollableSearchExample />
      </Example>

      <Example
        title="Long list"
        description="A list taller than the height limit of the popover scrolls inside it. It has an item for every hour."
        code={`
          <ComboboxProvider open>
            <ComboboxSelectLabel>Start time</ComboboxSelectLabel>
            <ComboboxSelect />
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="00:00" />
              <ComboboxItem checkmark="before" value="01:00" />
              <ComboboxItem checkmark="before" value="02:00" />
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <ExampleStage anchor="start" height={104}>
          <ComboboxProvider open defaultSelectedValue="02:00">
            <div className="flex w-full flex-col items-start gap-2">
              <ComboboxSelectLabel>Start time</ComboboxSelectLabel>
              <ComboboxSelect />
            </div>
            <ComboboxPopover {...openListProps}>
              {startTimes.map((time) => (
                <ComboboxItem checkmark="before" key={time} value={time} />
              ))}
            </ComboboxPopover>
          </ComboboxProvider>
        </ExampleStage>
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
          <ComboboxSelect />
        `}
      >
        <OptionalProps />
      </Example>

      <Example
        title="combobox-select-content"
        description="An undefined size keeps the default size, a supplied store drives the select, and a numeric zero stays content in the button and in an item."
        code={`
          <ComboboxSelect />
          <ComboboxSelect />
          <ComboboxSelect $size="lg" />
          <ComboboxSelect />
          <ComboboxProvider>
            <ComboboxSelectLabel>Unread messages</ComboboxSelectLabel>
            <ComboboxSelect>All</ComboboxSelect>
          </ComboboxProvider>
          <ComboboxProvider>
            <ComboboxSelectLabel>Open issues</ComboboxSelectLabel>
            <ComboboxSelect>0</ComboboxSelect>
            <ComboboxPopover>
              <ComboboxItem checkmark="before" value="no-issues">0</ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        `}
      >
        <SelectContent />
      </Example>

      <Example
        title="combobox-select-content conditional content"
        description="False labels, icons and display values fall back or leave nothing behind, a zero icon stays, and explicit empty strings stay blank."
        code={`
          <ComboboxProvider>
            <ComboboxSelectLabel>Status filter</ComboboxSelectLabel>
            <ComboboxSelect chevron={false} />
            <ComboboxPopover>
              <ComboboxItem value="Open" checkmark={false} />
              <ComboboxItem value="Closed" checkmark={false} />
              <ComboboxItem value="No activity" checkmark={false} />
              <ComboboxItem value="Blank" checkmark={false} />
            </ComboboxPopover>
            <ComboboxSelect chevron={false} />
            <ComboboxSelect chevron={false} />
            <ComboboxSelect chevron={false} />
          </ComboboxProvider>
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
