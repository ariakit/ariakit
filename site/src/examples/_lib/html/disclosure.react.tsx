import clsx from "clsx";
import * as React from "react";
import { createRender } from "#app/examples/_lib/react-utils/create-render.ts";

export interface DisclosureProps
  extends Omit<React.ComponentProps<"details">, "content"> {
  /** Custom button element or props to render a `DisclosureButton`. */
  button?: React.ReactNode | DisclosureButtonProps;
  /** Custom content element or props to render a `DisclosureContent`. */
  content?: React.ReactElement | DisclosureContentProps;
  /**
   * Applies a split layout that visually separates button and content areas.
   */
  split?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
  /** Whether the disclosure is open by default. */
  defaultOpen?: boolean;
}

/**
 * High-level disclosure using native HTML details/summary elements.
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
  baseClassName,
  button,
  content,
  defaultOpen,
  children,
  ...props
}: DisclosureProps) {
  const buttonEl = createRender(DisclosureButton, button);
  const contentEl = createRender(DisclosureContent, content);
  return (
    <details
      open={defaultOpen}
      {...props}
      className={clsx(
        "group/disclosure open:ak-disclosure_open",
        baseClassName || "ak-disclosure",
        split && "ak-disclosure-split",
        props.className,
      )}
    >
      {button != null ? (
        <>
          {buttonEl}
          {React.cloneElement(contentEl, {
            children: children ?? contentEl.props.children,
          })}
        </>
      ) : (
        children
      )}
    </details>
  );
}

export interface DisclosureGroupProps extends React.ComponentProps<"div"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureGroup({
  baseClassName,
  ...props
}: DisclosureGroupProps) {
  return (
    <div
      {...props}
      className={clsx(
        baseClassName || "ak-disclosure-group",
        "ak-layer-current border-y divide-y divide-(--ak-layer-border)",
        props.className,
      )}
    />
  );
}

export interface DisclosureButtonProps extends React.ComponentProps<"summary"> {
  /** Optional right-aligned actions rendered inside the button. */
  actions?: React.ReactNode;
  /** Secondary text shown below the main label. */
  description?: React.ReactNode;
  /** Custom base class name. */
  baseClassName?: string;
  /** Custom icon. */
  icon?: React.ReactNode;
  /**
   * Selects chevron/plus icon and placement (start, next, end). Set `false` to
   * hide.
   */
  indicator?:
    | "chevron-down-start"
    | "chevron-down-next"
    | "chevron-down-end"
    | "chevron-right-start"
    | "chevron-right-next"
    | "chevron-right-end"
    | "plus-start"
    | "plus-next"
    | "plus-end"
    | false;
}

export function DisclosureButton({
  actions,
  description,
  baseClassName,
  icon,
  indicator = icon ? "chevron-down-end" : "chevron-right-start",
  children,
  ...props
}: DisclosureButtonProps) {
  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const actionsId = `${baseId}-actions`;

  const actionsElement = actions ? (
    <div
      id={actionsId}
      onClick={(event) => event.stopPropagation()}
      className="ak-disclosure-actions"
    >
      {actions}
    </div>
  ) : null;

  const iconElement = icon ? (
    <span className="ak-disclosure-icon">{icon}</span>
  ) : null;

  const content = description ? (
    <>
      {iconElement}
      <span className="grid w-full gap-[min(var(--ak-frame-padding)/2,--spacing(2))]">
        <span className="min-w-0 flex gap-2 items-start">
          <span id={labelId}>{children}</span>
          {actionsElement}
        </span>
        <span
          id={descriptionId}
          className="ak-text/60 grid gap-[inherit] font-normal text-sm"
        >
          {description}
        </span>
      </span>
    </>
  ) : (
    <>
      {iconElement}
      <span className="min-w-0 flex gap-2 items-start">
        <span id={labelId}>{children}</span>
        {actionsElement}
      </span>
    </>
  );

  return (
    <>
      <summary
        aria-labelledby={description ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
        className={clsx(
          baseClassName || "ak-disclosure-button",
          description && "ak-command-depth-2",
          indicator === "chevron-down-start" &&
            "before:ak-disclosure-chevron-down",
          indicator === "chevron-down-next" &&
            "after:ak-disclosure-chevron-down",
          indicator === "chevron-down-end" &&
            "after:ak-disclosure-chevron-down after:ms-auto",
          indicator === "chevron-right-start" &&
            "before:ak-disclosure-chevron-right",
          indicator === "chevron-right-next" &&
            "after:ak-disclosure-chevron-right",
          indicator === "chevron-right-end" &&
            "after:ak-disclosure-chevron-right after:ms-auto",
          indicator === "plus-start" && "before:ak-disclosure-plus",
          indicator === "plus-next" && "after:ak-disclosure-plus",
          indicator === "plus-end" && "after:ak-disclosure-plus after:ms-auto",
          props.className,
        )}
      >
        {content}
      </summary>
      {actions && <div aria-owns={actionsId} />}
    </>
  );
}

export interface DisclosureContentProps
  extends React.ComponentProps<"div">,
    Pick<DisclosureContentBodyProps, "prose"> {
  /** Custom body element or props to render a `DisclosureContentBody`. */
  body?: React.ReactElement | DisclosureContentBodyProps;
  /** Applies a guide to the content. */
  guide?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureContent({
  prose,
  body,
  guide,
  baseClassName,
  children,
  ...props
}: DisclosureContentProps) {
  const bodyEl = createRender(DisclosureContentBody, body, { prose, children });
  return (
    <div
      {...props}
      className={clsx(
        "group-open/disclosure:ak-disclosure-content_open",
        baseClassName || "ak-disclosure-content",
        guide && "ak-disclosure-guide",
        props.className,
      )}
    >
      {bodyEl}
    </div>
  );
}

export interface DisclosureContentBodyProps
  extends React.ComponentProps<"div"> {
  /** Applies prose typography and spacing to the content body. */
  prose?: boolean;
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureContentBody({
  prose,
  baseClassName,
  ...props
}: DisclosureContentBodyProps) {
  return (
    <div
      {...props}
      className={clsx(
        baseClassName || "ak-disclosure-content-body",
        prose &&
          "ak-prose ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))]",
        props.className,
      )}
    />
  );
}
