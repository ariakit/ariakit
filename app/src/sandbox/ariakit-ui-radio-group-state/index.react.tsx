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
} from "@ariakit/ui/components/radio.ariakit.react";
import { useState } from "react";

export default function Example() {
  const [size, setSize] = useState<ak.RadioStoreState["value"]>("m");
  const billingStore = ak.useRadioStore({ defaultValue: "monthly" });
  const billing = ak.useStoreState(billingStore, "value");
  return (
    <div className="grid gap-8">
      <RadioGroup label="Plan" defaultValue="pro" className="grid gap-2">
        <RadioField value="hobby">Hobby</RadioField>
        <RadioField value="pro">Pro</RadioField>
        <RadioField value="enterprise">Enterprise</RadioField>
      </RadioGroup>

      <RadioGroup
        label={
          <>
            Notifications <small>(optional)</small>
          </>
        }
        defaultValue="email"
        className="flex gap-4"
      >
        <RadioField value="email">Email</RadioField>
        <RadioField value="none">None</RadioField>
      </RadioGroup>

      <RadioGroup
        label="Theme"
        aria-label="Color theme"
        defaultValue="light"
        className="flex gap-4"
      >
        <RadioField value="light">Light</RadioField>
        <RadioField value="dark">Dark</RadioField>
      </RadioGroup>

      <div className="grid gap-2">
        <RadioGroup
          label="Size"
          value={size}
          setValue={setSize}
          className="flex gap-4"
        >
          <RadioField value="s">Small</RadioField>
          <RadioField value="m">Medium</RadioField>
          <RadioField value="l">Large</RadioField>
        </RadioGroup>
        <p>Selected size: {size}</p>
        <Button onClick={() => setSize("s")}>Reset size</Button>
      </div>

      <div className="grid gap-2">
        <RadioCardGrid label="Billing" store={billingStore}>
          <RadioCard value="monthly">
            <RadioCardLabel>Monthly</RadioCardLabel>
          </RadioCard>
          <RadioCard value="yearly">
            <RadioCardLabel>Yearly</RadioCardLabel>
          </RadioCard>
        </RadioCardGrid>
        <p>Billing: {billing}</p>
      </div>

      <RadioGroup
        label="Shipping"
        defaultValue="express"
        className="grid gap-2"
      >
        <RadioField value="standard">Standard</RadioField>
        <RadioField value="express">Express</RadioField>
        <RadioGroup
          label="Delivery window"
          defaultValue="morning"
          className="grid gap-2 ps-6"
        >
          <RadioField value="morning">Morning</RadioField>
          <RadioField value="evening">Evening</RadioField>
        </RadioGroup>
      </RadioGroup>

      <ak.Toolbar aria-label="Formatting" className="flex items-center gap-4">
        <ak.ToolbarItem render={<Button />}>Bold</ak.ToolbarItem>
        <RadioGroup
          label="Alignment"
          defaultValue="start"
          className="flex items-center gap-4"
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
