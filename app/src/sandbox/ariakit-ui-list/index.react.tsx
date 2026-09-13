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
import {
  DisclosureButtonLabel,
  DisclosureButtonSlot,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import type { DisclosureButtonLabelProps } from "@ariakit/ui/components/disclosure.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListDisclosureContent,
  ListItem,
  ListItemMarker,
} from "@ariakit/ui/components/list.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

function CustomLabel(props: DisclosureButtonLabelProps) {
  return <DisclosureButtonLabel {...props} />;
}

// Migrated from the list-disclosure-optional-button sandbox with the same
// props, markup and initial state.
function ListDisclosureOptionalButton() {
  const [headings, setHeadings] = useState(false);
  // A hidden heading supplies false; zero must still render a button label.
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show task headings
      </label>
      <List ordered>
        <li>
          <ListDisclosure button={headings && "Project tasks"}>
            Review assigned issues
          </ListDisclosure>
        </li>
        <li>
          <ListDisclosure button={0}>No pending tasks</ListDisclosure>
        </li>
      </List>
    </div>
  );
}

// Every link row composes the same button. The class keeps the row's own
// layout: full width, text from the start, wrapping, and the list's font.
const linkRowClassName = "w-full justify-start font-normal text-wrap";

interface StatusMarkerProps {
  label?: string;
  description?: string;
}

// Passes its optional label and description on as is, so each marker gets an
// ARIA prop that is present but undefined.
function StatusMarker({ label, description }: StatusMarkerProps) {
  return (
    <span className="grid gap-2">
      <span className="flex items-center gap-2">
        <span className="relative inline-block size-[1lh]">
          <ListItemMarker checked aria-label={label} />
        </span>
        Approved
      </span>
      <span className="flex items-center gap-2">
        <span className="relative inline-block size-[1lh]">
          <ListItemMarker progress={0.5} aria-description={description} />
        </span>
        In review
      </span>
    </span>
  );
}

