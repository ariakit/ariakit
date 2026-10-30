import {
  CheckboxDescription,
  CheckboxField,
  CheckboxLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId, useState } from "react";

export default function Example() {
  const id = useId();
  const [gift, setGift] = useState(false);
  // The field unmounts while the box is clear, so its text lives here and comes
  // back when the box is checked again.
  const [message, setMessage] = useState("");
  return (
    <div className="grid w-[24rem] max-w-full gap-4">
      <CheckboxField
        name="gift"
        checked={gift}
        onChange={(event) => setGift(event.target.checked)}
      >
        <CheckboxLabel>This order is a gift</CheckboxLabel>
        <CheckboxDescription>
          The receipt leaves out the prices
        </CheckboxDescription>
      </CheckboxField>
      {/* The field comes right after the checkbox, so Tab moves into it
          next. */}
      {gift && (
        <InputField>
          <InputLabel htmlFor={id}>Gift message</InputLabel>
          <Input
            id={id}
            name="giftMessage"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </InputField>
      )}
    </div>
  );
}
