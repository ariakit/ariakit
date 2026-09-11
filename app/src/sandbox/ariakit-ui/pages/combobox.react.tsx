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
  Combobox,
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
  screenshotFocus,
} from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";
import {
  BadgeSelectExample,
  CountryComboboxExample,
  SearchableSelectExample,
  countries,
  openListProps,
  reviewStatuses,
  timezones,
} from "./combobox-examples.react.tsx";

const startTimes = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

function selectedCountLabel(value: string | readonly string[]) {
  if (typeof value === "string") return value;
  return `${value.length} labels`;
}

export function ComboboxExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Type to filter the countries. The first match completes inline, and a message shows when nothing matches."
        code={
          <Combobox>
            {countries.slice(0, 2).map((country) => (
              <ComboboxItem key={country} value={country} />
            ))}
            <ComboboxEmpty />
          </Combobox>
        }
      >
        <CountryComboboxExample />
      </Example>

      <Example
        title="Open suggestions"
        description="The list below its input, as wide as the input. The active item is highlighted, and a disabled item is dimmed."
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
        description="The message in the list when the typed text matches no item."
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
            {...screenshotFocus}
          />
        </div>
      </Example>

      <Example
        title="Open select"
        description="The list below its button. A check marks the selected item, and a disabled item is dimmed."
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
        description="An empty value shows a prompt until the user picks an item. The prompt has the ink of a value, not of a placeholder."
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
            displayValue={<ComboboxSelectValue fallback="Choose a region" />}
          />
        </div>
      </Example>

      <Example
        title="Badge select"
        description="A select that looks like a status badge. Its color follows the selected status."
        code={
          <ComboboxSelectProvider>
            <ComboboxSelectLabel>Review status</ComboboxSelectLabel>
            <ComboboxSelectButton badge $layer="brand" />
            <ComboboxSelectPopover>
              {reviewStatuses.map((status) => (
                <ComboboxSelectItem key={status.value} value={status.value} />
              ))}
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        }
      >
        <BadgeSelectExample />
      </Example>

      <Example
        title="Disabled select"
        description="The value and the chevron are dimmed, the border is faint, and hover and press do nothing."
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
        code={
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Timezone</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              <ComboboxInput />
              <ak.ComboboxList>
                {timezones.slice(0, 2).map((zone) => (
                  <ComboboxSelectItem key={zone} value={zone} />
                ))}
              </ak.ComboboxList>
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        }
      >
        <SearchableSelectExample />
      </Example>

      <Example
        title="Long list"
        description="A list taller than the height limit of the popover scrolls inside it. It has an item for every hour."
        code={
          <ComboboxSelectProvider open>
            <ComboboxSelectLabel>Start time</ComboboxSelectLabel>
            <ComboboxSelectButton />
            <ComboboxSelectPopover>
              {startTimes.slice(0, 3).map((time) => (
                <ComboboxSelectItem key={time} value={time} />
              ))}
            </ComboboxSelectPopover>
          </ComboboxSelectProvider>
        }
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
    </ExampleGrid>
  );
}

export default createGalleryPage("combobox", ComboboxExamples);
