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
        {/* Yellow is too light for a 3:1 edge on light layers. The push
            darkens it there and lightens it on dark layers. */}
        <Input
          id={`${id}-recipient`}
          type="email"
          defaultValue="ada@engine.org"
          aria-describedby={`${id}-recipient-hint`}
          $edge="warning"
          $edgePush={20}
        />
        <InputDescription id={`${id}-recipient-hint`} $text="warning">
          This address is outside your team.
        </InputDescription>
      </InputField>
      <InputField className="col-span-full">
        <InputLabel htmlFor={`${id}-address`}>Shipping address</InputLabel>
        {/* A colored fill changes the field's lightness, so an edge of the same
            color keeps the 3:1 boundary on light and dark layers. */}
        <Input
          id={`${id}-address`}
          defaultValue="12 Dorset Street, London"
          aria-describedby={`${id}-address-hint`}
          $layer="brand"
          $mix={15}
          $edge="brand"
        />
        <InputDescription id={`${id}-address-hint`}>
          Filled from your last order.
        </InputDescription>
      </InputField>
    </div>
  );
}
