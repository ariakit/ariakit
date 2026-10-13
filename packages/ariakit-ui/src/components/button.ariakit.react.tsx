import * as ak from "@ariakit/react";
import type { RecipeLike, VariantProps, VariantPropsWithRecipe } from "clava";
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
import { wrapsSlotChildren } from "../styles/control.ts";

export type ButtonProps<
  R extends RecipeLike<typeof button, R> = typeof button,
> = ak.ButtonProps &
  VariantPropsWithRecipe<typeof button, R> & {
    /**
     * The recipe applied in place of `button`. It must supply every `button`
     * variant.
     */
    recipe?: R;
  };

/**
 * A button with shared control styles.
 * @example
 * <Button>Save changes</Button>
 */
export function Button<R extends RecipeLike<typeof button, R> = typeof button>({
  recipe,
  $disabled,
  ...props
}: ButtonProps<R>) {
  const styles = recipe ?? button;
  const [variantProps, rest] = splitProps(props, styles);
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  return (
    <ak.Button
      {...styles.jsx({ ...variantProps, $disabled: $disabled ?? disabled })}
      {...rest}
    />
  );
}

export interface ButtonGroupProps
  extends ak.GroupProps, VariantProps<typeof buttonGroup> {}

/**
 * Groups related buttons in one surface.
 * @example
 * <ButtonGroup aria-label="Edit history">
 *   <Button>Undo</Button>
 *   <Button>Redo</Button>
 * </ButtonGroup>
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup);
  return <ak.Group {...buttonGroup.jsx(variantProps)} {...rest} />;
}

export interface ButtonGliderProps
  extends ak.RoleProps<"div">, VariantProps<typeof buttonGlider> {}

/**
 * A selection indicator for grouped buttons. Place it after the buttons inside
 * `ButtonGroup`.
 * @example
 * <ButtonGroup aria-label="Views">
 *   <Button render={<a href="/list" />} aria-current="page">List</Button>
 *   <Button render={<a href="/grid" />}>Grid</Button>
 *   <ButtonGlider />
 * </ButtonGroup>
 */
export function ButtonGlider(props: ButtonGliderProps) {
  const [variantProps, rest] = splitProps(props, buttonGlider);
  return <ak.Role.div {...buttonGlider.jsx(variantProps)} {...rest} />;
}

export interface ButtonSeparatorProps
  extends ak.RoleProps<"div">, VariantProps<typeof buttonSeparator> {}

/**
 * A visual divider between grouped buttons.
 * @example
 * <ButtonGroup aria-label="Edit history">
 *   <Button>Undo</Button>
 *   <ButtonSeparator />
 *   <Button>Redo</Button>
 * </ButtonGroup>
 */
export function ButtonSeparator(props: ButtonSeparatorProps) {
  const [variantProps, rest] = splitProps(props, buttonSeparator);
  return <ak.Role.div {...buttonSeparator.jsx(variantProps)} {...rest} />;
}

export interface ButtonContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonContent> {}

/**
 * Stacks a button label and description.
 * @example
 * <Button>
 *   <ButtonContent>
 *     <ButtonLabel>Download</ButtonLabel>
 *     <ButtonDescription>PDF document</ButtonDescription>
 *   </ButtonContent>
 * </Button>
 */
export function ButtonContent(props: ButtonContentProps) {
  const [variantProps, rest] = splitProps(props, buttonContent);
  return <ak.Role.span {...buttonContent.jsx(variantProps)} {...rest} />;
}

export interface ButtonLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonLabel> {}

/**
 * The main text of a button. Truncates to one line by default; set
 * `$truncate={false}` to let it wrap.
 * @example
 * <Button>
 *   <ButtonLabel>Save changes</ButtonLabel>
 * </Button>
 */
export function ButtonLabel(props: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel);
  return <ak.Role.span {...buttonLabel.jsx(variantProps)} {...rest} />;
}

export interface ButtonDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonDescription> {}

/**
 * Secondary text below a button label. Truncates to one line by default; set
 * `$truncate={false}` to let it wrap.
 * @example
 * <Button>
 *   <ButtonContent>
 *     <ButtonLabel>Download</ButtonLabel>
 *     <ButtonDescription>PDF document</ButtonDescription>
 *   </ButtonContent>
 * </Button>
 */
export function ButtonDescription(props: ButtonDescriptionProps) {
  const [variantProps, rest] = splitProps(props, buttonDescription);
  return <ak.Role.span {...buttonDescription.jsx(variantProps)} {...rest} />;
}

export interface ButtonSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonSlot> {}

/**
 * An icon or other content beside a button label. Pass `aria-hidden` when the
 * entire slot is decorative.
 * @example
 * <Button>
 *   <ButtonSlot aria-hidden>+</ButtonSlot>
 *   <ButtonLabel>Add item</ButtonLabel>
 * </Button>
 */
export function ButtonSlot(props: ButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, buttonSlot);
  const variants = buttonSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...buttonSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}
