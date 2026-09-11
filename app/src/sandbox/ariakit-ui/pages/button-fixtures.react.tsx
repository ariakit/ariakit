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
  ButtonGroup,
} from "@ariakit/ui/components/button.ariakit.react";
import { button, buttonGroup } from "@ariakit/ui/styles/button";
import { Example, ExampleGrid } from "../example.react.tsx";

const groups = [
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

// Migrated from the button-group-layout sandbox without changes: raw
// @ariakit/react buttons styled through the recipes, in groups that set every
// zero-length padding form. The box around it is a frame with enough padding
// that the groups keep the radius they have at the top level.
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
                {...button.jsx({ $border: 2, $borderType: "border" })}
              >
                {label}
              </ak.Button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ButtonFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Button group layout"
        description="Ten groups of bordered buttons: gapless rows that join, a padded row, and spaced, vertical and wrapping rows that keep their corners."
        code={
          <ButtonGroup $border={2} $layout="horizontal" $gap="auto" $p="none">
            <Button $border={2} $borderType="border">
              Day
            </Button>
            <Button $border={2} $borderType="border">
              Week
            </Button>
            <Button $border={2} $borderType="border">
              Month
            </Button>
          </ButtonGroup>
        }
      >
        <ButtonGroupLayout />
      </Example>
    </ExampleGrid>
  );
}

export default ButtonFixturesExamples;
