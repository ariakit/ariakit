import * as Ariakit from "@ariakit/react";
import { useState } from "react";

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
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Cherry" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <output>{value}</output>
    </>
  );
}
