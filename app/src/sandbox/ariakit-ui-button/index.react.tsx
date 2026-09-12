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
import { button, buttonGlider, buttonGroup } from "@ariakit/ui/styles/button";
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
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

const groups = [
  { title: "Glider", $layout: "horizontal", $gap: "none", $p: "none" },
  {
    title: "Independent",
    $layout: "horizontal",
    $gap: "none",
    $p: "none",
    $joined: false,
  },
  {
    title: "Joined vertical",
    $layout: "vertical",
    $gap: "auto",
    $p: "none",
    $joined: true,
  },
  { title: "Horizontal", $layout: "horizontal", $gap: "auto", $p: "none" },
  { title: "Stretched", $layout: "stretch", $gap: "none", $p: "none" },
  { title: "Padded", $layout: "horizontal", $gap: "none", $p: 2 },
  { title: "Spaced", $layout: "horizontal", $gap: "md", $p: "none" },
  { title: "Vertical", $layout: "vertical", $gap: "auto", $p: "none" },
  { title: "Wrapped", $layout: "wrap", $gap: "auto", $p: "none" },
  // All of these lengths resolve to the same padding as "none".
  { title: "Numeric zero", $layout: "horizontal", $gap: "auto", $p: 0 },
  { title: "Pixel zero", $layout: "horizontal", $gap: "auto", $p: "0px" },
  { title: "Rem zero", $layout: "horizontal", $gap: "auto", $p: "0rem" },
  {
    title: "Calculated zero",
    $layout: "horizontal",
    $gap: "auto",
    $p: "calc(0px)",
  },
] as const;

