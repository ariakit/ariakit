import * as ak from "@ariakit/react";
import type { RecipeLike, VariantProps, VariantPropsWithRecipe } from "clava";
import { cx, splitProps } from "clava";
import type * as React from "react";
import {
  appendOptionalChild,
  createOptionalRender,
  prependOptionalSeparator,
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
import { carouselViewportBase } from "../styles/carousel.ts";
import { frame } from "../styles/frame.ts";
import { Carousel, CarouselViewport } from "./carousel.ariakit.react.tsx";
import type { CarouselButtonRender } from "./carousel.ariakit.react.tsx";

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
    /**
     * A separator before the button, as `true`, an element, or
     * `ButtonSeparator` props. It renders as a sibling of the button, hidden
     * from assistive technologies. Pass `!!index` when mapping the buttons of a
     * `ButtonGroup` to separate each button from the one before it.
     */
    separator?: boolean | React.ReactElement | ButtonSeparatorProps;
  };

/**
 * A button with shared control styles.
 * @example
 * <Button>Save changes</Button>
 * @example
 * <ButtonGroup aria-label="Edit history">
 *   <Button>Undo</Button>
 *   <Button separator>Redo</Button>
 * </ButtonGroup>
 */
export function Button<R extends RecipeLike<typeof button, R> = typeof button>({
  recipe,
  $disabled,
  bar,
  separator,
  ...props
}: ButtonProps<R>) {
  const styles = recipe ?? button;
  const [variantProps, rest] = splitProps(props, styles);
  const disabled =
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true";
  const barElement = createOptionalRender(ButtonBar, bar === true ? {} : bar);
  return prependOptionalSeparator(
    ButtonSeparator,
    separator,
    <ak.Button
      {...styles.jsx({ ...variantProps, $disabled: $disabled ?? disabled })}
      {...rest}
    >
      {appendOptionalChild(props.children, barElement)}
    </ak.Button>,
  );
}

export interface ButtonGroupProps
  extends ak.GroupProps, VariantProps<typeof buttonGroup> {
  /**
   * Renders scroll buttons before and after a segmented group with padding,
   * outside the element with the `group` role. They show with a fine pointer
   * while the group can scroll toward their side. Defaults to `true`.
   */
  buttons?: boolean;
  /**
   * The button before a segmented group, as `true`, an element, or
   * `CarouselButton` props. `false` omits it. Defaults to a button named
   * "Scroll backward".
   */
  previousButton?: CarouselButtonRender;
  /**
   * The button after a segmented group, as `true`, an element, or
   * `CarouselButton` props. `false` omits it. Defaults to a button named
   * "Scroll forward".
   */
  nextButton?: CarouselButtonRender;
}

/**
 * Groups related buttons in one surface. With `$kind="segmented"` and padding,
 * the group scrolls sideways when it doesn't fit, fades its segments at each
 * end while more segments lie that way, and shows buttons that scroll it with a
 * fine pointer. A carousel root holds the group and the buttons, which sit
 * outside the element with the `group` role. The root paints the surface of the
 * group and takes `className` and `style`.
 * @example
 * <ButtonGroup aria-label="Edit history">
 *   <Button>Undo</Button>
 *   <Button>Redo</Button>
 * </ButtonGroup>
 */
export function ButtonGroup({
  ref,
  dir,
  buttons,
  previousButton,
  nextButton,
  ...props
}: ButtonGroupProps) {
  const [variantProps, rest] = splitProps(props, buttonGroup);
  const variants = buttonGroup.getVariants(variantProps);
  if (variants.$kind !== "segmented" || variants.$p === "none") {
    return (
      <ak.Group
        ref={ref}
        dir={dir}
        {...buttonGroup.jsx(variantProps)}
        {...rest}
      />
    );
  }
  // A segmented group with padding scrolls in a carousel row. Its fades would
  // fade its surface too, so the carousel paints the surface with the frame of
  // the group, and the group covers the carousel.
  const [surfaceProps] = splitProps(variants, frame);
  const { className, style, ...groupProps } = variantProps;
  return (
    <Carousel
      $kind="row"
      {...surfaceProps}
      $size={variants.$size}
      $bleed="var(--ak-frame-padding)"
      buttons={buttons}
      previousButton={previousButton}
      nextButton={nextButton}
      dir={dir}
      // The carousel holds the buttons, so it hides with the group.
      hidden={rest.hidden}
      className={cx(
        variants.$layout === "stretch" ? "w-full" : "ui-base:w-fit",
        className,
      )}
      style={style}
    >
      <CarouselViewport
        ref={ref}
        recipe={carouselViewportBase}
        $fade
        render={<ak.Group {...buttonGroup.jsx(groupProps)} {...rest} />}
      />
    </Carousel>
  );
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
 * A visual divider between grouped buttons. Pass it, or its props, to the
 * `separator` prop of `Button` or `RadioCard` so it renders before the control,
 * hidden from assistive technologies.
 * @example
 * <ButtonGroup aria-label="Edit history">
 *   <Button>Undo</Button>
 *   <Button separator={<ButtonSeparator $kind="slash" />}>Redo</Button>
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
  extends ak.RoleProps<"span">, VariantProps<typeof buttonLabel> {
  /**
   * The label text, rendered when `children` is omitted. A current segment
   * shows its label in a heavier weight only when this is set, because the text
   * reserves the heavier width in advance and keeps the segment size. Keep it
   * equal to the visible text of custom `children`.
   */
  text?: string;
}

/**
 * The main text of a button. Truncates to one line by default; set
 * `$truncate={false}` to let it wrap.
 * @example
 * <Button>
 *   <ButtonLabel>Save changes</ButtonLabel>
 * </Button>
 * @example
 * <ButtonGroup aria-label="Pages" $kind="segmented">
 *   <Button $kind="segmented" render={<a href="/first" aria-current="page" />}>
 *     <ButtonLabel text="First" />
 *   </Button>
 *   <Button $kind="segmented" render={<a href="/second" />}>
 *     <ButtonLabel text="Second" />
 *   </Button>
 * </ButtonGroup>
 */
export function ButtonLabel({
  text,
  children = text,
  ...props
}: ButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, buttonLabel);
  return (
    <ak.Role.span data-text={text} {...buttonLabel.jsx(variantProps)} {...rest}>
      {children}
    </ak.Role.span>
  );
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
  return <ak.Role.span {...buttonSlot.jsx(variantProps)} {...rest} />;
}
