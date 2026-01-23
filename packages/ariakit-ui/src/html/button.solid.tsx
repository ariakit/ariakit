import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { mergeProps, splitProps } from "solid-js";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "../styles/button.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function Button(props: ButtonProps) {
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  const [variantProps, rest] = splitProps(
    mergeProps({ $disabled: disabled } satisfies ButtonProps, props),
    button.html.propKeys,
  );
  return <button {...button.html(variantProps)} {...rest} />;
}

export interface ButtonContentProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonContent> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonContent(props: ButtonContentProps) {
  const [variantProps, rest] = splitProps(props, buttonContent.html.propKeys);
  return <span {...buttonContent.html(variantProps)} {...rest} />;
}

export interface ButtonLabelProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonLabel> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonLabel(props: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel.html.propKeys);
  return <span {...buttonLabel.html(variantProps)} {...rest} />;
}

export interface ButtonDescriptionProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonDescription> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonDescription(props: ButtonDescriptionProps) {
  const [variantProps, rest] = splitProps(
    props,
    buttonDescription.html.propKeys,
  );
  return <span {...buttonDescription.html(variantProps)} {...rest} />;
}

export interface ButtonSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonSlot> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonSlot(props: ButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, buttonSlot.html.propKeys);
  return <span {...buttonSlot.html(variantProps)} {...rest} />;
}
