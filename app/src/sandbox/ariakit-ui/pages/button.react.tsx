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
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSeparator,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FolderOpen,
  Plus,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import { Example, ExampleGrid, screenshotFocus } from "../example.react.tsx";

// A local image, so the screenshots never wait on the network.
const avatarImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f59e0b'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23fff7ed'/%3E%3Cpath d='M6 40c2-9 7-13 14-13s12 4 14 13z' fill='%23fff7ed'/%3E%3C/svg%3E";

export function ButtonExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The button is see-through at rest and shows the surface behind it. It paints only on hover and press."
      >
        <Button {...screenshotFocus}>Cancel</Button>
      </Example>

      <Example
        title="Lifted"
        description="A neutral surface that stays visible at rest, for a button that stands alone."
      >
        <Button $lightnessOffset>Edit</Button>
      </Example>

      <Example
        title="Brand"
        description="The primary action. The color paints the button at rest, and the text stays readable on it."
      >
        <Button $layer="brand">Save changes</Button>
      </Example>

      <Example
        title="Danger"
        description="A destructive action. The text turns dark or light, as the color of each theme needs."
      >
        <Button $layer="danger">Delete</Button>
      </Example>

      <Example
        title="Custom color"
        description="Any CSS color paints the button through the same path as a named color."
      >
        <Button $layer="#635bff">Connect account</Button>
      </Example>

      <Example
        title="Inverted"
        description="A neutral surface with high contrast: dark on a light surface, and light on a dark one."
      >
        <Button $invert>Continue</Button>
      </Example>

      <Example
        title="Bevel"
        description="A raised push button with a gradient and an inner shadow."
      >
        <Button $kind="bevel">Duplicate</Button>
      </Example>

      <Example
        title="Danger bevel"
        description="A bevel on a color of its own paints the same color and text as the flat button, with the gradient on top."
      >
        <Button $kind="bevel" $layer="danger">
          Delete project
        </Button>
      </Example>

      <Example
        title="Submit"
        description="A submit button shows the pointer cursor, which a command button does not."
      >
        <form
          onSubmit={(event) => {
            // The sandbox has nowhere to send the form.
            event.preventDefault();
          }}
        >
          <Button type="submit" $kind="bevel" $layer="brand">
            Create account
          </Button>
        </form>
      </Example>

      <Example
        title="Extra small"
        description="The padding, the gap and the slot size all come from the font size."
      >
        <Button $kind="bevel" $size="xs">
          <ButtonSlot>
            <Plus />
          </ButtonSlot>
          <ButtonLabel>Add filter</ButtonLabel>
        </Button>
      </Example>

      <Example
        title="Extra large"
        description="A larger font scales the whole button, the trailing icon included."
      >
        <Button $kind="bevel" $size="xl">
          <ButtonLabel>Get started</ButtonLabel>
          <ButtonSlot className="rtl:-scale-x-100">
            <ArrowRight />
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Pill"
        description="A full radius with more side padding, so the text keeps its distance from the round ends."
      >
        <Button $kind="bevel" $rounded="full" $px="lg">
          Follow
        </Button>
      </Example>

      <Example
        title="Icon only"
        description="A single icon slot makes the button square. Its label is for assistive technology."
      >
        <Button aria-label="Settings" $lightnessOffset>
          <ButtonSlot>
            <Settings />
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="As a link"
        description="An anchor that looks like a button. It shows the pointer cursor, because it navigates."
      >
        <Button render={<a href="#docs" />}>
          <ButtonLabel>Documentation</ButtonLabel>
          <ButtonSlot>
            <ArrowUpRight />
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Small slot"
        description="A slot smaller than the text. The label moves closer to it, so the gap looks even."
      >
        <Button $lightnessOffset>
          <ButtonLabel>Sort by</ButtonLabel>
          <ButtonSlot $size="sm">
            <ChevronDown />
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Large slot"
        description="A slot taller than the line grows into the padding, and the label moves away from it."
      >
        <Button $lightnessOffset>
          <ButtonSlot $size="2xl">
            <FolderOpen />
          </ButtonSlot>
          <ButtonLabel>Open folder</ButtonLabel>
        </Button>
      </Example>

      <Example
        title="Close slot gap"
        description="The slot sits closer to the text than its size alone puts it."
      >
        <Button $lightnessOffset>
          <ButtonLabel>Filter</ButtonLabel>
          <ButtonSlot $mx="closeGap">
            <ChevronDown />
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Painted icon slot"
        description="An icon slot with a color of its own paints a tile, and the icon sits inside it."
      >
        <Button $lightnessOffset>
          <ButtonSlot $size="xl" $layer="brand" $mix={20}>
            <Share2 />
          </ButtonSlot>
          <ButtonLabel>Share</ButtonLabel>
        </Button>
      </Example>

      <Example
        title="Initial avatar"
        description="A round avatar slot that paints its own surface behind an initial."
      >
        <Button>
          <ButtonSlot $kind="avatar" $layer="brand">
            J
          </ButtonSlot>
          <ButtonLabel>Jane Doe</ButtonLabel>
        </Button>
      </Example>

      <Example
        title="Image avatar"
        description="An image avatar fills a slot that reaches the edge of a round button."
      >
        <Button $kind="bevel" $rounded="full">
          <ButtonSlot $kind="avatar" $size="full">
            <img alt="" src={avatarImage} className="size-full" />
          </ButtonSlot>
          <ButtonLabel>Ariakit</ButtonLabel>
        </Button>
      </Example>

      <Example
        title="Count badge"
        description="A count in a pill after the label, painted in the brand color."
      >
        <Button>
          <ButtonLabel>Inbox</ButtonLabel>
          <ButtonSlot $kind="badge">12</ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Badge hue"
        description="A hue on a colored badge turns its ring along with its fill."
      >
        <Button>
          <ButtonLabel>Reviews</ButtonLabel>
          <ButtonSlot $kind="badge" $layer="brand" $hue="green" $border>
            3
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Keyboard shortcut"
        description="The keys of a shortcut keep their order in every text direction."
      >
        <Button>
          <ButtonLabel>Save</ButtonLabel>
          <ButtonSlot $kind="shortcut">
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Floating badge"
        description="A badge that hangs off the top corner at the end of the button."
      >
        <div className="pt-3">
          <Button $kind="bevel">
            <ButtonLabel>Updates</ButtonLabel>
            <ButtonSlot $kind="badge" $layer="success" $floating>
              New
            </ButtonSlot>
          </Button>
        </div>
      </Example>

      <Example
        title="Right to left"
        description="In right-to-left text, the end is on the left, and the floating badge hangs off that corner."
      >
        <div dir="rtl" lang="ar" className="w-full pt-3">
          <Button $kind="bevel">
            <ButtonLabel>التحديثات</ButtonLabel>
            <ButtonSlot $kind="badge" $layer="success" $floating>
              جديد
            </ButtonSlot>
          </Button>
        </div>
      </Example>

      <Example
        title="Label and description"
        description="A label over a description, both truncated. The avatar spans the two rows, and the shortcut stays on the first."
      >
        <Button
          $lightnessOffset
          $rounded="xl"
          $p={3}
          className="max-w-96 justify-start text-start"
        >
          <ButtonSlot $kind="avatar" $layer="secondary" $size="lg" $rowSpan={2}>
            UI
          </ButtonSlot>
          <ButtonContent>
            <ButtonLabel>Open Ariakit UI</ButtonLabel>
            <ButtonDescription>
              A secondary line that truncates when the row runs out of room
            </ButtonDescription>
          </ButtonContent>
          <ButtonSlot $kind="shortcut">↵</ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Clamped description"
        description="The description wraps onto a set number of lines, and an ellipsis ends the rest."
      >
        <Button
          $lightnessOffset
          $rounded="xl"
          $p={3}
          className="max-w-96 justify-start text-start"
        >
          <ButtonSlot>
            <FolderOpen />
          </ButtonSlot>
          <ButtonContent>
            <ButtonLabel>Recent projects</ButtonLabel>
            <ButtonDescription $truncate={false} $lineClamp={2}>
              The projects you opened in the last month, with the most recent
              first. Pinned projects stay at the top of the list, and archived
              projects do not show here.
            </ButtonDescription>
          </ButtonContent>
        </Button>
      </Example>

      <Example
        title="Horizontal content"
        description="The description sits beside the label, and it wraps below only when the row is full."
      >
        <Button
          $lightnessOffset
          $rounded="xl"
          $p={3}
          className="justify-start text-start"
        >
          <ButtonContent $orientation="horizontal">
            <ButtonLabel>Storage</ButtonLabel>
            <ButtonDescription $truncate={false}>
              12 GB of 50 GB used
            </ButtonDescription>
          </ButtonContent>
        </Button>
      </Example>

      <Example
        title="Disabled"
        description="The text, the icon and the badge count fade, and the button stops responding to the pointer. The badge keeps its fill."
      >
        <Button disabled>
          <ButtonSlot>
            <Trash2 />
          </ButtonSlot>
          <ButtonLabel>Delete</ButtonLabel>
          <ButtonSlot $kind="badge">3</ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Disabled bevel"
        description="The gradient goes away, and a faint surface keeps the shape of the button in both themes."
      >
        <Button $kind="bevel" disabled>
          Archive
        </Button>
      </Example>

      <Example
        title="Disabled brand"
        description="The color stays and the text fades."
      >
        <Button $layer="brand" disabled>
          Publish
        </Button>
      </Example>

      <Example
        title="Focusable disabled"
        description="It stays in the tab order, and assistive technology announces it as disabled. It looks like the disabled bevel."
      >
        <Button $kind="bevel" disabled accessibleWhenDisabled>
          Export
        </Button>
      </Example>

      <Example
        title="Disabled inverted"
        description="A disabled button drops the inversion and fades like a see-through button."
      >
        <Button $invert disabled>
          Continue
        </Button>
      </Example>

      <Example
        title="Thin focus ring"
        description="Tab to the button to see a focus ring thinner than the default."
      >
        <Button $kind="bevel" $focus={1}>
          Rename
        </Button>
      </Example>

      <Example
        title="Thick focus ring"
        description="Tab to the button to see a focus ring thicker than the default."
      >
        <Button $kind="bevel" $focus={3}>
          Move
        </Button>
      </Example>

      <Example
        title="Offset focus ring"
        description="Tab to the button to see the focus ring farther from its edge."
      >
        <Button $kind="bevel" $focusOffset={2}>
          Share
        </Button>
      </Example>

      <Example
        title="Highlighted focus"
        description="Keyboard focus fills the button with the brand color instead of a ring. Tab into the group to see it."
      >
        <ButtonGroup aria-label="File actions" $border $layout="vertical">
          <Button $focusHighlight>Open</Button>
          <Button $focusHighlight>Duplicate</Button>
          <Button $focusHighlight>Download</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Bordered group"
        description="The group owns the surface and the edge, and the buttons rest on it."
      >
        <ButtonGroup aria-label="Clipboard" $border>
          <Button>Cut</Button>
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Joined buttons"
        description="With no padding, bordered buttons share one edge and square the corners between them."
      >
        <ButtonGroup aria-label="Period" $p="none">
          <Button $border $borderType="border">
            Day
          </Button>
          <Button $border $borderType="border">
            Week
          </Button>
          <Button $border $borderType="border">
            Month
          </Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Stretched group"
        description="The group fills the row, and each button gets an equal share of it."
      >
        <ButtonGroup aria-label="RSVP" $border $layout="stretch">
          <Button>Decline</Button>
          <Button>Maybe</Button>
          <Button>Accept</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Spaced group"
        description="With a gap, the buttons keep all four corners and do not join."
      >
        <ButtonGroup aria-label="Export format" $border $gap="md">
          <Button>PNG</Button>
          <Button>SVG</Button>
          <Button>PDF</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Small group"
        description="The group sets the font size for all its buttons, so they scale together."
      >
        <ButtonGroup aria-label="Zoom level" $border $size="sm">
          <Button>50%</Button>
          <Button>100%</Button>
          <Button>200%</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Wrapping group"
        description="Buttons that do not fit on the row move to the next one."
      >
        <ButtonGroup
          aria-label="Filters"
          $layout="wrap"
          $gap="sm"
          className="max-w-72"
        >
          <Button $lightnessOffset>Design</Button>
          <Button $lightnessOffset>Engineering</Button>
          <Button $lightnessOffset>Marketing</Button>
          <Button $lightnessOffset>Operations</Button>
          <Button $lightnessOffset>Support</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Pipe separators"
        description="Thin rules between the buttons. A rule hides next to a hovered, selected or focused button."
      >
        <ButtonGroup aria-label="History" $border>
          <Button>Undo</Button>
          <ButtonSeparator />
          <Button>Redo</Button>
          <ButtonSeparator />
          <Button>Revert</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Chevron separators"
        description="Chevrons for a path. They stay next to a hovered button and turn around in right-to-left text."
      >
        <ButtonGroup aria-label="Path" $border>
          <Button>Home</Button>
          <ButtonSeparator $kind="chevron" />
          <Button>Projects</Button>
          <ButtonSeparator $kind="chevron" />
          <Button>Ariakit</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Full-height separators"
        description="The rules run through the padding of the group to its edge."
      >
        <ButtonGroup aria-label="Zoom" $border>
          <Button>Zoom out</Button>
          <ButtonSeparator $size="full" />
          <Button>Fit</Button>
          <ButtonSeparator $size="full" />
          <Button>Zoom in</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Thick separators"
        description="Wider rules, which paint lighter so they do not get heavier."
      >
        <ButtonGroup aria-label="Item actions" $border>
          <Button>Share</Button>
          <ButtonSeparator $width={3} />
          <Button>Duplicate</Button>
          <ButtonSeparator $width={3} />
          <Button>Archive</Button>
        </ButtonGroup>
      </Example>

      <Example
        title="Segmented control"
        description="A radio group with a bevel glider under the checked button. Select another button to move the glider."
      >
        <ak.RadioProvider defaultValue="list">
          <ak.RadioGroup aria-label="View" render={<ButtonGroup $border />}>
            <ak.Radio value="list" render={<Button />}>
              List
            </ak.Radio>
            <ak.Radio value="grid" render={<Button />}>
              Grid
            </ak.Radio>
            <ak.Radio value="board" render={<Button />}>
              Board
            </ak.Radio>
            <ButtonGlider $kind="bevel" />
          </ak.RadioGroup>
        </ak.RadioProvider>
      </Example>

      <Example
        title="Glider ring"
        description="The glider under the checked button draws its ring in the exact brand color."
      >
        <ak.RadioProvider defaultValue="medium">
          <ak.RadioGroup aria-label="Size" render={<ButtonGroup $border />}>
            <ak.Radio value="small" render={<Button />}>
              Small
            </ak.Radio>
            <ak.Radio value="medium" render={<Button />}>
              Medium
            </ak.Radio>
            <ak.Radio value="large" render={<Button />}>
              Large
            </ak.Radio>
            <ButtonGlider $edge="brand" $edgeRaw />
          </ak.RadioGroup>
        </ak.RadioProvider>
      </Example>

      <Example
        title="Vertical bar glider"
        description="A vertical radio group. A bar along the end edge marks the checked row."
      >
        <ak.RadioProvider defaultValue="system">
          <ak.RadioGroup
            aria-label="Theme"
            render={<ButtonGroup $border $layout="vertical" />}
          >
            <ak.Radio value="system" render={<Button />}>
              System
            </ak.Radio>
            <ak.Radio value="light" render={<Button />}>
              Light
            </ak.Radio>
            <ak.Radio value="dark" render={<Button />}>
              Dark
            </ak.Radio>
            <ButtonGlider $kind="bar" />
          </ak.RadioGroup>
        </ak.RadioProvider>
      </Example>

      <Example
        title="Current link gliders"
        description="Gliders follow the current, the hovered and the focused link. The slash next to the current link hides."
      >
        <ButtonGroup aria-label="Project" $border>
          <Button render={<a href="#overview" aria-current="page" />}>
            Overview
          </Button>
          <ButtonSeparator $kind="slash" />
          <Button render={<a href="#activity" />}>Activity</Button>
          <ButtonSeparator $kind="slash" />
          <Button render={<a href="#settings" />}>Settings</Button>
          <ButtonGlider />
          <ButtonGlider $state="hover" />
          <ButtonGlider $state="focus" />
        </ButtonGroup>
      </Example>

      <Example
        title="On a brand layer"
        description="A bevel lifts off the brand surface, and a flat button takes its color."
      >
        <Frame
          $layer="brand"
          $rounded="xl"
          $p={4}
          className="flex flex-wrap items-center gap-3"
        >
          <Text>Your trial ends soon.</Text>
          <Button $kind="bevel">Upgrade</Button>
          <Button>Not now</Button>
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default ButtonExamples;
