import {
  Input,
  InputDescription,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  return (
    <div className="grid w-[30rem] max-w-full grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-x-5 gap-y-6">
      <InputField>
        <InputLabel htmlFor={`${id}-username`}>Username</InputLabel>
        <Input
          id={`${id}-username`}
          defaultValue="ada"
          aria-describedby={`${id}-username-hint`}
          $edge="success"
        />
        <InputDescription id={`${id}-username-hint`} $text="success">
          The name is available.
        </InputDescription>
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-recipient`}>Recipient</InputLabel>
        <Input
          id={`${id}-recipient`}
          type="email"
          defaultValue="ada@engine.org"
          aria-describedby={`${id}-recipient-hint`}
          $edge="warning"
        />
        <InputDescription id={`${id}-recipient-hint`} $text="warning">
          This address is outside your team.
        </InputDescription>
      </InputField>
      <InputField className="col-span-full">
        <InputLabel htmlFor={`${id}-address`}>Shipping address</InputLabel>
        <Input
          id={`${id}-address`}
          defaultValue="12 Dorset Street, London"
          aria-describedby={`${id}-address-hint`}
          $layer="brand"
          $mix={15}
        />
        <InputDescription id={`${id}-address-hint`}>
          Filled from your last order.
        </InputDescription>
      </InputField>
    </div>
  );
}
