/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";
import { useState } from "react";

function SensitiveValue() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        I understand this key is secret
      </label>
      <CopyButton
        value="secret"
        label="Copy secret"
        onClick={(event) => {
          // The copy doesn't run until the person confirms.
          if (!confirmed) event.preventDefault();
        }}
      />
    </div>
  );
}

function BrokenValue() {
  const readValue = () => {
    throw new Error("The value isn't available");
  };
  return <CopyButton value={readValue} label="Copy broken value" />;
}

export default function Example() {
  return (
    <div className="flex flex-col items-start gap-6">
      <SensitiveValue />
      <CopyButton value="default label" />
      <BrokenValue />
    </div>
  );
}
