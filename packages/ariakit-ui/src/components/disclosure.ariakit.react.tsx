import * as ak from "@ariakit/react";
import type { RecipeLike, VariantProps, VariantPropsWithRecipe } from "clava";
import { splitProps } from "clava";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
  isRenderable,
} from "../react-utils/create-render.react.ts";
import { wrapsSlotChildren } from "../styles/control.ts";
import {
  disclosure,
  disclosureButton,
  disclosureButtonContent,
  disclosureButtonDescription,
  disclosureButtonLabel,
  disclosureButtonShortcut,
  disclosureButtonSlot,
  disclosureChevron,
  disclosureContent,
  disclosureContentBody,
  disclosureGroup,
  disclosurePlus,
} from "../styles/disclosure.ts";

export interface DisclosureOwnProps {
  /**
   * Button content, a custom element, or `DisclosureButton` props. When
   * omitted, children must include the button and content components.
   */
  button?: React.ReactNode | DisclosureButtonProps;
  /**
   * Custom content element or `DisclosureContent` props. Used when `button` is
   * set; defaults to a `DisclosureContent` containing the children.
   */
  content?: React.ReactElement | DisclosureContentProps;
  /**
   * Element rendered as the root's last child, after the content. Reserved for
   * absolutely positioned decorations that have to span the whole disclosure,
   * including its open content. It follows the content, so a custom content
   * element that stretches to the frame edges no longer counts as the root's
   * last child. `ListDisclosure` fills this slot on every instance, so that
   * applies there whether or not the caller passes one.
   */
  decoration?: React.ReactNode;
  /**
   * Separates the button and content with a border and content padding.
   * `$split` takes precedence when both props are set.
   */
  split?: boolean;
}

export type DisclosureProps<
  R extends RecipeLike<typeof disclosure, R> = typeof disclosure,
> = Omit<ak.RoleProps<"div">, "content"> &
  Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen"> &
  VariantPropsWithRecipe<typeof disclosure, R> &
  DisclosureOwnProps & {
    /**
     * The recipe applied to the root in place of `disclosure`. It must supply
     * every `disclosure` variant.
     */
    recipe?: R;
  };

/**
 * Connects a button and collapsible content through a shared provider. Pass
 * `button` to wrap children in `DisclosureContent` automatically.
 * @example
 * <Disclosure>
 *   <DisclosureButton>Open</DisclosureButton>
 *   <DisclosureContent>Content</DisclosureContent>
 * </Disclosure>
 * @example
 * <Disclosure button="Open">Content</Disclosure>
 */
export function Disclosure<
  R extends RecipeLike<typeof disclosure, R> = typeof disclosure,
>({
  recipe,
  open,
  setOpen,
  defaultOpen,
  split,
  $split,
  button,
  content,
  decoration,
  children,
  ...props
}: DisclosureProps<R>) {
  const store = ak.useDisclosureStore({ open, setOpen, defaultOpen });
  const isOpen = ak.useStoreState(store, "open");
  const styles = recipe ?? disclosure;
  const [variantProps, rest] = splitProps(props, styles);
  // Explicit props avoid making the generic component's recipe required.
  const buttonEl = createOptionalRender<DisclosureButtonProps>(
    DisclosureButton,
    button,
  );
  const contentEl = createRender(DisclosureContent, content);
  return (
    <ak.DisclosureProvider store={store}>
      <ak.Role
        data-open={isOpen || undefined}
        {...styles.jsx({ ...variantProps, $split: $split ?? split })}
        {...rest}
      >
        {buttonEl ? (
          <>
            <ak.Role render={buttonEl} />
            <ak.Role render={contentEl}>{children}</ak.Role>
          </>
        ) : (
          children
        )}
        {decoration}
      </ak.Role>
    </ak.DisclosureProvider>
  );
}

export interface DisclosureGroupProps
  extends ak.RoleProps<"div">, VariantProps<typeof disclosureGroup> {}

/**
 * Groups disclosures in a shared frame with dividers between them.
 * @example
 * <DisclosureGroup>
 *   <Disclosure button="Shipping">Ships in two days.</Disclosure>
 *   <Disclosure button="Returns">Return within 30 days.</Disclosure>
 * </DisclosureGroup>
 */
export function DisclosureGroup(props: DisclosureGroupProps) {
  const [variantProps, rest] = splitProps(props, disclosureGroup);
  return <ak.Role {...disclosureGroup.jsx(variantProps)} {...rest} />;
}

export type DisclosureIndicator =
  | "chevron-down-start"
  | "chevron-down-next"
  | "chevron-down-end"
  | "chevron-right-start"
  | "chevron-right-next"
  | "chevron-right-end"
  | "plus-start"
  | "plus-next"
  | "plus-end";

