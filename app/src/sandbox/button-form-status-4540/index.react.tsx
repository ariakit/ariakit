import * as Ariakit from "@ariakit/react";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

function AriakitButton(props: Ariakit.ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Ariakit.Button type="submit" disabled={pending} {...props}>
      {pending ? "Pending" : props.children}
    </Ariakit.Button>
  );
}

interface NativeButtonProps extends ComponentProps<"button"> {
  accessibleWhenDisabled?: boolean;
}

function NativeButton({ accessibleWhenDisabled, ...props }: NativeButtonProps) {
  const { pending } = useFormStatus();
  if (accessibleWhenDisabled) {
    props["aria-disabled"] = pending;
  } else {
    props.disabled = pending;
  }
  return (
    <button type="submit" {...props}>
      {pending ? "Pending" : props.children}
    </button>
  );
}

interface FormProps extends ComponentProps<"form"> {
  label: string;
}

function Form({ label, ...props }: FormProps) {
  return (
    <form
      aria-label={label}
      action={async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }}
      {...props}
    />
  );
}

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Form label="AriakitButton">
        <AriakitButton>AriakitButton</AriakitButton>
      </Form>
      <Form label="AriakitButton focusable">
        <AriakitButton accessibleWhenDisabled>
          AriakitButton (focusable)
        </AriakitButton>
      </Form>
      <Form label="NativeButton">
        <NativeButton>NativeButton</NativeButton>
      </Form>
      <Form label="NativeButton focusable">
        <NativeButton accessibleWhenDisabled>
          NativeButton (focusable)
        </NativeButton>
      </Form>
    </div>
  );
}
