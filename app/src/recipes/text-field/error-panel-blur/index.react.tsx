import {
  Input,
  InputDescription,
  InputError,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId, useState } from "react";

export default function Example() {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [value, setValue] = useState("ada lovelace");
  const [touched, setTouched] = useState(false);
  const error = touched && /\s/.test(value) ? "Remove the spaces." : null;
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Username</InputLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${errorId} ${hintId}` : hintId}
      />
      {/* The error appears when focus leaves the field, so the alert stays
          rendered before its text. While it holds null, the panel is visually
          hidden, so no empty box shows. */}
      <InputError id={errorId} role="alert" $layer="danger" $mix={15}>
        {error}
      </InputError>
      <InputDescription id={hintId}>
        Use letters, numbers, and dashes.
      </InputDescription>
    </InputField>
  );
}
