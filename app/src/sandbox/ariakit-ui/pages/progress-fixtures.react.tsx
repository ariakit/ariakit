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
  Progress,
  ProgressCircular,
} from "@ariakit/ui/components/progress.ariakit.react";
import { useState } from "react";
import { Example, ExampleGrid } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

// The old gallery's Live sample: both kinds follow one value, and the button
// wraps back to 0 after 1.
function ProgressValueChange() {
  const [value, setValue] = useState(0.2);
  const advance = () =>
    setValue((current) => (current >= 1 ? 0 : Math.min(1, current + 0.3)));
  return (
    <div className="grid w-full gap-3">
      <Progress value={value} $thickness={3} aria-label="Build bar" />
      <div className="flex items-center gap-3">
        <div className="size-14">
          <ProgressCircular
            value={value}
            $thickness={2}
            aria-label="Build ring"
          />
        </div>
        <Button onClick={advance} $rounded="lg">
          {value >= 1 ? "Reset" : "Advance"}
        </Button>
      </div>
    </div>
  );
}

export function ProgressFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Value change"
        description="Both kinds animate toward each new value."
        code={
          <>
            <Progress value={0.2} $thickness={3} />
            <ProgressCircular value={0.2} $thickness={2} />
            <Button $rounded="lg">Advance</Button>
          </>
        }
      >
        <ProgressValueChange />
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("progress-fixtures", ProgressFixturesExamples);
