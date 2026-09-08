/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import type { DisclosureIndicator } from "@ariakit/ui/components/disclosure.ariakit.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureGroup,
} from "@ariakit/ui/components/disclosure.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import * as icons from "lucide-react";
import * as React from "react";
import { Caption, Sample, Samples, Stage, LOREM } from "./gallery.react.tsx";

const indicators = [
  "chevron-right-start",
  "chevron-right-next",
  "chevron-right-end",
  "chevron-down-start",
  "chevron-down-next",
  "chevron-down-end",
  "plus-start",
  "plus-next",
  "plus-end",
] satisfies readonly DisclosureIndicator[];

function Controlled() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="grid gap-3">
      <Stage>
        <Button onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {open ? "Close from outside" : "Open from outside"}
        </Button>
        <Caption>open: {String(open)}</Caption>
      </Stage>
      <Disclosure
        open={open}
        setOpen={setOpen}
        button="Controlled disclosure"
        $layer
        $border
        $rounded="xl"
        $p={3}
      >
        <p className="text-sm">{LOREM}</p>
      </Disclosure>
    </div>
  );
}

export function DisclosureSection() {
  return (
    <Samples>
      <Sample
        title="Basic"
        code='Disclosure button="Label" · defaultOpen'
        description="The button covers the disclosure frame and paints the same layer, so it is invisible until hovered. Open one to see the content slide."
      >
        <Stage direction="column">
          <Disclosure button="What is Ariakit?">
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure button="Open by default" defaultOpen>
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
        </Stage>
      </Sample>

      <Sample
        title="Framed"
        code='Disclosure $layer $border $rounded="xl" $p={3} · $kind="bevel" button'
        description="The root is a frame, so it takes a surface, a border, a radius and padding that the button and the body spend."
      >
        <Stage direction="column">
          <Disclosure
            button="Bordered card"
            $layer
            $border
            $rounded="xl"
            $p={3}
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            button={{ children: "Bevel button", $kind: "bevel" }}
            $rounded="2xl"
            $p={4}
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            button="Lifted surface"
            $layer
            $lightnessOffset
            $rounded="lg"
            $p={2}
            defaultOpen
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
        </Stage>
      </Sample>

      <Sample
        wide
        title="Indicators"
        code='DisclosureButton indicator="chevron-right-start" | ... | "plus-end" | false'
        description="A chevron pointing to the end of the row or down, or a plus that turns into a minus, at the start, right after the label, or at the end of the row."
      >
        <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
          {indicators.map((indicator) => (
            <Disclosure
              key={indicator}
              button={{ children: indicator, indicator }}
              $layer
              $border
              $rounded="xl"
              $p={3}
            >
              <p className="text-sm">Content for {indicator}.</p>
            </Disclosure>
          ))}
          <Disclosure
            button={{ children: "No indicator", indicator: false }}
            $layer
            $border
            $rounded="xl"
            $p={3}
          >
            <p className="text-sm">Content without an indicator.</p>
          </Disclosure>
        </div>
      </Sample>

      <Sample
        title="Icon and description"
        code="DisclosureButton icon description · Disclosure $iconSize"
        description="An icon takes a control slot beside the label and the body indents to the label. A description sits under the label, and the root can size the slot."
      >
        <Stage direction="column">
          <Disclosure
            $layer
            $border
            $rounded="xl"
            $p={3}
            button={
              <DisclosureButton icon={<icons.Settings strokeWidth={1.5} />}>
                Settings
              </DisclosureButton>
            }
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            $layer
            $border
            $rounded="xl"
            $p={3}
            button={
              <DisclosureButton
                icon={<icons.CreditCard strokeWidth={1.5} />}
                description="Manage the cards on this account"
              >
                Billing
              </DisclosureButton>
            }
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            $layer
            $border
            $rounded="xl"
            $p={3}
            $iconSize={8}
            button={
              <DisclosureButton
                icon={<icons.Users strokeWidth={1.5} />}
                description="A larger icon from the root, centred on its line"
              >
                Team
              </DisclosureButton>
            }
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
        </Stage>
      </Sample>

      <Sample
        title="Split and guides"
        code="Disclosure split · content={{ guide: true }} · content={{ prose: true }}"
        description="A split layout draws a rule between the button and the body. A guide runs a line under the indicator and indents the body. Prose applies the rhythm."
      >
        <Stage direction="column">
          <Disclosure
            split
            button="Split layout"
            $layer
            $border
            $rounded="xl"
            $p={3}
            defaultOpen
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            button="With a guide"
            content={{ guide: true }}
            $layer
            $border
            $rounded="xl"
            $p={3}
            defaultOpen
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            button="Prose body"
            content={{ prose: true }}
            $layer
            $border
            $rounded="xl"
            $p={3}
            defaultOpen
          >
            <p>
              <strong>Prose</strong> spaces its children on the frame-capped
              rhythm.
            </p>
            <p>{LOREM}</p>
          </Disclosure>
        </Stage>
      </Sample>

      <Sample
        title="Group"
        code="DisclosureGroup > Disclosure"
        description="Members cover the group frame and share its padding, divided by rules and running edge to edge."
      >
        <DisclosureGroup>
          <Disclosure button="First question" defaultOpen>
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure button="Second question">
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
          <Disclosure
            button={
              <DisclosureButton icon={<icons.HelpCircle strokeWidth={1.5} />}>
                Third, with an icon
              </DisclosureButton>
            }
          >
            <p className="text-sm">{LOREM}</p>
          </Disclosure>
        </DisclosureGroup>
      </Sample>

      <Sample
        title="Nested"
        code="Disclosure inside DisclosureContent"
        description="A nested disclosure resets the group and icon channels, so it lays out as a fresh root."
      >
        <Disclosure
          button="Outer"
          $layer
          $border
          $rounded="xl"
          $p={3}
          defaultOpen
        >
          <p className="text-sm">{LOREM}</p>
          <Disclosure button="Inner" $layer $border $rounded="lg" $p={2}>
            <p className="text-sm">{LOREM}</p>
            <Disclosure
              button={{ children: "Innermost", indicator: "plus-end" }}
            >
              <p className="text-sm">{LOREM}</p>
            </Disclosure>
          </Disclosure>
        </Disclosure>
      </Sample>

      <Sample
        title="Controlled"
        code="Disclosure open setOpen"
        description="The page owns the open state and can toggle it from outside."
      >
        <Controlled />
      </Sample>

      <Sample
        title="Composed parts"
        code="Disclosure > DisclosureButton + DisclosureContent"
        description="The parts written out by hand, with a custom body element."
      >
        <Disclosure $layer $border $rounded="xl" $p={3}>
          <DisclosureButton indicator="chevron-down-end">
            Composed by hand
          </DisclosureButton>
          <DisclosureContent body={{ className: "grid gap-2" }}>
            <p className="text-sm">{LOREM}</p>
            <Button $size="sm" className="w-max">
              An action in the body
            </Button>
          </DisclosureContent>
        </Disclosure>
      </Sample>

      <Sample
        title="On layers"
        code="Disclosure inside Layer"
        description="The button's hover ramp and the body's border follow the layer."
      >
        <Stage direction="column">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <Disclosure
              button="On an inverted layer"
              $layer
              $border
              $rounded="xl"
              $p={3}
              defaultOpen
            >
              <p className="text-sm">{LOREM}</p>
            </Disclosure>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <Disclosure
              split
              button="On a brand layer"
              $layer
              $border
              $rounded="xl"
              $p={3}
            >
              <p className="text-sm">{LOREM}</p>
            </Disclosure>
          </Layer>
        </Stage>
      </Sample>
    </Samples>
  );
}
