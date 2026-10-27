import {
  Input,
  InputDescription,
  InputError,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Email</InputLabel>
      <Input
        id={id}
        type="email"
        defaultValue="ada@engine.org"
        aria-invalid
        aria-describedby={`${errorId} ${hintId}`}
      />
      {/* The danger layer puts the error on a panel with padding and rounded
          corners. The text keeps the danger color on it. */}
      <InputError id={errorId} $layer="danger" $mix={15}>
        Another account uses this address. <Link href="#sign-in">Sign in</Link>{" "}
        or use a different address.
      </InputError>
      <InputDescription id={hintId}>
        We send a confirmation link to this address.
      </InputDescription>
    </InputField>
  );
}
