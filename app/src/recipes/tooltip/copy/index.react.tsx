import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";
import {
  Input,
  InputField,
  InputGroup,
  InputLabel,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

const INVITE_LINK = "https://ariakit.com/invite/7f3k2";

export default function Example() {
  const id = useId();
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Invite link</InputLabel>
      <InputGroup>
        <Input id={id} readOnly value={INVITE_LINK} />
        <InputSlot $size="2xl">
          {/* The tooltip stays open after the click and confirms the copy. */}
          <CopyButton
            value={INVITE_LINK}
            label="Copy link"
            failedLabel="Couldn't copy the link"
            $size="sm"
          />
        </InputSlot>
      </InputGroup>
    </InputField>
  );
}
