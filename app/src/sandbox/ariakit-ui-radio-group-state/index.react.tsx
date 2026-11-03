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
import {
  RadioCard,
  RadioCardGrid,
  RadioCardLabel,
  RadioField,
  RadioGroup,
  RadioList,
} from "@ariakit/ui/components/radio.ariakit.react";
import { useState } from "react";

export default function Example() {
  const [size, setSize] = useState<ak.RadioStoreState["value"]>("m");
  const billingStore = ak.useRadioStore({ defaultValue: "monthly" });
  const billing = ak.useStoreState(billingStore, "value");
  return (
    <div className="grid gap-8">
      <RadioGroup label="Plan" defaultValue="pro">
        <RadioList>
          <RadioField value="hobby">Hobby</RadioField>
          <RadioField value="pro">Pro</RadioField>
          <RadioField value="enterprise">Enterprise</RadioField>
        </RadioList>
      </RadioGroup>

      {/* The rows below put the label on the row of the radios, so the group
          gap spaces all of them. */}
      <RadioGroup
        label={
          <>
            Notifications <small>(optional)</small>
          </>
        }
        defaultValue="email"
        $gap="xl"
        className="flex-row"
      >
        <RadioField value="email">Email</RadioField>
        <RadioField value="none">None</RadioField>
      </RadioGroup>

      <RadioGroup
        label="Theme"
        aria-label="Color theme"
        defaultValue="light"
        $gap="xl"
        className="flex-row"
      >
        <RadioField value="light">Light</RadioField>
        <RadioField value="dark">Dark</RadioField>
      </RadioGroup>

      <div className="grid gap-2">
        <RadioGroup
          label="Size"
          value={size}
          setValue={setSize}
          $gap="xl"
          className="flex-row"
        >
          <RadioField value="s">Small</RadioField>
          <RadioField value="m">Medium</RadioField>
          <RadioField value="l">Large</RadioField>
        </RadioGroup>
        <p>Selected size: {size}</p>
        <Button onClick={() => setSize("s")}>Reset size</Button>
      </div>

      <div className="grid gap-2">
        <RadioGroup label="Billing" store={billingStore}>
          <RadioCardGrid>
            <RadioCard value="monthly">
              <RadioCardLabel>Monthly</RadioCardLabel>
            </RadioCard>
            <RadioCard value="yearly">
              <RadioCardLabel>Yearly</RadioCardLabel>
            </RadioCard>
          </RadioCardGrid>
        </RadioGroup>
        <p>Billing: {billing}</p>
      </div>

      <RadioGroup label="Shipping" defaultValue="express">
        <RadioList>
          <RadioField value="standard">Standard</RadioField>
          <RadioField value="express">Express</RadioField>
          {/* The nested group starts where the text of Express starts: after
              the box and the gap of a field without padding. */}
          <RadioGroup
            label="Delivery window"
            defaultValue="morning"
            className="ps-[1.4375em]"
          >
            <RadioList>
              <RadioField value="morning">Morning</RadioField>
              <RadioField value="evening">Evening</RadioField>
            </RadioList>
          </RadioGroup>
        </RadioList>
      </RadioGroup>

      <ak.Toolbar aria-label="Formatting" className="flex items-center gap-4">
        <ak.ToolbarItem render={<Button />}>Bold</ak.ToolbarItem>
        <RadioGroup
          label="Alignment"
          defaultValue="start"
          $gap="xl"
          className="flex-row items-center"
        >
          <RadioField value="start">Start</RadioField>
          <RadioField value="center">Center</RadioField>
          <RadioField value="end">End</RadioField>
        </RadioGroup>
        <ak.ToolbarItem render={<Button />}>Italic</ak.ToolbarItem>
      </ak.Toolbar>
    </div>
  );
}
