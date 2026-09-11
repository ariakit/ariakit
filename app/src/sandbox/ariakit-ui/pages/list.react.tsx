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
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListItem,
  ListItemMarker,
} from "@ariakit/ui/components/list.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";

// Every link row composes the same button. The class keeps the row's own
// layout: full width, text from the start, wrapping, and the list's font.
const linkRowClassName = "w-full justify-start font-normal text-wrap";

export function ListExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="An unordered list draws a dash beside each row. A row that wraps keeps its text clear of the marker column."
        stretch
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
      >
        <List $gap={0} $itemPadding={1}>
          <li>
            <ListItem
              checked
              render={
                <Button
                  render={<a href="#lesson-1" {...screenshotFocus} />}
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
        title="Release notes"
        description="Disclosure rows in an unordered list draw no guide, so the open content starts under the dash, not at the label."
        stretch
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
    </ExampleGrid>
  );
}

export default ListExamples;
