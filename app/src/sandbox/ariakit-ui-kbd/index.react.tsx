/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ButtonProps } from "@ariakit/ui/components/button.ariakit.react";
import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Input,
  InputGroup,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

interface KeyButtonsProps extends Pick<
  ButtonProps,
  "$layer" | "$invert" | "$lightnessOffset" | "$size" | "disabled"
> {
  label?: string;
}

// Renders one button for each key kind, in the slot that each kind uses.
function KeyButtons({ label = "Search", ...props }: KeyButtonsProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Button {...props}>
        <ButtonLabel>{label}</ButtonLabel>
        <ButtonSlot $kind="box" $size="md">
          <Kbd $kind="keycap">⌘K</Kbd>
        </ButtonSlot>
      </Button>
      <Button {...props}>
        <ButtonLabel>{label}</ButtonLabel>
        <ButtonSlot $kind="box">
          <Kbd $kind="flat">⌘K</Kbd>
        </ButtonSlot>
      </Button>
      <Button {...props}>
        <ButtonLabel>{label}</ButtonLabel>
        <ButtonSlot $kind="text">
          <Kbd>⌘K</Kbd>
        </ButtonSlot>
      </Button>
    </div>
  );
}

export default function KbdExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Symbol, letter and word keys in a narrow paragraph that wraps. The caps do not change the line spacing of the paragraph."
        code={`
          Press
          <Kbd $kind="keycap">⌘</Kbd>
          <Kbd $kind="keycap">K</Kbd>
          to search,
          <Kbd $kind="keycap">↑</Kbd>
          and
          <Kbd $kind="keycap">↓</Kbd>
          to move,
          <Kbd $kind="keycap">Enter</Kbd>
          to pick and
          <Kbd $kind="keycap">Esc</Kbd>
          to close the list.
        `}
      >
        <p className="max-w-56 text-sm">
          Press <Kbd $kind="keycap">⌘</Kbd> <Kbd $kind="keycap">K</Kbd> to
          search, <Kbd $kind="keycap">↑</Kbd> and <Kbd $kind="keycap">↓</Kbd> to
          move, <Kbd $kind="keycap">Enter</Kbd> to pick and{" "}
          <Kbd $kind="keycap">Esc</Kbd> to close the list.
        </p>
      </Example>

      <Example
        title="Shortcut list"
        description="Key combinations as flex items in a shortcut reference. Each cap keeps its own height instead of the line height of the row."
        code={`
          Open command palette
          <Kbd $kind="keycap">⌘</Kbd>
          <Kbd $kind="keycap">⇧</Kbd>
          <Kbd $kind="keycap">P</Kbd>
          Save
          <Kbd $kind="keycap">⌘</Kbd>
          <Kbd $kind="keycap">S</Kbd>
          Close
          <Kbd $kind="keycap">Esc</Kbd>
        `}
      >
        <dl className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 text-sm">
          <dt>Open command palette</dt>
          <dd className="inline-flex gap-1">
            <Kbd $kind="keycap">⌘</Kbd>
            <Kbd $kind="keycap">⇧</Kbd>
            <Kbd $kind="keycap">P</Kbd>
          </dd>
          <dt>Save</dt>
          <dd className="inline-flex gap-1">
            <Kbd $kind="keycap">⌘</Kbd>
            <Kbd $kind="keycap">S</Kbd>
          </dd>
          <dt>Close</dt>
          <dd className="inline-flex gap-1">
            <Kbd $kind="keycap">Esc</Kbd>
          </dd>
        </dl>
      </Example>

      <Example
        title="Small text"
        description="Small labels keep a visible hairline, lip and ring. Use a line height of at least 1.5 for text-xs so the caps have room between wrapped lines."
        code={`
          <p className="max-w-40 text-xs leading-normal">
            Press <Kbd $kind="keycap">Esc</Kbd> to close,
            <Kbd $kind="keycap">Enter</Kbd> to confirm, or
            <Kbd $kind="keycap">Page Down</Kbd> to continue.
          </p>
        `}
      >
        <p className="max-w-40 text-xs leading-normal">
          Press <Kbd $kind="keycap">Esc</Kbd> to close,{" "}
          <Kbd $kind="keycap">Enter</Kbd> to confirm, or{" "}
          <Kbd $kind="keycap">Page Down</Kbd> to continue.
        </p>
      </Example>

      <Example
        title="Large text"
        description="In text-3xl, the padding, the corners, the lip and the ring all scale with the font."
        code={`
          Press
          <Kbd $kind="keycap">⌘</Kbd>
          <Kbd $kind="keycap">K</Kbd>
        `}
      >
        <p className="text-3xl">
          Press <Kbd $kind="keycap">⌘</Kbd> <Kbd $kind="keycap">K</Kbd>
        </p>
      </Example>

      <Example
        title="Brand cap"
        description="The face, the dish gradient, the lip and the ring all come from the brand layer. A dark face gets the drawing of a dark cap."
        code={`
          Press
          <Kbd $kind="keycap" $layer="brand">⌘</Kbd>
          <Kbd $kind="keycap" $layer="brand">K</Kbd>
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="keycap" $layer="brand">
            ⌘
          </Kbd>{" "}
          <Kbd $kind="keycap" $layer="brand">
            K
          </Kbd>
        </p>
      </Example>

      <Example
        title="Inverted cap"
        description="The face takes the opposite scheme of the page, and the cap draws itself for its own face, not for the page."
        code={`
          Press
          <Kbd $kind="keycap" $invert>Esc</Kbd>
          to close
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="keycap" $invert>
            Esc
          </Kbd>{" "}
          to close
        </p>
      </Example>

      <Example
        title="Transparent cap"
        description="The cap paints no face of its own. The lip, the dish and the ring still draw its outline."
        code={`
          Press
          <Kbd $kind="keycap" $layer="transparent">Tab</Kbd>
          to move
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="keycap" $layer="transparent">
            Tab
          </Kbd>{" "}
          to move
        </p>
      </Example>

      <Example
        title="Brand edge"
        description="Only the ring takes the edge color. The lip follows the face, so it stays neutral."
        code={`
          Press
          <Kbd $kind="keycap" $edge="brand">Tab</Kbd>
          to move
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="keycap" $edge="brand">
            Tab
          </Kbd>{" "}
          to move
        </p>
      </Example>

      <Example
        title="Raw brand edge"
        description="The ring uses the brand color exactly as given, without the cap's default lightening and alpha."
        code={`
          Press
          <Kbd $kind="keycap" $edge="brand" $edgeRaw>Tab</Kbd>
          to move
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="keycap" $edge="brand" $edgeRaw>
            Tab
          </Kbd>{" "}
          to move
        </p>
      </Example>

      <Example
        title="Fixed edge weight"
        description="An explicit weight replaces both scheme defaults, so the ring has the same strength on light and dark surfaces."
        code={`
          Hold
          <Kbd $kind="keycap" $edgeWeight={40}>Shift</Kbd>
          to select a range
        `}
      >
        <p className="text-sm">
          Hold{" "}
          <Kbd $kind="keycap" $edgeWeight={40}>
            Shift
          </Kbd>{" "}
          to select a range
        </p>
      </Example>

      <Example
        title="On a brand layer"
        description="On a saturated dark surface, the caps take the brand hue and the drawing of a dark cap: no top highlight, a shallower lip cut and a lifted ring."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            Press
            <Kbd $kind="keycap">⌘</Kbd>
            <Kbd $kind="keycap">K</Kbd>
            to search
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="text-sm">
          Press <Kbd $kind="keycap">⌘</Kbd> <Kbd $kind="keycap">K</Kbd> to
          search
        </Frame>
      </Example>

      <Example
        title="On an inverted layer"
        description="The caps follow the surface they sit on, not the page theme: the dark drawing on a light page, and the light drawing on a dark page."
        code={`
          <Frame $invert $rounded="xl" $p={4}>
            Press
            <Kbd $kind="keycap">⌘</Kbd>
            <Kbd $kind="keycap">K</Kbd>
            to search
          </Frame>
        `}
      >
        <Frame $invert $rounded="xl" $p={4} className="text-sm">
          Press <Kbd $kind="keycap">⌘</Kbd> <Kbd $kind="keycap">K</Kbd> to
          search
        </Frame>
      </Example>
      <Example
        title="Flat keys"
        description="A flat key fills a chip from the surface it sits on, with the optical side padding of a text frame."
        code={`
          Press
          <Kbd $kind="flat">⌘</Kbd>
          <Kbd $kind="flat">K</Kbd>
          to search,
          <Kbd $kind="flat">Enter</Kbd>
          to pick and
          <Kbd $kind="flat">Esc</Kbd>
          to close the list.
        `}
      >
        <p className="max-w-56 text-sm">
          Press <Kbd $kind="flat">⌘</Kbd> <Kbd $kind="flat">K</Kbd> to search,{" "}
          <Kbd $kind="flat">Enter</Kbd> to pick and <Kbd $kind="flat">Esc</Kbd>{" "}
          to close the list.
        </p>
      </Example>

      <Example
        title="Plain keys"
        description="The default plain key draws no surface or padding. Muted text in the UI font tells it apart from the sentence, and its capitals line up with the surrounding ones."
        code={`
          Press
          <Kbd $kind="plain">⌘</Kbd>
          <Kbd $kind="plain">K</Kbd>
          to search, or
          <Kbd $kind="plain">Esc</Kbd>
          to close the list.
        `}
      >
        <p className="max-w-56 text-sm">
          Press <Kbd $kind="plain">⌘</Kbd> <Kbd $kind="plain">K</Kbd> to search,
          or <Kbd $kind="plain">Esc</Kbd> to close the list.
        </p>
      </Example>

      <Example
        title="Kinds side by side"
        description="Keycap, flat and plain keys on one line. Plain keys keep the text size and baseline. Flat keys are smaller, so the chip is as tall as the text, and centered on its capitals. Keycaps are smaller to fit their lip."
        code={`
          <Kbd $kind="keycap">Tab</Kbd>
          <Kbd $kind="flat">Tab</Kbd>
          <Kbd $kind="plain">Tab</Kbd>
        `}
      >
        <p className="text-sm">
          <Kbd $kind="keycap">Tab</Kbd> <Kbd $kind="flat">Tab</Kbd>{" "}
          <Kbd $kind="plain">Tab</Kbd>
        </p>
      </Example>

      <Example
        title="Flat key in large text"
        description="In text-3xl, the padding and the corners of a flat key scale with the font."
        code={`
          Press
          <Kbd $kind="flat">⌘</Kbd>
          <Kbd $kind="flat">K</Kbd>
        `}
      >
        <p className="text-3xl">
          Press <Kbd $kind="flat">⌘</Kbd> <Kbd $kind="flat">K</Kbd>
        </p>
      </Example>

      <Example
        title="Brand flat key"
        description="A layer color paints the chip and sets readable text on it."
        code={`
          Press
          <Kbd $kind="flat" $layer="brand">Enter</Kbd>
          to send
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="flat" $layer="brand">
            Enter
          </Kbd>{" "}
          to send
        </p>
      </Example>

      <Example
        title="Bordered flat key"
        description="A border adds an edge around the chip, like a bordered badge."
        code={`
          Press
          <Kbd $kind="flat" $border>Esc</Kbd>
          to close
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="flat" $border>
            Esc
          </Kbd>{" "}
          to close
        </p>
      </Example>

      <Example
        title="Outlined key"
        description="A transparent flat key with a border draws only the outline."
        code={`
          Press
          <Kbd $kind="flat" $layer="transparent" $border>Esc</Kbd>
          to close
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="flat" $layer="transparent" $border>
            Esc
          </Kbd>{" "}
          to close
        </p>
      </Example>

      <Example
        title="Pill flat key"
        description="Frame variants shape a flat key: a full radius with wider side padding."
        code={`
          Press
          <Kbd $kind="flat" $rounded="full" $px="xl">Space</Kbd>
          to play
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="flat" $rounded="full" $px="xl">
            Space
          </Kbd>{" "}
          to play
        </p>
      </Example>

      <Example
        title="Full ink plain key"
        description="An ink of 100 removes the muting of a plain key."
        code={`
          Press
          <Kbd $kind="plain" $ink={100}>Esc</Kbd>
          to close
        `}
      >
        <p className="text-sm">
          Press{" "}
          <Kbd $kind="plain" $ink={100}>
            Esc
          </Kbd>{" "}
          to close
        </p>
      </Example>

      <Example
        title="Flat keys on a brand layer"
        description="On a saturated surface, flat chips lighten from the brand color and plain keys mute toward it."
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            Press
            <Kbd $kind="flat">⌘</Kbd>
            <Kbd $kind="flat">K</Kbd>
            or
            <Kbd $kind="plain">Esc</Kbd>
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4} className="text-sm">
          Press <Kbd $kind="flat">⌘</Kbd> <Kbd $kind="flat">K</Kbd> or{" "}
          <Kbd $kind="plain">Esc</Kbd>
        </Frame>
      </Example>
      <Example
        title="Keys in shortcut slots"
        description="A keycap goes in a slot that is not square. A flat key fills such a slot, so its size sets the chip, here a line-tall one. A plain key goes in a text slot, which keeps the side padding of the label."
        code={`
          <Button>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box" $size="md">
              <Kbd $kind="keycap">⌘K</Kbd>
            </ButtonSlot>
          </Button>
          <Button>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat">⌘K</Kbd>
            </ButtonSlot>
          </Button>
          <Button>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="text">
              <Kbd $kind="plain">⌘K</Kbd>
            </ButtonSlot>
          </Button>
        `}
      >
        <KeyButtons $lightnessOffset />
      </Example>
      <Example
        title="Keys on brand buttons"
        description="Each kind takes the brand hue of the button: a darker cap and chip, and plain text muted toward the brand color."
        code={`
          <Button $layer="brand">
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat">⌘K</Kbd>
            </ButtonSlot>
          </Button>
        `}
      >
        <KeyButtons $layer="brand" />
      </Example>

      <Example
        title="Keys on inverted buttons"
        description="The keys draw themselves for the inverted surface of the button, not for the page."
        code={`
          <Button $invert>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box" $size="md">
              <Kbd $kind="keycap">⌘K</Kbd>
            </ButtonSlot>
          </Button>
        `}
      >
        <KeyButtons $invert />
      </Example>

      <Example
        title="Keys on disabled buttons"
        description="The slot fades the cap and the chip like the button surface, and mutes key text like the label."
        code={`
          <Button disabled>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="text">
              <Kbd>⌘K</Kbd>
            </ButtonSlot>
          </Button>
        `}
      >
        <KeyButtons $lightnessOffset disabled />
      </Example>

      <Example
        title="Keys in a disabled input group"
        description="While the input of a group is disabled, the slots fade the cap and the chip, so a brand chip keeps only a tint, and the group mutes key text. The key of an enabled action button keeps its surface."
        code={`
          <InputGroup>
            <Input disabled />
            <InputSlot $kind="box">
              <Kbd $kind="flat" $layer="brand">⌘K</Kbd>
            </InputSlot>
          </InputGroup>
        `}
      >
        <div className="flex w-full flex-col gap-2">
          <InputGroup>
            <Input
              aria-label="Search docs"
              placeholder="Search docs"
              disabled
            />
            <InputSlot $kind="box" $size="md">
              <Kbd $kind="keycap">⌘K</Kbd>
            </InputSlot>
          </InputGroup>
          <InputGroup>
            <Input
              aria-label="Search files"
              placeholder="Search files"
              disabled
            />
            <InputSlot $kind="box">
              <Kbd $kind="flat" $layer="brand">
                ⌘K
              </Kbd>
            </InputSlot>
          </InputGroup>
          <InputGroup>
            <Input aria-label="Message" placeholder="Message" disabled />
            <InputSlot $size="2xl" $kind="box">
              <Button $size="sm">
                <ButtonLabel>Send</ButtonLabel>
                <ButtonSlot $kind="box">
                  <Kbd $kind="flat" $layer="brand">
                    ↵
                  </Kbd>
                </ButtonSlot>
              </Button>
            </InputSlot>
          </InputGroup>
        </div>
      </Example>

      <Example
        title="Keys in right to left buttons"
        description="The slot ends the row on the left, and every kind keeps its key chord left to right."
        code={`
          <div dir="rtl">
            <Button>
              <ButtonLabel>بحث</ButtonLabel>
              <ButtonSlot $kind="text">
                <Kbd>⌘K</Kbd>
              </ButtonSlot>
            </Button>
          </div>
        `}
      >
        <div dir="rtl" lang="ar" className="w-full">
          <KeyButtons $lightnessOffset label="بحث" />
        </div>
      </Example>

      <Example
        title="Separate keys in a slot"
        description="Each key of a chord can have its own Kbd. The keys keep a small gap and stay left to right in right-to-left text."
        code={`
          <Button>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box" $size="md">
              <Kbd $kind="keycap">⌘</Kbd>
              <Kbd $kind="keycap">K</Kbd>
            </ButtonSlot>
          </Button>
        `}
      >
        <div className="flex flex-wrap items-start gap-4">
          <Button $lightnessOffset>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box" $size="md">
              <Kbd $kind="keycap">⌘</Kbd>
              <Kbd $kind="keycap">K</Kbd>
            </ButtonSlot>
          </Button>
          <Button $lightnessOffset>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="text">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </ButtonSlot>
          </Button>
          <div dir="rtl" lang="ar" className="contents">
            <Button $lightnessOffset>
              <ButtonLabel>بحث</ButtonLabel>
              <ButtonSlot $kind="box" $size="md">
                <Kbd $kind="keycap">⌘</Kbd>
                <Kbd $kind="keycap">K</Kbd>
              </ButtonSlot>
            </Button>
          </div>
        </div>
      </Example>

      <Example
        title="Keys in button sizes"
        description="Keys scale with the text of small and large buttons."
        code={`
          <Button $size="sm">
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat">⌘K</Kbd>
            </ButtonSlot>
          </Button>
          <Button $size="lg">…</Button>
        `}
      >
        <div className="flex flex-wrap items-start gap-4">
          <KeyButtons $lightnessOffset $size="sm" />
          <KeyButtons $lightnessOffset $size="lg" />
        </div>
      </Example>
      <Example
        title="Flat keys in slot sizes"
        description="A flat key fills its slot, so the slot size sets the chip. The text grows with the slot up to the keycap size, and the sides keep the space above and below the capitals."
        code={`
          <Button>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box" $size="md">
              <Kbd $kind="flat">⌘K</Kbd>
            </ButtonSlot>
          </Button>
          <Button>…<ButtonSlot $kind="box" $size="lg">…</ButtonSlot></Button>
          <Button>…<ButtonSlot $kind="box">…</ButtonSlot></Button>
        `}
      >
        <div className="flex flex-col items-start gap-2">
          {(["md", "lg", "xl"] as const).map((size) => (
            <Button key={size} $lightnessOffset>
              <ButtonLabel>Search</ButtonLabel>
              <ButtonSlot $kind="box" $size={size}>
                <Kbd $kind="flat">⌘K</Kbd>
              </ButtonSlot>
            </Button>
          ))}
        </div>
      </Example>
      <Example
        title="Flat key padding in a slot"
        description="Explicit side padding on a flat key replaces the padding that fits the slot."
        code={`
          <Button>
            <ButtonLabel>Play</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat" $px="0.75em">Space</Kbd>
            </ButtonSlot>
          </Button>
        `}
      >
        <div className="flex flex-wrap items-start gap-4">
          <Button $lightnessOffset>
            <ButtonLabel>Play</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat">Space</Kbd>
            </ButtonSlot>
          </Button>
          <Button $lightnessOffset>
            <ButtonLabel>Play</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat" $px="0.75em">
                Space
              </Kbd>
            </ButtonSlot>
          </Button>
        </div>
      </Example>
      <Example
        title="Keycaps in slot sizes"
        description="A keycap fills its slot too. The text grows with the slot up to the size of the label, and the sides keep the space above and below the capitals on the face of the cap."
        code={`
          <Button>
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box" $size="md">
              <Kbd $kind="keycap">⌘K</Kbd>
            </ButtonSlot>
          </Button>
          <Button>…<ButtonSlot $kind="box" $size="lg">…</ButtonSlot></Button>
          <Button>…<ButtonSlot $kind="box">…</ButtonSlot></Button>
        `}
      >
        <div className="flex flex-col items-start gap-2">
          {(["md", "lg", "xl"] as const).map((size) => (
            <Button key={size} $lightnessOffset>
              <ButtonLabel>Search</ButtonLabel>
              <ButtonSlot $kind="box" $size={size}>
                <Kbd $kind="keycap">⌘K</Kbd>
              </ButtonSlot>
            </Button>
          ))}
        </div>
      </Example>

      <Example
        title="Keys in rounded buttons"
        description="A key that fills its slot keeps its corners concentric with the button: the radius of the button minus the gap around the key. A pill button gets a pill key."
        code={`
          <Button $rounded="2xl">
            <ButtonLabel>Search</ButtonLabel>
            <ButtonSlot $kind="box">
              <Kbd $kind="flat">⌘K</Kbd>
            </ButtonSlot>
          </Button>
          <Button $rounded="full">…</Button>
        `}
      >
        <div className="grid grid-cols-2 items-start gap-2">
          {(["2xl", "full"] as const).map((rounded) =>
            (["flat", "keycap"] as const).map((kind) => (
              <Button
                key={`${rounded}-${kind}`}
                $lightnessOffset
                $rounded={rounded}
              >
                <ButtonLabel>Search</ButtonLabel>
                <ButtonSlot $kind="box">
                  <Kbd $kind={kind}>⌘K</Kbd>
                </ButtonSlot>
              </Button>
            )),
          )}
        </div>
      </Example>
    </ExampleGrid>
  );
}