export interface DisclosureButtonOwnProps {
  /**
   * Label content, a custom label element, or `DisclosureButtonLabel` props.
   * When omitted, children form the label. When set, children render beside the
   * label and description. Set `null` or `false` to omit the label. Custom
   * label elements must forward their props to the label element.
   */
  label?: React.ReactNode | DisclosureButtonLabelProps;
  /** Secondary text shown below the main label. */
  description?: React.ReactNode;
  /** Icon before the label, inside a `DisclosureButtonSlot`. */
  icon?: React.ReactNode;
  /**
   * Selects a chevron or plus and its position. `start` precedes the icon and
   * label; `next` follows the label; `end` sits at the far edge. Defaults to
   * `chevron-down-end` with an icon and `chevron-right-start` without one. Set
   * `false` to hide it.
   */
  indicator?: DisclosureIndicator | false;
}

export type DisclosureButtonProps<
  R extends RecipeLike<typeof disclosureButton, R> = typeof disclosureButton,
> = ak.DisclosureProps &
  VariantPropsWithRecipe<typeof disclosureButton, R> &
  DisclosureButtonOwnProps & {
    /**
     * The recipe applied to the button in place of `disclosureButton`. It must
     * supply every `disclosureButton` variant.
     */
    recipe?: R;
  };

function getIndicatorPosition(indicator: DisclosureIndicator) {
  if (indicator.endsWith("-next")) return "next";
  if (indicator.endsWith("-end")) return "end";
  return "start";
}

function renderIndicator(indicator: DisclosureIndicator) {
  const $position = getIndicatorPosition(indicator);
  if (indicator.startsWith("plus")) {
    return (
      <span data-disclosure-indicator {...disclosurePlus.jsx({ $position })} />
    );
  }
  const $direction = indicator.startsWith("chevron-down") ? "down" : "right";
  return (
    <span
      data-disclosure-indicator
      {...disclosureChevron.jsx({ $direction, $position })}
    >
      <ChevronDownIcon />
    </span>
  );
}

/**
 * Toggles disclosure content. Wraps its label and connects optional secondary
 * text as an accessible description.
 * @example
 * <Disclosure>
 *   <DisclosureButton description="Delivery times">Shipping</DisclosureButton>
 *   <DisclosureContent>Ships in two days.</DisclosureContent>
 * </Disclosure>
 */
export function DisclosureButton<
  R extends RecipeLike<typeof disclosureButton, R> = typeof disclosureButton,
>({
  recipe,
  label,
  description,
  icon,
  indicator = isRenderable(icon) ? "chevron-down-end" : "chevron-right-start",
  ...props
}: DisclosureButtonProps<R>) {
  const context = ak.useDisclosureContext();
  const isOpen = ak.useStoreState(props.store ?? context, "open");
  const baseId = React.useId();
  const descriptionId = `${baseId}-description`;
  const styles = recipe ?? disclosureButton;
  const [variantProps, rest] = splitProps(props, styles);
  // Fragments need an element to carry the label's ID and styles.
  const isFragment =
    React.isValidElement(label) && label.type === React.Fragment;
  const labelProps =
    label === undefined && isRenderable(props.children)
      ? { children: props.children }
      : isFragment
        ? { children: label }
        : label;
  const labelEl = createOptionalRender(DisclosureButtonLabel, labelProps, {
    id: `${baseId}-label`,
  });
  const hasLabelContent = !!labelEl;
  const hasDescription = isRenderable(description);
  const labelElement = hasDescription ? (
    <span {...disclosureButtonContent.jsx()}>
      {labelEl}
      <span id={descriptionId} {...disclosureButtonDescription.jsx()}>
        {description}
      </span>
    </span>
  ) : (
    labelEl
  );
  const iconElement = isRenderable(icon) ? (
    <DisclosureButtonSlot>{icon}</DisclosureButtonSlot>
  ) : null;
  const indicatorEl = indicator ? renderIndicator(indicator) : null;
  const atStart = indicator ? indicator.endsWith("-start") : false;
  // Without a label, the description contributes to the button's name. An
  // explicit accessible name makes it a separate description instead.
  const hasLabel =
    hasLabelContent ||
    props["aria-label"] != null ||
    props["aria-labelledby"] != null;
  return (
    <ak.Disclosure
      data-disclosure-button
      aria-labelledby={hasDescription ? labelEl?.props.id : undefined}
      aria-describedby={hasDescription && hasLabel ? descriptionId : undefined}
      data-open={isOpen || undefined}
      {...styles.jsx(variantProps)}
      {...rest}
    >
      {atStart && indicatorEl}
      {iconElement}
      {labelElement}
      {label !== undefined && props.children}
      {!atStart && indicatorEl}
    </ak.Disclosure>
  );
}

export interface DisclosureButtonLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof disclosureButtonLabel> {}

/**
 * A custom label for the disclosure button's `label` prop.
 * @example
 * <Disclosure>
 *   <DisclosureButton
 *     label={<DisclosureButtonLabel>Shipping</DisclosureButtonLabel>}
 *   />
 *   <DisclosureContent>Ships in two days.</DisclosureContent>
 * </Disclosure>
 */
