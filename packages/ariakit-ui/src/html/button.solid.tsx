import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { Show, splitProps } from "solid-js";
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
  extends ComponentProps<"button">, VariantProps<typeof button> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function Button(props: ButtonProps) {
  // The accessor is called inside the JSX spread so it stays reactive, and
  // an explicit $disabled prop still wins.
  const disabled = () =>
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  const [variantProps, rest] = splitProps(props, button.html.propKeys);
  return (
    <button
      {...button.html({
        ...variantProps,
        $disabled: variantProps.$disabled ?? disabled(),
      })}
      {...rest}
    />
  );
}

export interface ButtonGroupProps
  extends ComponentProps<"div">, VariantProps<typeof buttonGroup> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup.html.propKeys);
  return <div {...buttonGroup.html(variantProps)} {...rest} />;
}

export interface ButtonGliderProps
  extends ComponentProps<"div">, VariantProps<typeof buttonGlider> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonGlider(props: ButtonGliderProps) {
  const [variantProps, rest] = splitProps(props, buttonGlider.html.propKeys);
  return <div {...buttonGlider.html(variantProps)} {...rest} />;
}

export interface ButtonSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof buttonSeparator> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonSeparator(props: ButtonSeparatorProps) {
  const [variantProps, rest] = splitProps(props, buttonSeparator.html.propKeys);
  return <div {...buttonSeparator.html(variantProps)} {...rest} />;
}

export interface ButtonContentProps
  extends ComponentProps<"span">, VariantProps<typeof buttonContent> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonContent(props: ButtonContentProps) {
  const [variantProps, rest] = splitProps(props, buttonContent.html.propKeys);
  return <span {...buttonContent.html(variantProps)} {...rest} />;
}

export interface ButtonLabelProps
  extends ComponentProps<"span">, VariantProps<typeof buttonLabel> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonLabel(props: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel.html.propKeys);
  return <span {...buttonLabel.html(variantProps)} {...rest} />;
}

export interface ButtonDescriptionProps
  extends ComponentProps<"span">, VariantProps<typeof buttonDescription> {}

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
  extends ComponentProps<"span">, VariantProps<typeof buttonSlot> {}

/**
 * @see https://ariakit.com/solid/examples/button
 */
export function ButtonSlot(props: ButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, buttonSlot.html.propKeys);
  return (
    <span {...buttonSlot.html(variantProps)} {...rest}>
      {/* getVariants runs inside the JSX so the badge check stays reactive */}
      <Show
        when={buttonSlot.getVariants(variantProps).$kind === "badge"}
        fallback={rest.children}
      >
        <span>{rest.children}</span>
      </Show>
    </span>
  );
}
