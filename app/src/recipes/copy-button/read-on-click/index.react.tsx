import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";
import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId, useRef } from "react";

export default function Example() {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Release note</InputLabel>
      <Input
        id={id}
        render={<textarea ref={ref} rows={3} />}
        defaultValue="Fixed the focus order of the settings dialog."
      />
      <div>
        <CopyButton value={() => ref.current?.value ?? ""} $border>
          Copy note
        </CopyButton>
      </div>
    </InputField>
  );
}