export function DisclosureButtonLabel(props: DisclosureButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, disclosureButtonLabel);
  return (
    <ak.Role.span {...disclosureButtonLabel.jsx(variantProps)} {...rest} />
  );
}

export interface DisclosureButtonSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof disclosureButtonSlot> {}

/**
 * An icon, badge, or avatar beside the button's `label`.
 * @example
 * <Disclosure>
 *   <DisclosureButton label="Updates">
 *     <DisclosureButtonSlot $kind="badge">3</DisclosureButtonSlot>
 *   </DisclosureButton>
 *   <DisclosureContent>Three updates are available.</DisclosureContent>
 * </Disclosure>
 */
export function DisclosureButtonSlot(props: DisclosureButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, disclosureButtonSlot);
  const variants = disclosureButtonSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...disclosureButtonSlot.jsx(variantProps)} {...rest}>
      {wrapsSlotChildren(variants.$kind) ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface DisclosureButtonShortcutProps
  extends ak.RoleProps<"kbd">, VariantProps<typeof disclosureButtonShortcut> {}

/**
 * A keyboard shortcut beside a disclosure button label. Renders a `kbd`
 * element, so pass the shortcut text, or nested `kbd` elements for the keys of
 * a chord.
 * @example
 * <Disclosure>
 *   <DisclosureButton label="Details">
 *     <DisclosureButtonShortcut>⌘D</DisclosureButtonShortcut>
 *   </DisclosureButton>
 *   <DisclosureContent>Ships in two days.</DisclosureContent>
 * </Disclosure>
 */
export function DisclosureButtonShortcut(props: DisclosureButtonShortcutProps) {
  const [variantProps, rest] = splitProps(props, disclosureButtonShortcut);
  return (
    <ak.Role.kbd {...disclosureButtonShortcut.jsx(variantProps)} {...rest}>
      <span>{rest.children}</span>
    </ak.Role.kbd>
  );
}

export interface DisclosureContentProps
  extends ak.DisclosureContentProps, VariantProps<typeof disclosureContent> {
  /**
   * Custom body element or `DisclosureContentBody` props. Defaults to a
   * `DisclosureContentBody` containing the content children.
   */
  body?: React.ReactElement | DisclosureContentBodyProps;
  /**
   * Draws a vertical guide below the leading icon or indicator. Disabled by
   * default. `$guide` takes precedence when both props are set.
   */
  guide?: boolean;
  /**
   * Applies prose typography and spacing to the content body. Disabled by
   * default. The body's `$prose` prop takes precedence when set.
   */
  prose?: boolean;
}

/**
 * Collapsible content with an inner `DisclosureContentBody` for padding and
 * optional prose styles. Connects to the surrounding disclosure provider.
 * @example
 * <Disclosure>
 *   <DisclosureButton>Shipping</DisclosureButton>
 *   <DisclosureContent prose><p>Ships in two days.</p></DisclosureContent>
 * </Disclosure>
 */
export function DisclosureContent({
  body,
  guide,
  prose,
  ...props
}: DisclosureContentProps) {
  const [variantProps, rest] = splitProps(props, disclosureContent);
  // Explicit props avoid making the generic component's recipe required.
  const bodyEl = createRender<DisclosureContentBodyProps>(
    DisclosureContentBody,
    body,
    { $prose: prose },
  );
  return (
    <ak.DisclosureContent
      {...disclosureContent.jsx({
        ...variantProps,
        $guide: variantProps.$guide ?? guide,
      })}
      {...rest}
    >
      <ak.Role render={bodyEl}>{rest.children}</ak.Role>
    </ak.DisclosureContent>
  );
}

export type DisclosureContentBodyProps<
  R extends RecipeLike<typeof disclosureContentBody, R> =
    typeof disclosureContentBody,
> = React.ComponentProps<"div"> &
  VariantPropsWithRecipe<typeof disclosureContentBody, R> & {
    /**
     * The recipe applied to the body in place of `disclosureContentBody`. It
     * must supply every `disclosureContentBody` variant.
     */
    recipe?: R;
  };

/**
 * Applies padding and optional prose styles inside `DisclosureContent`, which
 * renders this body by default.
 * @example
 * <Disclosure
 *   button="Shipping"
 *   content={<DisclosureContent body={<DisclosureContentBody $prose />} />}
 * >
 *   <p>Ships in two days.</p>
 * </Disclosure>
 */
export function DisclosureContentBody<
  R extends RecipeLike<typeof disclosureContentBody, R> =
    typeof disclosureContentBody,
>({ recipe, ...props }: DisclosureContentBodyProps<R>) {
  const styles = recipe ?? disclosureContentBody;
  const [variantProps, rest] = splitProps(props, styles);
  return <div {...styles.jsx(variantProps)} {...rest} />;
}
