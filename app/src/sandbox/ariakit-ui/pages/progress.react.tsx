/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Progress,
  ProgressCircular,
} from "@ariakit/ui/components/progress.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { useId } from "react";
import { Example, ExampleGrid } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

export function ProgressExamples() {
  const uploadLabelId = useId();
  const syncLabelId = useId();
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="The track and the fill at a partial value, named by the visible label above the bar."
        stretch
      >
        <div className="grid gap-2">
          <div className="flex justify-between gap-2 text-sm">
            <span id={uploadLabelId}>Uploading report.pdf</span>
            <span>65%</span>
          </div>
          <Progress value={0.65} aria-labelledby={uploadLabelId} />
        </div>
      </Example>

      <Example
        title="No value"
        description="Without a value, the bar has no aria-valuenow and reads as indeterminate. It has no indeterminate style, so the track stays empty."
        stretch
      >
        <Progress aria-label="Loading results" />
      </Example>

      <Example
        title="Thick bar"
        description="A number scales the spacing token, and the rounded ends of the fill scale with it."
        stretch
      >
        <Progress value={0.6} $thickness={4} aria-label="Storage used" />
      </Example>

      <Example
        title="Hairline bar"
        description="A length is used as is, so the bar keeps its height at any text size."
        stretch
      >
        <Progress value={0.6} $thickness="2px" aria-label="Page loading" />
      </Example>

      <Example
        title="Bold edge"
        description="The edge of the track shows only in high contrast by default. A bold weight always shows it, inside the track, under the fill."
        stretch
      >
        <Progress value={0.5} $edgeWeight="bold" aria-label="Profile setup" />
      </Example>

      <Example
        title="Borderless track"
        description="Without a border, the track has no edge, even in high contrast and inside a bordered box."
        stretch
      >
        <Progress value={0.5} $border={false} aria-label="Upload" />
      </Example>

      <Example
        title="Soft corners"
        description="The fill follows the track's radius, so a less rounded track also squares the end of the fill."
        stretch
      >
        <Progress
          value={0.5}
          $rounded="sm"
          $thickness={3}
          aria-label="Import progress"
        />
      </Example>

      <Example
        title="Tinted track"
        description="A colored track. The fill contrasts against the tinted track instead of the page, so its shade moves away from the track's."
        stretch
      >
        <Progress
          value={0.5}
          $layer="brand"
          $mix={20}
          aria-label="Monthly quota"
        />
      </Example>

      <Example
        title="Ring with label"
        description="The ring fills its box. Its children sit in the middle, on the disc that paints the parent surface back."
      >
        <div className="size-16">
          <ProgressCircular value={0.7} aria-label="Photo backup">
            <Text>70%</Text>
          </ProgressCircular>
        </div>
      </Example>

      <Example
        title="Thick ring"
        description="The thickness sets the ring width. The mask of the arc and the inset of the disc follow it."
      >
        <div className="size-24">
          <ProgressCircular
            value={0.35}
            $thickness={6}
            aria-label="Weekly goal"
          />
        </div>
      </Example>

      <Example
        title="Outlined ring"
        description="A bold edge draws the track's ring outside and the disc's ring inside, in one color. The arc covers both where it reaches."
      >
        <div className="size-16">
          <ProgressCircular
            value={0.55}
            $edgeWeight="bold"
            aria-label="Survey completion"
          />
        </div>
      </Example>

      <Example
        title="Inline status ring"
        description="A ring the size of the text, with a thin stroke, named by the status line beside it."
      >
        <div className="flex items-center gap-2">
          <div className="size-5 shrink-0">
            <ProgressCircular
              value={0.4}
              $thickness={1}
              aria-labelledby={syncLabelId}
            />
          </div>
          <span id={syncLabelId}>Syncing 2 of 5 folders</span>
        </div>
      </Example>

      <Example
        title="Completed ring"
        description="At 1 the arc closes the full turn with no seam at the top."
      >
        <div className="size-16">
          <ProgressCircular value={1} aria-label="Upload complete" />
        </div>
      </Example>

      <Example
        title="Ring at zero"
        description="An empty ring paints only its track, with no mark at the top where the arc starts."
      >
        <div className="size-16">
          <ProgressCircular value={0} aria-label="Not started" />
        </div>
      </Example>

      <Example
        title="Ring on a brand layer"
        description="The disc paints the brand surface around the ring back, not the page. The arc and the label contrast against the brand color."
      >
        <Frame $layer="brand" $rounded="xl" $p={4}>
          <div className="size-16">
            <ProgressCircular value={0.6} aria-label="Course progress">
              <Text>60%</Text>
            </ProgressCircular>
          </div>
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("progress", ProgressExamples);
