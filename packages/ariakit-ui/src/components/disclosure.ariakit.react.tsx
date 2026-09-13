import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
  isRenderable,
} from "../react-utils/create-render.react.ts";
import {
  disclosure,
  disclosureButton,
  disclosureButtonContent,
  disclosureButtonDescription,
  disclosureButtonLabel,
  disclosureButtonSlot,
  disclosureChevron,
  disclosureContent,
  disclosureContentBody,
  disclosureGroup,
  disclosurePlus,
} from "../styles/disclosure.ts";

export interface DisclosureProps
  extends
    Omit<ak.RoleProps<"div">, "content">,
    Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen">,
    VariantProps<typeof disclosure> {
  /** Custom button element or props to render a `DisclosureButton`. */
  button?: React.ReactNode | DisclosureButtonProps;
  /** Custom content element or props to render a `DisclosureContent`. */
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
   * Applies a split layout that visually separates button and content areas.
   */
  split?: boolean;
}

/**
 * High-level disclosure that wires button and content through a provider.
 * @example
 * <Disclosure>
 *   <DisclosureButton>Open</DisclosureButton>
 *   <DisclosureContent>Content</DisclosureContent>
 * </Disclosure>
 * @example
 * <Disclosure button="Open">
 *   Content
 * </Disclosure>
 */
export function Disclosure({
  open,
  setOpen,
  defaultOpen,
  split,
  button,
  content,
  decoration,
  ...props
}: DisclosureProps) {
  const store = ak.useDisclosureStore({ open, setOpen, defaultOpen });
  const isOpen = ak.useStoreState(store, "open");
  const [variantProps, rest] = splitProps(props, disclosure);
  const buttonEl = createOptionalRender(DisclosureButton, button);
  const contentEl = createRender(DisclosureContent, content);
  return (
    <ak.DisclosureProvider store={store}>
      <ak.Role
        data-open={isOpen || undefined}
        {...disclosure.jsx({
          ...variantProps,
          $split: variantProps.$split ?? split,
        })}
        {...rest}
      >
        {buttonEl ? (
          <>
            <ak.Role render={buttonEl} />
            <ak.Role render={contentEl}>{rest.children}</ak.Role>
          </>
        ) : (
          rest.children
        )}
        {decoration}
      </ak.Role>
    </ak.DisclosureProvider>
  );
}

export interface DisclosureGroupProps
  extends ak.RoleProps<"div">, VariantProps<typeof disclosureGroup> {}

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

export interface DisclosureButtonProps
  extends ak.DisclosureProps, VariantProps<typeof disclosureButton> {
  /**
   * Label content, a custom label element, or `DisclosureButtonLabel` props.
   * When omitted, children form the label. When set, children render beside the
   * label and description. Set `null` or `false` to omit the label. Custom
   * label elements must forward their props to the label element.
   */
  label?: React.ReactNode | DisclosureButtonLabelProps;
  /** Secondary text shown below the main label. */
  description?: React.ReactNode;
  /** Custom icon. */
  icon?: React.ReactNode;
  /**
   * Selects chevron/plus indicator and placement (start, next, end). Set
   * `false` to hide.
   */
  indicator?: DisclosureIndicator | false;
}

function renderIndicator(indicator: DisclosureIndicator) {
  const $end = indicator.endsWith("-end");
  if (indicator.startsWith("plus")) {
    return <span data-disclosure-indicator {...disclosurePlus.jsx({ $end })} />;
  }
  const $direction = indicator.startsWith("chevron-down") ? "down" : "right";
  return (
    <span
      data-disclosure-indicator
      {...disclosureChevron.jsx({ $direction, $end })}
    >
      <ChevronDownIcon />
    </span>
  );
}

export function DisclosureButton({
  label,
  description,
  icon,
  indicator = isRenderable(icon) ? "chevron-down-end" : "chevron-right-start",
  ...props
}: DisclosureButtonProps) {
  const context = ak.useDisclosureContext();
  const isOpen = ak.useStoreState(props.store ?? context, "open");
  const baseId = React.useId();
  const descriptionId = `${baseId}-description`;
  const [variantProps, rest] = splitProps(props, disclosureButton);
  // Fragments need an element to carry the label's ID and styles.
  const isFragment =
    React.isValidElement(label) && label.type === React.Fragment;
  const labelProps =
    label === undefined && isRenderable(rest.children)
      ? { children: rest.children }
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
    rest["aria-label"] != null ||
    rest["aria-labelledby"] != null;
  return (
    <ak.Disclosure
      data-disclosure-button
      aria-labelledby={hasDescription ? labelEl?.props.id : undefined}
      aria-describedby={hasDescription && hasLabel ? descriptionId : undefined}
      data-open={isOpen || undefined}
      {...disclosureButton.jsx(variantProps)}
      {...rest}
    >
      {atStart && indicatorEl}
      {iconElement}
      {labelElement}
      {label !== undefined && rest.children}
      {!atStart && indicatorEl}
    </ak.Disclosure>
  );
}

export interface DisclosureButtonLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof disclosureButtonLabel> {}

/**
 * A custom label for the disclosure button's `label` prop.
 */
export function DisclosureButtonLabel(props: DisclosureButtonLabelProps) {
  const [variantProps, rest] = splitProps(props, disclosureButtonLabel);
  return (
    <ak.Role.span {...disclosureButtonLabel.jsx(variantProps)} {...rest} />
  );
}

export interface DisclosureButtonSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof disclosureButtonSlot> {}

/** An icon, badge, or shortcut beside the button's `label`. */
export function DisclosureButtonSlot(props: DisclosureButtonSlotProps) {
  const [variantProps, rest] = splitProps(props, disclosureButtonSlot);
  const variants = disclosureButtonSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...disclosureButtonSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface DisclosureContentProps
  extends ak.DisclosureContentProps, VariantProps<typeof disclosureContent> {
  /** Custom body element or props to render a `DisclosureContentBody`. */
  body?: React.ReactElement | DisclosureContentBodyProps;
  /** Applies a guide to the content. */
  guide?: boolean;
  /** Applies prose typography and spacing to the content body. */
  prose?: boolean;
}

export function DisclosureContent({
  body,
  guide,
  prose,
  ...props
}: DisclosureContentProps) {
  const [variantProps, rest] = splitProps(props, disclosureContent);
  const bodyEl = createRender(DisclosureContentBody, body, { $prose: prose });
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

export interface DisclosureContentBodyProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof disclosureContentBody> {}

export function DisclosureContentBody(props: DisclosureContentBodyProps) {
  const [variantProps, rest] = splitProps(props, disclosureContentBody);
  return <div {...disclosureContentBody.jsx(variantProps)} {...rest} />;
}
