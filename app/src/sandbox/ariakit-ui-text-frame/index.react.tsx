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
  Button,
  ButtonLabel,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

export default function TextFrameExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Section label"
        description="A text frame pads like the buttons under it, so its text starts on the same pixel as their labels. A plain frame with the same padding starts its text closer to the edge."
        code={`
          <TextFrame $p={2} $rounded="md" $ink={60}>Workspace</TextFrame>
          <Button>Inbox</Button>
          <Frame $p={2} $rounded="md" $ink={60}>Archive</Frame>
        `}
      >
        <div className="grid w-52 gap-1">
          <TextFrame $p={2} $rounded="md" $ink={60} className="font-medium">
            Workspace
          </TextFrame>
          <Button className="justify-start">
            <ButtonLabel>Inbox</ButtonLabel>
          </Button>
          <Button className="justify-start">
            <ButtonLabel>Drafts</ButtonLabel>
          </Button>
          <Frame $p={2} $rounded="md" $ink={60} className="font-medium">
            Archive
          </Frame>
        </div>
      </Example>
      <Example
        title="Side padding steps"
        description="The named $px steps scale the optical extra on the sides. A pill looks best with more of it."
        code={`
          <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="sm">sm</TextFrame>
          <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="md">md</TextFrame>
          <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="lg">lg</TextFrame>
          <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="xl">xl</TextFrame>
        `}
      >
        <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="sm">
          Small extra
        </TextFrame>
        <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="md">
          Medium extra
        </TextFrame>
        <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="lg">
          Large extra
        </TextFrame>
        <TextFrame $p={2} $rounded="full" $border $lightnessOffset $px="xl">
          Extra large extra
        </TextFrame>
      </Example>
    </ExampleGrid>
  );
}
