import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Checkbox } from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Skeleton,
  SkeletonFill,
  useSkeletonState,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { RotateCw } from "lucide-react";
import type { ReactElement } from "react";
import { useRequest } from "../use-request.ts";

const account = {
  name: "Ana Souza",
  email: "ana@example.com",
  website: "anasouza.dev",
  updates: true,
};

export default function Example() {
  const { data, loading, reload } = useRequest(account);
  return (
    <div className="grid w-[26rem] max-w-full gap-3">
      <Frame
        $layer
        $lighten
        $rounded="xl"
        $border
        $p={5}
        render={
          <section aria-labelledby="account-heading" aria-busy={loading} />
        }
        className="shadow-xs"
      >
        <p role="status" className="sr-only">
          {loading ? "Loading account" : "Account loaded"}
        </p>
        {/* Labels stay visible while the values load, so each field keeps its
            accessible name and the form keeps its shape. */}
        <Skeleton
          loading={loading}
          render={<form onSubmit={(event) => event.preventDefault()} />}
          className="grid gap-4"
        >
          <HeadingLevel level={3}>
            <Heading id="account-heading" $level={4}>
              Account
            </Heading>
          </HeadingLevel>
          <Field label="Name">
            <Input name="name" defaultValue={data?.name} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={data?.email} />
          </Field>
          <Field label="Website">
            <Input name="website" type="url" defaultValue={data?.website} />
          </Field>
          <label className="flex items-center gap-2.5 text-sm">
            <SkeletonFill>
              <Checkbox name="updates" defaultChecked={data?.updates} />
            </SkeletonFill>
            Email me about product updates
          </label>
          <SaveButton />
        </Skeleton>
      </Frame>
      <Button onClick={reload} className="justify-self-center">
        <ButtonSlot aria-hidden>
          <RotateCw />
        </ButtonSlot>
        <ButtonLabel>Reload account</ButtonLabel>
      </Button>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactElement;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <SkeletonFill>{children}</SkeletonFill>
    </label>
  );
}

// Content outside skeleton parts reads the state to stay in step with them.
function SaveButton() {
  const state = useSkeletonState();
  return (
    <Button
      type="submit"
      $layer="brand"
      $kind="bevel"
      disabled={state !== "content"}
      className="justify-self-end"
    >
      Save changes
    </Button>
  );
}