export default function ListExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="An unordered list draws a dash beside each row. A row that wraps keeps its text clear of the marker column."
        stretch
        code={`
          <List>
            <ListItem>Pack the charger</ListItem>
            <ListItem>…</ListItem>
            <ListItem>Water the plants</ListItem>
          </List>
        `}
      >
        <List>
          <ListItem>Pack the charger</ListItem>
          <ListItem>
            Print the boarding pass and the hotel booking, and put both in the
            front pocket of the bag
          </ListItem>
          <ListItem>Water the plants</ListItem>
        </List>
      </Example>

      <Example
        title="Ordered rows"
        description="Inline rows get a numbered chip from the list counter and draw no guide."
        stretch
        code={`
          <List ordered>
            <ListItem>Preheat the oven</ListItem>
            <ListItem>Mix the dry ingredients</ListItem>
            <ListItem>Fold in the butter</ListItem>
          </List>
        `}
      >
        <List ordered>
          <ListItem>Preheat the oven</ListItem>
          <ListItem>Mix the dry ingredients</ListItem>
          <ListItem>Fold in the butter</ListItem>
        </List>
      </Example>

      <Example
        title="Bulleted rows"
        description="A small disc in the color of the dash."
        stretch
        code={`
          <List $marker="bullet">
            <ListItem>Keyboard shortcuts</ListItem>
            <ListItem>Screen reader support</ListItem>
            <ListItem>Right-to-left layouts</ListItem>
          </List>
        `}
      >
        <List $marker="bullet">
          <ListItem>Keyboard shortcuts</ListItem>
          <ListItem>Screen reader support</ListItem>
          <ListItem>Right-to-left layouts</ListItem>
        </List>
      </Example>

      <Example
        title="Unordered blocks"
        description="Paragraph children switch the list to blocks mode, with a larger gap and row padding. Dashes draw no guide."
        stretch
        code={`
          <List>
            <ListItem>
              Free shipping
              …
            </ListItem>
            <ListItem>
              Easy returns
              …
            </ListItem>
          </List>
        `}
      >
        <List>
          <ListItem>
            <p>
              <strong>Free shipping</strong>
            </p>
            <p>Orders over 50 dollars ship for free within the country.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Easy returns</strong>
            </p>
            <p>Send any item back within 30 days of delivery.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Ordered steps"
        description="Ordered blocks draw a guide between the chips. The last segment fades out."
        stretch
        code={`
          <List ordered>
            <ListItem>
              Install the package
              …
            </ListItem>
            <ListItem>
              Import the styles
              …
            </ListItem>
            <ListItem>
              Render a component
              …
            </ListItem>
          </List>
        `}
      >
        <List ordered>
          <ListItem>
            <p>
              <strong>Install the package</strong>
            </p>
            <p>Add it to the dependencies of the app.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Import the styles</strong>
            </p>
            <p>Load the stylesheet once, at the root of the app.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Render a component</strong>
            </p>
            <p>Start with a button and check it in both themes.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Steps without a guide"
        description="Turning the guide off keeps the blocks rhythm."
        stretch
        code={`
          <List ordered $guide={false}>
            <ListItem>
              Choose a plan
              …
            </ListItem>
            <ListItem>
              Invite your team
              …
            </ListItem>
          </List>
        `}
      >
        <List ordered $guide={false}>
          <ListItem>
            <p>
              <strong>Choose a plan</strong>
            </p>
            <p>Every plan starts with a free month.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Invite your team</strong>
            </p>
            <p>Add people by email or share a link.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Sections"
        description="A heading child switches the list to sections mode, which takes priority over blocks mode."
        stretch
        code={`
          <List>
            <ListItem>
              <Heading>Account</Heading>
              …
            </ListItem>
            <ListItem>
              <Heading>Notifications</Heading>
              …
            </ListItem>
          </List>
        `}
      >
        <List>
          <ListItem>
            <Heading>Account</Heading>
            <p>Change the name, the email address and the password.</p>
          </ListItem>
          <ListItem>
            <Heading>Notifications</Heading>
            <p>Pick which updates arrive by email.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Deep sections"
        description="A list deep in the outline, with h5 headings, still switches to sections mode."
        stretch
        code={`
          <HeadingLevel level={5}>
            <List>
              <ListItem>
                <Heading>Two-factor sign-in</Heading>
                …
              </ListItem>
              <ListItem>
                <Heading>Recovery codes</Heading>
                …
              </ListItem>
            </List>
          </HeadingLevel>
        `}
      >
        <HeadingLevel level={5}>
          <List>
            <ListItem>
              <Heading>Two-factor sign-in</Heading>
              <p>Ask for a code from an app after the password.</p>
            </ListItem>
            <ListItem>
              <Heading>Recovery codes</Heading>
              <p>Keep them somewhere safe to sign in without the app.</p>
            </ListItem>
          </List>
        </HeadingLevel>
      </Example>

      <Example
        title="Nested list"
        description="A nested list halves its gap and resets the marker kind. The outer counter continues after it."
        stretch
        code={`
          <List ordered>
            <ListItem>
              Set up the project
              <List>
                <ListItem>Create the repository</ListItem>
                <ListItem>Add a license</ListItem>
              </List>
            </ListItem>
            <ListItem>Write the first test</ListItem>
          </List>
        `}
      >
        <List ordered>
          <ListItem>
            Set up the project
            <List>
              <ListItem>Create the repository</ListItem>
              <ListItem>Add a license</ListItem>
            </List>
          </ListItem>
          <ListItem>Write the first test</ListItem>
        </List>
      </Example>

      <Example
        title="Nested steps"
        description="A nested ordered list draws its own guide. The outer segment continues past it, and only the last nested row fades out."
        stretch
        code={`
          <List ordered>
            <ListItem>
              Prepare the release
              <List ordered>
                <ListItem>
                  Update the changelog
                </ListItem>
                <ListItem>
                  Bump the version
                </ListItem>
              </List>
            </ListItem>
            <ListItem>
              Publish the package
            </ListItem>
          </List>
        `}
      >
        <List ordered>
          <ListItem>
            <p>
              <strong>Prepare the release</strong>
            </p>
            <List ordered>
              <ListItem>
                <p>Update the changelog</p>
              </ListItem>
              <ListItem>
                <p>Bump the version</p>
              </ListItem>
            </List>
          </ListItem>
          <ListItem>
            <p>Publish the package</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Track"
        description="A guide on an unordered list turns the markers into bullets. The halo keeps the guide one gap away from the check slot."
        stretch
        code={`
          <List $guide>
            <ListItem>
              Order placed
              …
            </ListItem>
            <ListItem>
              Shipped
              …
            </ListItem>
            <ListItem checked>
              Delivered
              …
            </ListItem>
          </List>
        `}
      >
        <List $guide>
          <ListItem>
            <p>
              <strong>Order placed</strong>
            </p>
            <p>We sent a confirmation email.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Shipped</strong>
            </p>
            <p>The parcel left the warehouse.</p>
          </ListItem>
          <ListItem checked>
            <p>
              <strong>Delivered</strong>
            </p>
            <p>Signed for at the front door.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Timeline"
        description="A guide on inline rows. The gap sets the length of each segment."
        stretch
        code={`
          <List $guide $gap={6}>
            <ListItem>9:00 Doors open</ListItem>
            <ListItem>10:00 Opening talk</ListItem>
            <ListItem>12:30 Lunch</ListItem>
          </List>
        `}
      >
        <List $guide $gap={6}>
          <ListItem>9:00 Doors open</ListItem>
          <ListItem>10:00 Opening talk</ListItem>
          <ListItem>12:30 Lunch</ListItem>
        </List>
      </Example>

      <Example
        title="Checklist"
        description="Check slots replace the dash, and a progress arc goes around a slot that is not done yet."
        stretch
        code={`
          <List>
            <ListItem checked>Book the venue</ListItem>
            <ListItem checked>Send the invitations</ListItem>
            <ListItem progress={0.65}>Collect the replies</ListItem>
            <ListItem checked={false}>Order the catering</ListItem>
          </List>
        `}
      >
        <List>
          <ListItem checked>Book the venue</ListItem>
          <ListItem checked>Send the invitations</ListItem>
          <ListItem progress={0.65}>Collect the replies</ListItem>
          <ListItem checked={false}>Order the catering</ListItem>
        </List>
      </Example>

      <Example
        title="Step cards"
        description="Rows are frames that paint their own surface and border, and the guide crosses the borders. The arc goes around the number of an open step."
        stretch
        code={`
          <List ordered $gap={6}>
            <ListItem $layer $border $rounded="xl" $p={3} checked>
              Create an account
              Done on Monday.
            </ListItem>
            <ListItem $layer $border $rounded="xl" $p={3} progress={0.75}>
              Verify the email address
              …
            </ListItem>
            <ListItem $layer $border $rounded="xl" $p={3} checked={false}>
              Add a payment method
              Not started.
            </ListItem>
          </List>
        `}
      >
        <List ordered $gap={6}>
          <ListItem $layer $border $rounded="xl" $p={3} checked>
            <p>
              <strong>Create an account</strong>
            </p>
            <p>Done on Monday.</p>
          </ListItem>
          <ListItem $layer $border $rounded="xl" $p={3} progress={0.75}>
            <p>
              <strong>Verify the email address</strong>
            </p>
            <p>Waiting for the confirmation link.</p>
          </ListItem>
          <ListItem $layer $border $rounded="xl" $p={3} checked={false}>
            <p>
              <strong>Add a payment method</strong>
            </p>
            <p>Not started.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Link rows"
        description="A row rendered as a button link keeps its marker and gutter, and the button adds hover, press and focus states."
        stretch
        code={`
          <List $gap={0} $itemPadding={1}>
            <ListItem checked render={<Button render={<a />} $p="var(--list-item-padding)" $rounded="xl" $lightnessOffset={false} />}>…</ListItem>
            <ListItem progress={0.5} render={<Button render={<a />} $p="var(--list-item-padding)" $rounded="xl" $lightnessOffset={false} />}>…</ListItem>
            <ListItem checked={false} render={<Button render={<a />} $p="var(--list-item-padding)" $rounded="xl" $lightnessOffset={false} />}>Lesson 3: Forms</ListItem>
          </List>
        `}
      >
        <List $gap={0} $itemPadding={1}>
          <li>
            <ListItem
              checked
              render={
                <Button
                  render={<a href="#lesson-1" />}
                  $p="var(--list-item-padding)"
                  $rounded="xl"
                  $lightnessOffset={false}
                  className={linkRowClassName}
                />
              }
            >
              Lesson 1: Getting started
            </ListItem>
          </li>
          <li>
            <ListItem
              progress={0.5}
              render={
                <Button
                  render={<a href="#lesson-2" />}
                  $p="var(--list-item-padding)"
                  $rounded="xl"
                  $lightnessOffset={false}
                  className={linkRowClassName}
                />
              }
            >
              Lesson 2: Layers and surfaces
            </ListItem>
          </li>
          <li>
            <ListItem
              checked={false}
              render={
                <Button
                  render={<a href="#lesson-3" />}
                  $p="var(--list-item-padding)"
                  $rounded="xl"
                  $lightnessOffset={false}
                  className={linkRowClassName}
                />
              }
            >
              Lesson 3: Forms
            </ListItem>
          </li>
        </List>
      </Example>

      <Example
        title="Disclosure steps"
        description="The guide belongs to the disclosure root, so it runs behind the open content and reaches the next row. A description goes under each step label."
        stretch
        code={`
          <List ordered>
            <ListDisclosure defaultOpen button={<ListDisclosureButton checked description="Done on Monday">Connect the repository</ListDisclosureButton>}>
              …
            </ListDisclosure>
            <ListDisclosure button={<ListDisclosureButton progress={0.75} description="Due Friday">Configure the domain</ListDisclosureButton>}>
              …
            </ListDisclosure>
            <ListDisclosure button={<ListDisclosureButton description="Not started">Invite the team</ListDisclosureButton>}>
              …
            </ListDisclosure>
            <ListItem>
              Go live.
            </ListItem>
          </List>
        `}
      >
        <List ordered>
          <li>
            <ListDisclosure
              defaultOpen
              button={
                <ListDisclosureButton checked description="Done on Monday">
                  Connect the repository
                </ListDisclosureButton>
              }
            >
              <p>The app builds every push to the main branch.</p>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure
              button={
                <ListDisclosureButton progress={0.75} description="Due Friday">
                  Configure the domain
                </ListDisclosureButton>
              }
            >
              <p>Point the DNS records at the app.</p>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure
              button={
                <ListDisclosureButton description="Not started">
                  Invite the team
                </ListDisclosureButton>
              }
            >
              <p>Everyone gets an email with a sign-in link.</p>
            </ListDisclosure>
          </li>
          <ListItem>
            <p>Go live.</p>
          </ListItem>
        </List>
      </Example>

      <Example
        title="Disclosure badges"
        description="An explicit label keeps its badge beside the text, with or without a description."
        code={`
          <ListDisclosureButton label="Team tasks" description="All tasks in this workspace">
            <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
          </ListDisclosureButton>
        `}
      >
        <List ordered>
          <li>
            <ListDisclosure defaultOpen>
              <ListDisclosureButton label="Project tasks">
                <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
              </ListDisclosureButton>
              <ListDisclosureContent>
                <p>Manage project tasks</p>
              </ListDisclosureContent>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure defaultOpen>
              <ListDisclosureButton
                label={
                  <CustomLabel id="list-tasks-label">Team tasks</CustomLabel>
                }
                description="All tasks in this workspace"
              >
                <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
              </ListDisclosureButton>
              <ListDisclosureContent>
                <p>Manage team tasks</p>
              </ListDisclosureContent>
            </ListDisclosure>
          </li>
        </List>
      </Example>

      <Example
        title="Release notes"
        description="Disclosure rows in an unordered list draw no guide, so the open content starts under the dash, not at the label."
        stretch
        code={`
          <List>
            <ListDisclosure defaultOpen button="Version 2.1">
              …
            </ListDisclosure>
            <ListDisclosure button="Version 2.0">
              …
            </ListDisclosure>
            <ListDisclosure button="Version 1.9">
              …
            </ListDisclosure>
          </List>
        `}
      >
        <List>
          <li>
            <ListDisclosure defaultOpen button="Version 2.1">
              <p>Tables can pin a column to either edge.</p>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure button="Version 2.0">
              <p>Every component reads the new color layers.</p>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure button="Version 1.9">
              <p>Lists can show progress on each row.</p>
            </ListDisclosure>
          </li>
        </List>
      </Example>

      <Example
        title="Inside prose"
        description="A list inside Prose uses the prose gap, so the rhythm around it stays the same."
        stretch
        code={`
          <Prose>
            …
            <List>
              <ListItem>A two-person tent</ListItem>
              <ListItem>Two sleeping bags</ListItem>
            </List>
            …
          </Prose>
        `}
      >
        <Prose>
          <p>The kit has everything for a weekend in the mountains.</p>
          <List>
            <ListItem>A two-person tent</ListItem>
            <ListItem>Two sleeping bags</ListItem>
          </List>
          <p>Book it at least a week ahead.</p>
        </Prose>
      </Example>

      <Example
        title="Dense rows"
        description="The gap and the item padding set the spacing."
        stretch
        code={`
          <List $gap={1} $itemPadding={0}>
            <ListItem>Milk</ListItem>
            <ListItem>Eggs</ListItem>
            <ListItem>Bread</ListItem>
          </List>
        `}
      >
        <List $gap={1} $itemPadding={0}>
          <ListItem>Milk</ListItem>
          <ListItem>Eggs</ListItem>
          <ListItem>Bread</ListItem>
        </List>
      </Example>

      <Example
        title="Large text"
        description="With text-lg on the list, the marker and the gutter scale with the font size and the line height."
        stretch
        code={`
          <List ordered>
            <ListItem>Open the settings</ListItem>
            <ListItem>…</ListItem>
          </List>
        `}
      >
        <List ordered className="text-lg">
          <ListItem>Open the settings</ListItem>
          <ListItem>Choose a larger text size</ListItem>
        </List>
      </Example>

      <Example
        title="Checklist on a brand layer"
        description="Completed markers, arcs and empty slots take their colors from a saturated brand surface."
        stretch
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <List>
              <ListItem checked>Draft the proposal</ListItem>
              <ListItem progress={0.5}>Review the budget</ListItem>
              <ListItem checked={false}>Send it to the client</ListItem>
            </List>
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4}>
          <List>
            <ListItem checked>Draft the proposal</ListItem>
            <ListItem progress={0.5}>Review the budget</ListItem>
            <ListItem checked={false}>Send it to the client</ListItem>
          </List>
        </Frame>
      </Example>

      <Example
        title="Status legend"
        description="A marker used outside a list, as a status icon in a positioned box one line tall."
        code={`
          <ListItemMarker checked />
          Done
          <ListItemMarker progress={0.7} />
          In progress
          <ListItemMarker checked={false} />
          To do
        `}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2">
            <span className="relative inline-block size-[1lh]">
              <ListItemMarker checked />
            </span>
            Done
          </span>
          <span className="flex items-center gap-2">
            <span className="relative inline-block size-[1lh]">
              <ListItemMarker progress={0.7} />
            </span>
            In progress
          </span>
          <span className="flex items-center gap-2">
            <span className="relative inline-block size-[1lh]">
              <ListItemMarker checked={false} />
            </span>
            To do
          </span>
        </div>
      </Example>

      <Example
        title="Right to left steps"
        description="In a right-to-left context, the marker column, the guide and the text inset move to the other edge."
        stretch
        code={`
          <div dir="rtl">
            <List ordered>
              <ListItem>
                تثبيت الحزمة
                …
              </ListItem>
              <ListItem>
                إعداد الأنماط
                …
              </ListItem>
              <ListItem checked>
                مراجعة المعرض
                …
              </ListItem>
            </List>
          </div>
        `}
      >
        <div dir="rtl" lang="ar">
          <List ordered>
            <ListItem>
              <p>
                <strong>تثبيت الحزمة</strong>
              </p>
              <p>يبدأ النص بعد عمود العلامة من جهة اليمين.</p>
            </ListItem>
            <ListItem>
              <p>
                <strong>إعداد الأنماط</strong>
              </p>
              <p>يمر الدليل تحت الأرقام في المنتصف.</p>
            </ListItem>
            <ListItem checked>
              <p>
                <strong>مراجعة المعرض</strong>
              </p>
              <p>يتلاشى المقطع الأخير داخل صفه.</p>
            </ListItem>
          </List>
        </div>
      </Example>

      {/*
        Regression fixtures: List scenarios migrated from the
        list-disclosure-optional-button and list-item-marker-checked sandboxes.
      */}
      <Example
        title="list-disclosure-optional-button"
        description="A button shorthand of false renders the content with no button, and a button of 0 still renders a button labeled 0."
        code={`
          <List ordered>
            <ListDisclosure button={false}>Review assigned issues</ListDisclosure>
            <ListDisclosure button={0}>No pending tasks</ListDisclosure>
          </List>
        `}
      >
        <ListDisclosureOptionalButton />
      </Example>

      <Example
        title="list-item-marker-checked"
        description="A progress of 1 completes the marker by default, and an explicit checked value overrides a conflicting progress in both directions."
        code={`
          <List>
            <ListItem progress={1}>Ready for review</ListItem>
          </List>
          <List>
            <ListItem progress={1} checked={false}>Awaiting approval</ListItem>
          </List>
          <List>
            <ListItem progress={0.5} checked>Approved early</ListItem>
          </List>
        `}
      >
        {/*
         * Explicit checked values must override the conflicting progress
         * values.
         */}
        <div className="grid gap-4">
          <List aria-label="Completed progress">
            <ListItem progress={1}>Ready for review</ListItem>
          </List>
          <List aria-label="Explicit unchecked state">
            <ListItem progress={1} checked={false}>
              Awaiting approval
            </ListItem>
          </List>
          <List aria-label="Explicit checked state">
            <ListItem progress={0.5} checked>
              Approved early
            </ListItem>
          </List>
        </div>
      </Example>

      <Example
        title="Raw marker edge"
        description="A raw edge paints the ring of an empty slot in the exact edge color, not at the slot's lighter weight."
        code={`
          <ListItemMarker checked={false} $edge="brand" $edgeRaw />
          Review pending
        `}
      >
        <span className="flex items-center gap-2">
          <span className="relative inline-block size-[1lh]">
            <ListItemMarker checked={false} $edge="brand" $edgeRaw />
          </span>
          Review pending
        </span>
      </Example>

      <Example
        title="Markers with optional props"
        description="A wrapper passes its optional label and description on to the markers. Without them, each marker keeps its own name and description."
        code={`
          <ListItemMarker checked aria-label={label} />
          <ListItemMarker progress={0.5} aria-description={description} />
        `}
      >
        <StatusMarker />
      </Example>
    </ExampleGrid>
  );
}
