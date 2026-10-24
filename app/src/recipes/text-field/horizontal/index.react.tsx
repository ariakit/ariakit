import {
  Input,
  InputDescription,
  InputError,
  InputField,
  InputFieldContent,
  InputFieldGrid,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  return (
    // The labels share a column that fits the longest one, and they align to
    // its end, so each label sits next to its own field.
    <InputFieldGrid className="w-[32rem] max-w-full">
      <InputField $orientation="horizontal">
        <InputLabel htmlFor={`${id}-full-name`}>Full name</InputLabel>
        <InputFieldContent>
          <Input
            id={`${id}-full-name`}
            defaultValue="Augusta Ada King"
            aria-describedby={`${id}-full-name-hint`}
          />
          <InputDescription id={`${id}-full-name-hint`}>
            Used on invoices.
          </InputDescription>
        </InputFieldContent>
      </InputField>
      <InputField $orientation="horizontal">
        <InputLabel htmlFor={`${id}-billing-email`}>Billing email</InputLabel>
        <InputFieldContent>
          <Input
            id={`${id}-billing-email`}
            type="email"
            defaultValue="ada@engine.org"
          />
        </InputFieldContent>
      </InputField>
      <InputField $orientation="horizontal">
        <InputLabel htmlFor={`${id}-phone`}>Phone</InputLabel>
        <InputFieldContent>
          <Input
            id={`${id}-phone`}
            type="tel"
            defaultValue="+44 20"
            aria-invalid
            aria-describedby={`${id}-phone-error`}
          />
          <InputError id={`${id}-phone-error`}>
            Enter the full number.
          </InputError>
        </InputFieldContent>
      </InputField>
    </InputFieldGrid>
  );
}
