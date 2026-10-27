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
      <InputField className="col-span-full">
        <InputLabel htmlFor={`${id}-email`}>Email</InputLabel>
        <Input
          id={`${id}-email`}
          type="email"
          defaultValue="ada@example.com"
          aria-invalid
          aria-describedby={`${id}-email-error ${id}-email-hint`}
        />
        {/* The danger layer puts the error on a panel with padding and rounded
            corners. The text keeps the danger color on it. */}
        <InputError id={`${id}-email-error`} $layer="danger" $mix={15}>
          Another account uses this address.{" "}
          <Link href="#sign-in">Sign in</Link> or use a different address.
        </InputError>
        <InputDescription id={`${id}-email-hint`}>
          We send a confirmation link to this address.
        </InputDescription>
      </InputField>
    </div>
  );
}
