import {
  Input,
  InputDescription,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Display name</InputLabel>
      <Input id={id} defaultValue="Ada Lovelace" aria-describedby={hintId} />
      <InputDescription id={hintId}>
        Shown on your profile and next to your comments.
      </InputDescription>
    </InputField>
  );
}
