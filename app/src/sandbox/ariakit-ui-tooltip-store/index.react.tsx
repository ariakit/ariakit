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
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import type { ReactNode } from "react";
import { useState } from "react";

// The store holds the tooltip open, and it stays open while the text is empty,
// so the tooltip shows when the text arrives.
function HeldOpen() {
  const store = ak.useTooltipStore({ open: true, placement: "bottom" });
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid justify-items-start gap-12">
      <Tooltip store={store} text={saved ? "Saved a minute ago" : null}>
        <Button $kind="bevel">Status</Button>
      </Tooltip>
      <Button $kind="bevel" onClick={() => setSaved(true)}>
        Save
      </Button>
    </div>
  );
}

interface DisclosureProps {
  name: string;
  text: ReactNode;
}

// The disclosure takes its store from the context of the dialog, so the tooltip
// must not replace that context.
function Disclosure({ name, text }: DisclosureProps) {
  return (
    <ak.DialogProvider>
      <Tooltip text={text}>
        <ak.DialogDisclosure render={<Button $kind="bevel" />}>
          {name}
        </ak.DialogDisclosure>
      </Tooltip>
      <ak.Dialog modal={false} aria-label={`${name} dialog`}>
        Details
      </ak.Dialog>
    </ak.DialogProvider>
  );
}

export default function Example() {
  return (
    <div className="grid justify-items-start gap-12">
      <HeldOpen />
      <Disclosure name="No text" text={null} />
      <Disclosure name="With text" text="More details" />
    </div>
  );
}
