import * as Ariakit from "@ariakit/react";
import type { ComponentProps, MouseEvent } from "react";
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

function NativeButton({
  accessibleWhenDisabled,
  onClick,
  ...props
}: NativeButtonProps) {
  const { pending } = useFormStatus();
  const disabledProps = accessibleWhenDisabled
    ? { "aria-disabled": pending }
    : { disabled: pending };
  return (
    <button
      type="submit"
      {...props}
      {...disabledProps}
      onClick={(event) => {
        if (accessibleWhenDisabled && pending) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
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

function countClicks(event: MouseEvent<HTMLButtonElement>) {
  const { currentTarget } = event;
  const clickCount = Number(currentTarget.dataset.clickCount ?? 0) + 1;
  currentTarget.dataset.clickCount = String(clickCount);
}

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Form label="AriakitButton">
        <AriakitButton>AriakitButton</AriakitButton>
      </Form>
      <Form label="AriakitButton rendered submit">
        <AriakitButton type="button" render={<button type="submit" />}>
          AriakitButton rendered submit
        </AriakitButton>
      </Form>
      <Form label="AriakitButton focusable">
        <AriakitButton accessibleWhenDisabled onClick={countClicks}>
          AriakitButton (focusable)
        </AriakitButton>
      </Form>
      <Form label="NativeButton">
        <NativeButton>NativeButton</NativeButton>
      </Form>
      <Form label="NativeButton focusable">
        <NativeButton accessibleWhenDisabled onClick={countClicks}>
          NativeButton (focusable)
        </NativeButton>
      </Form>
    </div>
  );
}
