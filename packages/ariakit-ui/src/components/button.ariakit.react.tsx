import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
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

export type ButtonProps<
  R extends Pick<typeof button, "getVariants"> = typeof button,
> = ak.ButtonProps &
  VariantProps<R> & {
    /** The recipe applied in place of `button`. It must extend it. */
    recipe?: R;
  };

/**
 * @see https://ariakit.com/react/examples/button
 */
export function Button<
  R extends Pick<typeof button, "getVariants"> = typeof button,
>({ recipe, ...props }: ButtonProps<R>) {
  // The recipe accepts every base variant, which is all the component reads.
  const styles = (recipe ?? button) as typeof button;
  const [variantProps, rest] = splitProps(props, styles);
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  return (
    <ak.Button
      {...styles.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? disabled,
      })}
      {...rest}
    />
  );
}

export interface ButtonGroupProps
  extends ak.GroupProps, VariantProps<typeof buttonGroup> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup);
  return <ak.Group {...buttonGroup.jsx(variantProps)} {...rest} />;
}

export interface ButtonGliderProps
  extends ak.RoleProps<"div">, VariantProps<typeof buttonGlider> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonGlider(props: ButtonGliderProps) {
  const [variantProps, rest] = splitProps(props, buttonGlider);
  return <ak.Role.div {...buttonGlider.jsx(variantProps)} {...rest} />;
}

export interface ButtonSeparatorProps
  extends ak.RoleProps<"div">, VariantProps<typeof buttonSeparator> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonSeparator(props: ButtonSeparatorProps) {
  const [variantProps, rest] = splitProps(props, buttonSeparator);
  return <ak.Role.div {...buttonSeparator.jsx(variantProps)} {...rest} />;
}

export interface ButtonContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonContent> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonContent(props: ButtonContentProps) {
  const [variantProps, rest] = splitProps(props, buttonContent);
  return <ak.Role.span {...buttonContent.jsx(variantProps)} {...rest} />;
}

export interface ButtonLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonLabel> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonLabel(props: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel);
  return <ak.Role.span {...buttonLabel.jsx(variantProps)} {...rest} />;
}

export interface ButtonDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonDescription> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonDescription(props: ButtonDescriptionProps) {
  const [variantProps, rest] = splitProps(props, buttonDescription);
  return <ak.Role.span {...buttonDescription.jsx(variantProps)} {...rest} />;
}

export interface ButtonSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonSlot> {}

/**
 * @see https://ariakit.com/react/examples/button
 */
export function ButtonSlot(props: ButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, buttonSlot);
  const variants = buttonSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...buttonSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
