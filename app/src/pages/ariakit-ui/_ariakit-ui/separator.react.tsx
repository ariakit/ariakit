/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react.tsx";
import type { SeparatorProps } from "@ariakit/ui/components/separator.ariakit.react.tsx";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react.tsx";
import { Sample, Samples } from "./gallery.react.tsx";

function Divided(props: SeparatorProps) {
  return (
    <Prose $gap={3}>
      <p>The paragraph before the rule.</p>
      <Separator {...props} />
      <p>The paragraph after it drops its own top margin.</p>
    </Prose>
  );
}

export function SeparatorSection() {
  return (
    <Samples>
      <Sample
        title="Line"
        code='$line="dashed" | "solid" | "dotted"'
        description="Dashed is the default. The rule takes half the rhythm of the column around it."
      >
        <div className="grid gap-6">
          <Divided />
          <Divided $line="solid" />
          <Divided $line="dotted" />
        </div>
      </Sample>

      <Sample
        title="Gap"
        code="$gap={1} | $gap={6}"
        description="Explicit space on each side of the rule, replacing the rhythm-derived one."
      >
        <div className="grid gap-6">
          <Divided $gap={1} />
          <Divided $gap={6} />
        </div>
      </Sample>

      <Sample
        title="Edge"
        code='$edgeWeight="light" | "bold" · $edge="brand"'
        description="The rule paints in the edge color, so every edge knob applies."
      >
        <div className="grid gap-6">
          <Divided $edgeWeight="light" />
          <Divided $edgeWeight="bold" />
          <Divided $edge="brand" $edgeWeight="bold" $line="solid" />
        </div>
      </Sample>

      <Sample
        title="Outside a column"
        code="Separator between blocks · on layers"
        description="Without a prose gap the rule falls back to a fixed rhythm. On a colored or inverted layer its edge follows that layer."
      >
        <div className="grid gap-4">
          <div>
            <p className="text-sm">A plain block.</p>
            <Separator />
            <p className="text-sm">Another plain block.</p>
          </div>
          <Layer $invert className="rounded-xl px-4 py-1">
            <p className="text-sm">On an inverted layer.</p>
            <Separator $line="solid" />
            <p className="text-sm">The rule follows the layer's edge.</p>
          </Layer>
          <Layer $layer="brand" className="rounded-xl px-4 py-1">
            <p className="text-sm">On a brand layer.</p>
            <Separator $edgeWeight="bold" />
            <p className="text-sm">Bold weight on a colored surface.</p>
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
