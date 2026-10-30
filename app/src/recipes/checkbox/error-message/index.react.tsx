import { CheckboxField } from "@ariakit/ui/components/checkbox.ariakit.react";
import { InputError } from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="grid w-[24rem] max-w-full gap-2">
      {/* The error describes the checkbox, and aria-invalid stays only while
          the error shows. */}
      <CheckboxField
        name="terms"
        required
        aria-invalid
        aria-describedby={errorId}
      >
        I agree to the terms of service
      </CheckboxField>
      <InputError id={errorId}>
        Check the box to create your account.
      </InputError>
    </div>
  );
}
