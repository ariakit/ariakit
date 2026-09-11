import {
  ComboboxSelectButton,
  ComboboxSelectItem,
  ComboboxSelectLabel,
  ComboboxSelectPopover,
  ComboboxSelectProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { useState } from "react";

export default function ConditionalContent() {
  const [labels, setLabels] = useState(false);
  const icon = labels && <span aria-hidden>★</span>;
  return (
    <section aria-label="Conditional status content" className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={labels}
          onChange={(event) => setLabels(event.target.checked)}
        />
        Show status labels
      </label>
      <ComboboxSelectProvider defaultValue="Open">
        <ComboboxSelectLabel>Status filter</ComboboxSelectLabel>
        <ComboboxSelectButton
          chevron={false}
          icon={icon}
          displayValue={labels && "Custom status"}
        >
          {labels && "Status summary"}
        </ComboboxSelectButton>
        <ComboboxSelectPopover>
          <ComboboxSelectItem value="Open" checkmark={false} icon={icon}>
            {labels && "Open status"}
          </ComboboxSelectItem>
          <ComboboxSelectItem value="Closed" checkmark={false} icon={icon}>
            {labels && "Closed status"}
          </ComboboxSelectItem>
          <ComboboxSelectItem value="No activity" checkmark={false} icon={0} />
          <ComboboxSelectItem
            value="Blank"
            aria-label="Blank status"
            checkmark={false}
          >
            {""}
          </ComboboxSelectItem>
        </ComboboxSelectPopover>
        {/*
         * A false display value falls through to children, and an icon of 0
         * stays.
         */}
        <ComboboxSelectButton
          aria-label="Status summary"
          displayValue={false}
          chevron={false}
          icon={0}
        >
          Summary
        </ComboboxSelectButton>
        {/*
         * An explicit empty string requests blank content instead of a
         * fallback.
         */}
        <ComboboxSelectButton
          aria-label="Blank display"
          displayValue=""
          chevron={false}
        >
          Fallback
        </ComboboxSelectButton>
        <ComboboxSelectButton aria-label="Blank summary" chevron={false}>
          {""}
        </ComboboxSelectButton>
      </ComboboxSelectProvider>
    </section>
  );
}
