import {
  Input,
  InputDescription,
  InputError,
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
        <Input id={`${id}-username`} defaultValue="ada" />
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-name`}>Display name</InputLabel>
        <Input
          id={`${id}-name`}
          defaultValue="Ada Lovelace"
          aria-describedby={`${id}-name-hint`}
        />
        <InputDescription id={`${id}-name-hint`}>
          Shown on your profile.
        </InputDescription>
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-email`}>Email</InputLabel>
        <Input
          id={`${id}-email`}
          type="email"
          defaultValue="ada.lovelace"
          aria-invalid
          aria-describedby={`${id}-email-error ${id}-email-hint`}
        />
        <InputError id={`${id}-email-error`}>
          Enter an email address.
        </InputError>
        <InputDescription id={`${id}-email-hint`}>
          Used to sign in.
        </InputDescription>
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-workspace`}>Workspace</InputLabel>
        <Input
          id={`${id}-workspace`}
          defaultValue="analytical-engine"
          disabled
          aria-describedby={`${id}-workspace-hint`}
        />
        <InputDescription id={`${id}-workspace-hint`}>
          Only owners can rename it.
        </InputDescription>
      </InputField>
    </div>
  );
}
