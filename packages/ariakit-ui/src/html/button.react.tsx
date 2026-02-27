import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonGlider,
  buttonGroup,
  buttonLabel,
  buttonSeparator,
  buttonSlot,
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

export interface ButtonGroupProps
  extends ComponentProps<"div">,
    VariantProps<typeof buttonGroup> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup);
  return <div {...buttonGroup(variantProps)} {...rest} />;
}

export interface ButtonGliderProps
  extends ComponentProps<"div">,
    VariantProps<typeof buttonGlider> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonGlider(props: ButtonGliderProps) {
  const [variantProps, rest] = splitProps(props, buttonGlider);
  return <div {...buttonGlider(variantProps)} {...rest} />;
}

export interface ButtonSeparatorProps
  extends ComponentProps<"div">,
    VariantProps<typeof buttonSeparator> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonSeparator(props: ButtonSeparatorProps) {
  const [variantProps, rest] = splitProps(props, buttonSeparator);
  return <div {...buttonSeparator(variantProps)} {...rest} />;
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

export interface ButtonSlotProps
  extends ComponentProps<"span">,
    VariantProps<typeof buttonSlot> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonSlot(props: ButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, buttonSlot);
  const variants = buttonSlot.getVariants(variantProps);
  return (
    <span {...buttonSlot(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </span>
  );
}
