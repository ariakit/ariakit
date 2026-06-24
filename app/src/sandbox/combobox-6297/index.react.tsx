import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";
import { useState } from "react";

function onItemKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  const modifier = event.ctrlKey || event.metaKey;
  if (!modifier) return;
  if (event.key.length !== 1) return;
  // TODO: Remove this workaround after
  // https://github.com/ariakit/ariakit/issues/6297 is fixed.
  // Let paste through so Ariakit can move focus to the input first.
  if (event.key.toLowerCase() === "v") return;
  event.preventDefault();
}

export default function Example() {
  const [value, setValue] = useState("");

  return (
    <>
      <Ariakit.ComboboxProvider
        virtualFocus={false}
        value={value}
        setValue={setValue}
      >
        <Ariakit.ComboboxLabel>Fruit</Ariakit.ComboboxLabel>
        <Ariakit.Combobox autoComplete="inline" />
        <Ariakit.ComboboxPopover>
          <Ariakit.ComboboxItem value="Apple" onKeyDown={onItemKeyDown} />
          <Ariakit.ComboboxItem value="Banana" onKeyDown={onItemKeyDown} />
          <Ariakit.ComboboxItem value="Cherry" onKeyDown={onItemKeyDown} />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <output>{value}</output>
    </>
  );
}
