import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputGroup,
  InputLabel,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Password</InputLabel>
      <InputGroup>
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          defaultValue="correct horse battery"
          aria-describedby={`${id}-hint`}
        />
        <InputSlot $size="2xl">
          {/* The name stays the same, and aria-pressed tells whether the
              password shows. */}
          <Button
            type="button"
            aria-label="Show password"
            aria-pressed={visible}
            aria-controls={id}
            $size="sm"
            onClick={() => setVisible((value) => !value)}
          >
            <ButtonSlot>{visible ? <EyeOff /> : <Eye />}</ButtonSlot>
          </Button>
        </InputSlot>
      </InputGroup>
      <InputDescription id={`${id}-hint`}>
        Use at least 12 characters.
      </InputDescription>
    </InputField>
  );
}