// Migrated from the button-group-layout sandbox without changes, including the
// glider, independent and joined vertical groups of #7471: raw @ariakit/react
// buttons styled through the recipes, in groups that set every zero-length
// padding form. The box around it is a frame with enough padding that the
// groups keep the radius they have at the top level.
function ButtonGroupLayout() {
  return (
    <div className="grid w-80 max-w-full gap-4">
      {groups.map(({ title, ...variants }) => (
        <section key={title}>
          <h2>{title}</h2>
          <div
            role="group"
            aria-label={title}
            {...buttonGroup.jsx({
              $border: 2,
              className: title === "Wrapped" ? "w-32" : undefined,
              ...variants,
            })}
          >
            {["Day", "Week", "Month"].map((label) => (
              <ak.Button
                key={label}
                aria-current={
                  title === "Glider" && label === "Week" ? "true" : undefined
                }
                {...button.jsx({ $border: 2, $borderType: "border" })}
              >
                {label}
              </ak.Button>
            ))}
            {title === "Glider" && (
              <div
                {...buttonGlider.jsx({ $state: "selected", $layer: "blue" })}
              />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

// A local image, so the screenshots never wait on the network.
const avatarImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f59e0b'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23fff7ed'/%3E%3Cpath d='M6 40c2-9 7-13 14-13s12 4 14 13z' fill='%23fff7ed'/%3E%3C/svg%3E";

export default function ButtonExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The button is see-through at rest and shows the surface behind it. It paints only on hover and press."
        code={`
          <Button>Cancel</Button>
        `}
      >
        <Button>Cancel</Button>
      </Example>

      <Example
        title="Layer disabled"
        description="Disable the layer system while keeping the button's spacing. A bevel still paints its own surface."
        code={`
          <Button $layer={false}>Cancel action</Button>
          <Button $layer={false} $kind="bevel">Apply action</Button>
        `}
      >
        <Button $layer={false}>Cancel action</Button>
        <Button $layer={false} $kind="bevel">
          Apply action
        </Button>
      </Example>

      <Example
        title="Lifted"
        description="A neutral surface that stays visible at rest, for a button that stands alone."
        code={`
          <Button $lightnessOffset>Edit</Button>
        `}
      >
        <Button $lightnessOffset>Edit</Button>
      </Example>

      <Example
        title="Pushed"
        description="A neutral surface with a minimum lightness shift, which grows when the user asks for more contrast."
        code={`
          <Button $lightnessPush={2}>Publish changes</Button>
          <Button $lightnessPush={0}>Cancel changes</Button>
        `}
      >
        <Button $lightnessPush={2}>Publish changes</Button>
        <Button $lightnessPush={0}>Cancel changes</Button>
      </Example>

      <Example
        title="Contrast"
        description="A surface with increased contrast against the surface around it."
        code={`
          <Button $contrast>Review changes</Button>
        `}
      >
        <Button $contrast>Review changes</Button>
      </Example>

      <Example
        title="Desaturated"
        description="Remove color from a button on a colored surface. Zero chroma keeps a neutral fill."
        code={`
          <Frame $layer="brand" $p={3}>
            <Button $chroma={0}>Preview changes</Button>
          </Frame>
        `}
      >
        <Frame $layer="brand" $p={3}>
          <Button $chroma={0}>Preview changes</Button>
        </Frame>
      </Example>

      <Example
        title="Brand"
        description="The primary action. The color paints the button at rest, and the text stays readable on it."
        code={`
          <Button $layer="brand">Save changes</Button>
        `}
      >
        <Button $layer="brand">Save changes</Button>
      </Example>

      <Example
        title="Danger"
        description="A destructive action. The text turns dark or light, as the color of each theme needs."
        code={`
          <Button $layer="danger">Delete</Button>
        `}
      >
        <Button $layer="danger">Delete</Button>
      </Example>

      <Example
        title="Custom color"
        description="Any CSS color paints the button through the same path as a named color."
        code={`
          <Button $layer="#635bff">Connect account</Button>
        `}
      >
        <Button $layer="#635bff">Connect account</Button>
      </Example>

      <Example
        title="Inverted"
        description="A neutral surface with high contrast: dark on a light surface, and light on a dark one."
        code={`
          <Button $invert>Continue</Button>
        `}
      >
        <Button $invert>Continue</Button>
      </Example>

      <Example
        title="Bevel"
        description="A raised push button with a gradient and an inner shadow."
        code={`
          <Button $kind="bevel">Duplicate</Button>
        `}
      >
        <Button $kind="bevel">Duplicate</Button>
      </Example>

      <Example
        title="Danger bevel"
        description="A bevel on a color of its own paints the same color and text as the flat button, with the gradient on top."
        code={`
          <Button $kind="bevel" $layer="danger">Delete project</Button>
        `}
      >
        <Button $kind="bevel" $layer="danger">
          Delete project
        </Button>
      </Example>

      <Example
        title="Submit"
        description="A submit button shows the pointer cursor, which a command button does not."
        code={`
          <Button type="submit" $kind="bevel" $layer="brand">Create account</Button>
        `}
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
        code={`
          <Button $kind="bevel" $size="xs">
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
            <ButtonLabel>Add filter</ButtonLabel>
          </Button>
        `}
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
        code={`
          <Button $kind="bevel" $size="xl">
            <ButtonLabel>Get started</ButtonLabel>
            <ButtonSlot>
              <ArrowRight />
            </ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $kind="bevel" $rounded="full" $px="lg">Follow</Button>
        `}
      >
        <Button $kind="bevel" $rounded="full" $px="lg">
          Follow
        </Button>
      </Example>

      <Example
        title="Icon only"
        description="A single icon slot makes the button square. Its label is for assistive technology."
        code={`
          <Button $lightnessOffset>
            <ButtonSlot>
              <Settings />
            </ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button render={<a />}>
            <ButtonLabel>Documentation</ButtonLabel>
            <ButtonSlot>
              <ArrowUpRight />
            </ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $lightnessOffset>
            <ButtonLabel>Sort by</ButtonLabel>
            <ButtonSlot $size="sm">
              <ChevronDown />
            </ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $lightnessOffset>
            <ButtonSlot $size="2xl">
              <FolderOpen />
            </ButtonSlot>
            <ButtonLabel>Open folder</ButtonLabel>
          </Button>
        `}
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
        code={`
          <Button $lightnessOffset>
            <ButtonLabel>Filter</ButtonLabel>
            <ButtonSlot $mx="closeGap">
              <ChevronDown />
            </ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $lightnessOffset>
            <ButtonSlot $size="xl" $layer="brand" $mix={20}>
              <Share2 />
            </ButtonSlot>
            <ButtonLabel>Share</ButtonLabel>
          </Button>
        `}
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
        code={`
          <Button>
            <ButtonSlot $kind="avatar" $layer="brand">J</ButtonSlot>
            <ButtonLabel>Jane Doe</ButtonLabel>
          </Button>
        `}
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
        code={`
          <Button $kind="bevel" $rounded="full">
            <ButtonSlot $kind="avatar" $size="full" />
            <ButtonLabel>Ariakit</ButtonLabel>
          </Button>
        `}
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
        code={`
          <Button>
            <ButtonLabel>Inbox</ButtonLabel>
            <ButtonSlot $kind="badge">12</ButtonSlot>
          </Button>
        `}
      >
        <Button>
          <ButtonLabel>Inbox</ButtonLabel>
          <ButtonSlot $kind="badge">12</ButtonSlot>
        </Button>
      </Example>

      <Example
        title="Badge hue"
        description="A hue on a colored badge turns its ring along with its fill."
        code={`
          <Button>
            <ButtonLabel>Reviews</ButtonLabel>
            <ButtonSlot $kind="badge" $layer="brand" $hue="green" $border>3</ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button>
            <ButtonLabel>Save</ButtonLabel>
            <ButtonSlot $kind="shortcut">
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $kind="bevel">
            <ButtonLabel>Updates</ButtonLabel>
            <ButtonSlot $kind="badge" $layer="success" $floating>New</ButtonSlot>
          </Button>
        `}
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
        code={`
          <div dir="rtl">
            <Button $kind="bevel">
              <ButtonLabel>التحديثات</ButtonLabel>
              <ButtonSlot $kind="badge" $layer="success" $floating>جديد</ButtonSlot>
            </Button>
          </div>
        `}
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
        code={`
          <Button $lightnessOffset $rounded="xl" $p={3}>
            <ButtonSlot $kind="avatar" $layer="secondary" $size="lg" $rowSpan={2}>UI</ButtonSlot>
            <ButtonContent>
              <ButtonLabel>Open Ariakit UI</ButtonLabel>
              <ButtonDescription>…</ButtonDescription>
            </ButtonContent>
            <ButtonSlot $kind="shortcut">↵</ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $lightnessOffset $rounded="xl" $p={3}>
            <ButtonSlot>
              <FolderOpen />
            </ButtonSlot>
            <ButtonContent>
              <ButtonLabel>Recent projects</ButtonLabel>
              <ButtonDescription $truncate={false} $lineClamp={2}>…</ButtonDescription>
            </ButtonContent>
          </Button>
        `}
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
        code={`
          <Button $lightnessOffset $rounded="xl" $p={3}>
            <ButtonContent $orientation="horizontal">
              <ButtonLabel>Storage</ButtonLabel>
              <ButtonDescription $truncate={false}>12 GB of 50 GB used</ButtonDescription>
            </ButtonContent>
          </Button>
        `}
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
        code={`
          <Button disabled>
            <ButtonSlot>
              <Trash />
            </ButtonSlot>
            <ButtonLabel>Delete</ButtonLabel>
            <ButtonSlot $kind="badge">3</ButtonSlot>
          </Button>
        `}
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
        code={`
          <Button $kind="bevel" disabled>Archive</Button>
        `}
      >
        <Button $kind="bevel" disabled>
          Archive
        </Button>
      </Example>

      <Example
        title="Disabled brand"
        description="The color stays and the text fades."
        code={`
          <Button $layer="brand" disabled>Publish</Button>
        `}
      >
        <Button $layer="brand" disabled>
          Publish
        </Button>
      </Example>

      <Example
        title="Focusable disabled"
        description="It stays in the tab order, and assistive technology announces it as disabled. It looks like the disabled bevel."
        code={`
          <Button $kind="bevel" disabled accessibleWhenDisabled>Export</Button>
        `}
      >
        <Button $kind="bevel" disabled accessibleWhenDisabled>
          Export
        </Button>
      </Example>

      <Example
        title="Disabled inverted"
        description="A disabled button drops the inversion and fades like a see-through button."
        code={`
          <Button $invert disabled>Continue</Button>
        `}
      >
        <Button $invert disabled>
          Continue
        </Button>
      </Example>

      <Example
        title="Thin focus ring"
        description="Tab to the button to see a focus ring thinner than the default."
        code={`
          <Button $kind="bevel" $focus={1}>Rename</Button>
        `}
      >
        <Button $kind="bevel" $focus={1}>
          Rename
        </Button>
      </Example>

      <Example
        title="Thick focus ring"
        description="Tab to the button to see a focus ring thicker than the default."
        code={`
          <Button $kind="bevel" $focus={3}>Move</Button>
        `}
      >
        <Button $kind="bevel" $focus={3}>
          Move
        </Button>
      </Example>

      <Example
        title="Offset focus ring"
        description="Tab to the button to see the focus ring farther from its edge."
        code={`
          <Button $kind="bevel" $focusOffset={2}>Share</Button>
        `}
      >
        <Button $kind="bevel" $focusOffset={2}>
          Share
        </Button>
      </Example>

      <Example
        title="Highlighted focus"
        description="Keyboard focus fills the button with the brand color instead of a ring. Tab into the group to see it."
        code={`
          <ButtonGroup $border $layout="vertical">
            <Button $focusHighlight>Open</Button>
            <Button $focusHighlight>Duplicate</Button>
            <Button $focusHighlight>Download</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border>
            <Button>Cut</Button>
            <Button>Copy</Button>
            <Button>Paste</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $p="none">
            <Button $border $borderType="border">Day</Button>
            <Button $border $borderType="border">Week</Button>
            <Button $border $borderType="border">Month</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border $layout="stretch">
            <Button>Decline</Button>
            <Button>Maybe</Button>
            <Button>Accept</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border $gap="md">
            <Button>PNG</Button>
            <Button>SVG</Button>
            <Button>PDF</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border $size="sm">
            <Button>50%</Button>
            <Button>100%</Button>
            <Button>200%</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $layout="wrap" $gap="sm">
            <Button $lightnessOffset>Design</Button>
            <Button $lightnessOffset>Engineering</Button>
            <Button $lightnessOffset>Marketing</Button>
            <Button $lightnessOffset>Operations</Button>
            <Button $lightnessOffset>Support</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border>
            <Button>Undo</Button>
            <ButtonSeparator />
            <Button>Redo</Button>
            <ButtonSeparator />
            <Button>Revert</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border>
            <Button>Home</Button>
            <ButtonSeparator $kind="chevron" />
            <Button>Projects</Button>
            <ButtonSeparator $kind="chevron" />
            <Button>Ariakit</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border>
            <Button>Zoom out</Button>
            <ButtonSeparator $size="full" />
            <Button>Fit</Button>
            <ButtonSeparator $size="full" />
            <Button>Zoom in</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ButtonGroup $border>
            <Button>Share</Button>
            <ButtonSeparator $width={3} />
            <Button>Duplicate</Button>
            <ButtonSeparator $width={3} />
            <Button>Archive</Button>
          </ButtonGroup>
        `}
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
        code={`
          <ak.RadioProvider>
            <ak.RadioGroup render={<ButtonGroup $border />}>
              <ak.Radio value="list" render={<Button />}>List</ak.Radio>
              <ak.Radio value="grid" render={<Button />}>Grid</ak.Radio>
              <ak.Radio value="board" render={<Button />}>Board</ak.Radio>
              <ButtonGlider $kind="bevel" />
            </ak.RadioGroup>
          </ak.RadioProvider>
        `}
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
        code={`
          <ak.RadioProvider>
            <ak.RadioGroup render={<ButtonGroup $border />}>
              <ak.Radio value="small" render={<Button />}>Small</ak.Radio>
              <ak.Radio value="medium" render={<Button />}>Medium</ak.Radio>
              <ak.Radio value="large" render={<Button />}>Large</ak.Radio>
              <ButtonGlider $edge="brand" $edgeRaw />
            </ak.RadioGroup>
          </ak.RadioProvider>
        `}
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
        code={`
          <ak.RadioProvider>
            <ak.RadioGroup render={<ButtonGroup $border $layout="vertical" />}>
              <ak.Radio value="system" render={<Button />}>System</ak.Radio>
              <ak.Radio value="light" render={<Button />}>Light</ak.Radio>
              <ak.Radio value="dark" render={<Button />}>Dark</ak.Radio>
              <ButtonGlider $kind="bar" />
            </ak.RadioGroup>
          </ak.RadioProvider>
        `}
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
        code={`
          <ButtonGroup $border>
            <Button render={<a />}>Overview</Button>
            <ButtonSeparator $kind="slash" />
            <Button render={<a />}>Activity</Button>
            <ButtonSeparator $kind="slash" />
            <Button render={<a />}>Settings</Button>
            <ButtonGlider />
            <ButtonGlider $state="hover" />
            <ButtonGlider $state="focus" />
          </ButtonGroup>
        `}
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
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Text>Your trial ends soon.</Text>
            <Button $kind="bevel">Upgrade</Button>
            <Button>Not now</Button>
          </Frame>
        `}
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

      {/*
        Regression fixtures: Button and ButtonGroup scenarios migrated from the
        button-group-layout sandbox.
      */}
      <Example
        title="Button group layout"
        description="Thirteen groups of bordered buttons: gapless rows that join, one with a selected glider, a row and a column that set $joined, a padded row, and spaced, vertical and wrapping rows that keep their corners."
        code={`
          <ButtonGroup $border={2} $layout="horizontal" $gap="auto" $p="none">
            <Button $border={2} $borderType="border">Day</Button>
            <Button $border={2} $borderType="border">Week</Button>
            <Button $border={2} $borderType="border">Month</Button>
          </ButtonGroup>
        `}
      >
        <ButtonGroupLayout />
      </Example>
    </ExampleGrid>
  );
}
