import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  button,
  buttonBadge,
  buttonContent,
  buttonDescription,
  buttonIcon,
  buttonLabel,
} from "../styles/button.ts";

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function Button(props: ButtonProps) {
  const [variantProps, rest] = splitProps(props, button);
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  return (
    <button {...button({ $disabled: disabled, ...variantProps })} {...rest} />
  );
}

export interface ButtonContentProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonContent> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonContent(props: ButtonContentProps) {
  const [variantProps, rest] = splitProps(props, buttonContent);
  return <span {...buttonContent(variantProps)} {...rest} />;
}

export interface ButtonLabelProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonLabel> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonLabel(props: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel);
  return <span {...buttonLabel(variantProps)} {...rest} />;
}

export interface ButtonDescriptionProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonDescription> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonDescription(props: ButtonDescriptionProps) {
  const [variantProps, rest] = splitProps(props, buttonDescription);
  return <span {...buttonDescription(variantProps)} {...rest} />;
}

export interface ButtonIconProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonIcon> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonIcon(props: ButtonIconProps) {
  const [variantProps, rest] = splitProps(props, buttonIcon);
  return <span {...buttonIcon(variantProps)} {...rest} />;
}

export interface ButtonBadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonBadge> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonBadge(props: ButtonBadgeProps) {
  const [variantProps, rest] = splitProps(props, buttonBadge);
  return <span {...buttonBadge(variantProps)} {...rest} />;
}
