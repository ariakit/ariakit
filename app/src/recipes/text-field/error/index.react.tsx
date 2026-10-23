import {
  Input,
  InputDescription,
  InputError,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Email</InputLabel>
      {/* The error comes first in the description, and aria-invalid stays only
          while the error shows. */}
      <Input
        id={id}
        type="email"
        defaultValue="ada.lovelace"
        aria-invalid
        aria-describedby={`${errorId} ${hintId}`}
      />
      <InputError id={errorId}>
        Enter an email address like ada@example.com.
      </InputError>
      <InputDescription id={hintId}>
        We send a confirmation link to this address.
      </InputDescription>
    </InputField>
  );
}
