import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import * as rac from "react-aria-components";
import { createRender } from "../react-utils/create-render.ts";
import type { DisclosureIndicator } from "../react-utils/disclosure-indicator.react.tsx";
import { renderIndicator } from "../react-utils/disclosure-indicator.react.tsx";
import {
  disclosure,
  disclosureActions,
  disclosureButton,
  disclosureContent,
  disclosureContentBody,
  disclosureGroup,
  disclosureIcon,
} from "../styles/disclosure.ts";

export interface DisclosureProps
  extends
    Omit<rac.DisclosureProps, "children" | "className" | "style">,
    VariantProps<typeof disclosure> {
  /** Custom button element or props to render a `DisclosureButton`. */
  button?: React.ReactNode | DisclosureButtonProps;
  /** Custom content element or props to render a `DisclosureContent`. */
  content?: React.ReactElement | DisclosureContentProps;
  /**
   * Applies a split layout that visually separates button and content areas.
   */
  split?: boolean;
  // Deliberately narrowed from rac's render-prop functions to plain values
  // so they can merge through the cv output.
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * High-level disclosure that wires button and content through the React Aria
 * disclosure primitive.
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
  split,
  button,
  content,
  children,
  ...props
}: DisclosureProps) {
  const [variantProps, rest] = splitProps(props, disclosure);
  const buttonEl = createRender(DisclosureButton, button);
  const contentEl = createRender(DisclosureContent, content, { children });
  return (
    <rac.Disclosure
      {...disclosure.jsx({
        $split: split,
        // rac publishes the expanded state through the data-expanded
        // attribute; route it into the cv's open channel so descendants
        // react to it like they do to the ariakit flavor's data-open.
        class: "data-expanded:[--disclosure-open:1]",
        ...variantProps,
      })}
      {...rest}
    >
      {button != null ? (
        <>
          {buttonEl}
          {contentEl}
        </>
      ) : (
        children
      )}
    </rac.Disclosure>
  );
}

export interface DisclosureGroupProps
  extends React.ComponentProps<"div">, VariantProps<typeof disclosureGroup> {
  render?: React.ReactElement;
}

export function DisclosureGroup({
  render,
  ...props
}: DisclosureGroupProps): React.ReactElement {
  const [variantProps, rest] = splitProps(props, disclosureGroup);
  return createRender("div", render, {
    ...disclosureGroup.jsx(variantProps),
    ...rest,
  });
}

export interface DisclosureButtonProps
  extends
    Omit<rac.ButtonProps, "children" | "className" | "style">,
    VariantProps<typeof disclosureButton> {
  /**
   * Optional right-aligned actions rendered inside the button. Unlike the
   * ariakit flavor, rac renders a native button that cannot swap to a div,
   * so interactive actions nest inside it (invalid content model, inherited
   * from the legacy wrapper) — prefer the ariakit flavor when actions must
   * be interactive.
   */
  actions?: React.ReactNode;
  /** Secondary text shown below the main label. */
  description?: React.ReactNode;
  /** Custom icon. */
  icon?: React.ReactNode;
  /**
   * Selects chevron/plus indicator and placement (start, next, end). Set
   * `false` to hide.
   */
  indicator?: DisclosureIndicator | false;
  // Deliberately narrowed from rac's render-prop functions to plain values
  // so they can merge through the cv output.
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function DisclosureButton({
  actions,
  description,
  icon,
  indicator = icon ? "chevron-down-end" : "chevron-right-start",
  children,
  ...props
}: DisclosureButtonProps) {
  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const actionsId = `${baseId}-actions`;
  const [variantProps, rest] = splitProps(props, disclosureButton);
  // A nullish check, not truthiness: falsy labels like {0} must still
  // render, since aria-labelledby references the span when a description
  // exists.
  const labelElement =
    children != null ? <span id={labelId}>{children}</span> : null;
  const actionsElement = actions ? (
    <div
      id={actionsId}
      onClick={(event) => event.stopPropagation()}
      {...disclosureActions.jsx({})}
    >
      {actions}
    </div>
  ) : null;
  const labelWrapperElement = (
    <span className="min-w-0 flex gap-2 items-start">
      {labelElement}
      {actionsElement}
    </span>
  );
  const iconElement = icon ? (
    <span {...disclosureIcon.jsx({})}>{icon}</span>
  ) : null;
  const indicatorEl = indicator ? renderIndicator(indicator) : null;
  const atStart = indicator ? indicator.endsWith("-start") : false;
  return (
    <>
      <rac.Button
        slot="trigger"
        aria-labelledby={description ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        {...disclosureButton.jsx({
          // Taller buttons press deeper, like the legacy ak-command-depth-2.
          ...(description ? { $activeDepth: 2, $activeDepthX: 2 } : null),
          ...variantProps,
        })}
        {...rest}
      >
        {atStart && indicatorEl}
        {iconElement}
        {description ? (
          <span className="grid w-full gap-[min(var(--ak-frame-padding)/2,--spacing(2))]">
            {labelWrapperElement}
            <span
              id={descriptionId}
              className="ak-ink-60 grid gap-[inherit] font-normal text-sm"
            >
              {description}
            </span>
          </span>
        ) : (
          labelWrapperElement
        )}
        {!atStart && indicatorEl}
      </rac.Button>
      {actions && <div aria-owns={actionsId} />}
    </>
  );
}

export interface DisclosureContentProps
  extends
    Omit<rac.DisclosurePanelProps, "children" | "className" | "style">,
    VariantProps<typeof disclosureContent> {
  /** Custom body element or props to render a `DisclosureContentBody`. */
  body?: React.ReactElement | DisclosureContentBodyProps;
  /** Applies a guide to the content. */
  guide?: boolean;
  // Deliberately narrowed from rac's render-prop functions to plain values
  // so they can merge through the cv output.
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function DisclosureContent({
  body,
  guide,
  children,
  ...props
}: DisclosureContentProps) {
  const [variantProps, rest] = splitProps(props, disclosureContent);
  const bodyEl = createRender(DisclosureContentBody, body, { children });
  return (
    <rac.DisclosurePanel
      {...disclosureContent.jsx({ $guide: guide, ...variantProps })}
      {...rest}
    >
      {bodyEl}
    </rac.DisclosurePanel>
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
