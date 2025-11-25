import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { ComponentProps, CSSProperties } from "react";

type CheckboxProps = Pick<
  Ariakit.CheckboxProps,
  "name" | "value" | "checked" | "onChange" | "defaultChecked" | "disabled"
>;

export interface CheckboxCardProps
  extends CheckboxProps,
    Omit<ComponentProps<"label">, keyof CheckboxProps> {
  variant?: "default" | "vertical" | "round";
}

export function CheckboxCard({
  children,
  name,
  value,
  checked,
  onChange,
  defaultChecked,
  disabled,
  variant = "default",
  ...props
}: CheckboxCardProps) {
  return (
    <label
      {...props}
      className={clsx(
        "ak-checkbox-card",
        variant === "vertical" && "ak-checkbox-card-vertical",
        variant === "round" && "ak-checkbox-card-round",
        props.className,
      )}
    >
      <Ariakit.Checkbox
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        defaultChecked={defaultChecked}
        disabled={disabled}
        // By default, native checkboxes don't activate with the Enter key. But
        // since this custom one is styled as a button, it would confuse sighted
        // keyboard users if Enter didn't work.
        clickOnEnter
        // Making the checkbox focusable when disabled allows its checked state
        // to be passed to FormData.
        accessibleWhenDisabled
      />
      {children}
    </label>
  );
}

export interface CheckboxCardCheckProps extends ComponentProps<"div"> {}

export function CheckboxCardCheck({ ...props }: CheckboxCardCheckProps) {
  return (
    <div
      {...props}
      className={clsx("ak-checkbox-card-check", props.className)}
    />
  );
}

type Value = Ariakit.CheckboxStoreState["value"];

export interface CheckboxCardGridProps<T extends Value = Value>
  extends Omit<ComponentProps<"div">, "defaultValue">,
    Pick<
      Ariakit.CheckboxProviderProps<T>,
      "value" | "setValue" | "defaultValue"
    > {
  minItemWidth?: string;
}

export function CheckboxCardGrid<T extends Value = Value>({
  value,
  setValue,
  defaultValue,
  minItemWidth = "10rem",
  ...props
}: CheckboxCardGridProps<T>) {
  return (
    <Ariakit.CheckboxProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue!}
    >
      <div
        {...props}
        style={{ "--min-w": minItemWidth, ...props.style } as CSSProperties}
        className={clsx(
          "ak-checkbox-card-grid ak-checkbox-card-grid-min-w-(length:--min-w)",
          props.className,
        )}
      />
    </Ariakit.CheckboxProvider>
  );
}

export interface CheckboxCardLabelProps extends ComponentProps<"div"> {}

export function CheckboxCardLabel(props: CheckboxCardLabelProps) {
  return (
    <div
      {...props}
      className={clsx("ak-checkbox-card-label", props.className)}
    />
  );
}

export interface CheckboxCardDescriptionProps extends ComponentProps<"div"> {}

export function CheckboxCardDescription(props: CheckboxCardDescriptionProps) {
  return (
    <div
      {...props}
      className={clsx("ak-checkbox-card-description", props.className)}
    />
  );
}

export interface CheckboxCardContentProps extends ComponentProps<"div"> {}

export function CheckboxCardContent(props: CheckboxCardContentProps) {
  return (
    <div
      {...props}
      className={clsx("ak-checkbox-card-content", props.className)}
    />
  );
}

export interface CheckboxCardImageProps extends ComponentProps<"div"> {}

export function CheckboxCardImage(props: CheckboxCardImageProps) {
  return (
    <div
      {...props}
      className={clsx("ak-checkbox-card-image", props.className)}
    />
  );
}
