import * as Ariakit from "@ariakit/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { SelectPopover } from "../_select-shared.tsx";

export default function Example() {
  const [submittedValue, setSubmittedValue] = useState("");
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = data.get("fruit");
    setSubmittedValue(typeof value === "string" ? value : "null");
  };
  return (
    <form onSubmit={onSubmit}>
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select name="fruit" disabled className="pointer-events-none" />
        <SelectPopover />
      </Ariakit.SelectProvider>
      <button type="submit">Submit</button>
      <output aria-live="polite">
        {submittedValue && `Submitted: ${submittedValue}`}
      </output>
    </form>
  );
}
