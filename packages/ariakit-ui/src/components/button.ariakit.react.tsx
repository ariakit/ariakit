import * as ak from "@ariakit/react";
import type { RecipeLike, VariantProps, VariantPropsWithRecipe } from "clava";
import { splitProps } from "clava";
import type * as React from "react";
import {
  appendOptionalChild,
  createOptionalRender,
} from "../react-utils/create-render.react.ts";
import {
  button,
  buttonBar,
  buttonContent,
  buttonDescription,
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
    /**
     * A bar that marks the button while checked or current, as `true`, an
     * element, or `ButtonBar` props. Rendered after the children. Children of a
     * `render` element replace it, so pass them to the button instead.
     */
    bar?: boolean | React.ReactElement | ButtonBarProps;
  };

/**
 * A button with shared control styles.
 * @example
 * <Button>Save changes</Button>
 */
export function Button<R extends RecipeLike<typeof button, R> = typeof button>({
  recipe,
  $disabled,
  bar,
  ...props
}: ButtonProps<R>) {
  const styles = recipe ?? button;
  const [variantProps, rest] = splitProps(props, styles);
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  const barElement = createOptionalRender(ButtonBar, bar === true ? {} : bar);
  return (
    <ak.Button
      {...styles.jsx({ ...variantProps, $disabled: $disabled ?? disabled })}
      {...rest}
    >
      {appendOptionalChild(props.children, barElement)}
    </ak.Button>
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

export interface ButtonBarProps
  extends ak.RoleProps<"span">, VariantProps<typeof buttonBar> {}

/**
 * A thin bar that marks a checked or current button. Pass it, or its props, to
 * the `bar` prop of `Button` so it renders as the last child.
 * @example
 * <ButtonGroup aria-label="Views">
 *   <Button render={<a href="/list" />} aria-current="page" bar>
 *     List
 *   </Button>
 *   <Button render={<a href="/grid" />} bar={<ButtonBar $offset="halfway" />}>
 *     Grid
 *   </Button>
 * </ButtonGroup>
 */
export function ButtonBar(props: ButtonBarProps) {
  const [variantProps, rest] = splitProps(props, buttonBar);
  return (
    <ak.Role.span aria-hidden {...buttonBar.jsx(variantProps)} {...rest} />
  );
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
