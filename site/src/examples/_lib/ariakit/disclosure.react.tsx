import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import { createRender } from "#app/examples/_lib/react-utils/create-render.ts";

export interface DisclosureProps
  extends Omit<ak.RoleProps<"div">, "content">,
    Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen"> {
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
  baseClassName,
  button,
  content,
  ...props
}: DisclosureProps) {
  const disclosure = ak.useDisclosureStore({ open, setOpen, defaultOpen });
  const isOpen = ak.useStoreState(disclosure, "open");
  const buttonEl = createRender(DisclosureButton, button);
  const contentEl = createRender(DisclosureContent, content);
  return (
    <ak.DisclosureProvider store={disclosure}>
      <ak.Role
        {...props}
        data-open={isOpen || undefined}
        className={clsx(
          "data-open:ak-disclosure_open",
          baseClassName || "ak-disclosure",
          split && "ak-disclosure-split",
          props.className,
        )}
      >
        {button != null ? (
          <>
            <ak.Role render={buttonEl} />
            <ak.Role render={contentEl}>{props.children}</ak.Role>
          </>
        ) : (
          props.children
        )}
      </ak.Role>
    </ak.DisclosureProvider>
  );
}

export interface DisclosureGroupProps extends ak.RoleProps<"div"> {
  /** Custom base class name. */
  baseClassName?: string;
}

export function DisclosureGroup({
  baseClassName,
  ...props
}: DisclosureGroupProps) {
  return (
    <ak.Role
      {...props}
      className={clsx(
        baseClassName || "ak-disclosure-group",
        "ak-layer-current border-y divide-y divide-(--ak-layer-border)",
        props.className,
      )}
    />
  );
}

export interface DisclosureButtonProps extends ak.DisclosureProps {
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
  ...props
}: DisclosureButtonProps) {
  const store = ak.useDisclosureContext();
  const isOpen = ak.useStoreState(store, "open");
  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const actionsId = `${baseId}-actions`;
  const labelElement = props.children ? (
    <span id={labelId}>{props.children}</span>
  ) : null;
  const actionsElement = actions ? (
    <div
      id={actionsId}
      onClick={(event) => event.stopPropagation()}
      className="ak-disclosure-actions"
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
    <span className="ak-disclosure-icon">{icon}</span>
  ) : null;
  return (
    <>
      <ak.Disclosure
        render={actionsElement ? <div /> : undefined}
        data-disclosure-button
        aria-labelledby={description ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        data-open={isOpen || undefined}
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
        {description ? (
          <>
            {iconElement}
            <span className="grid w-full gap-[min(var(--ak-frame-padding)/2,--spacing(2))]">
              {labelWrapperElement}
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
            {labelWrapperElement}
          </>
        )}
      </ak.Disclosure>
      {actions && <div aria-owns={actionsId} />}
    </>
  );
}

export interface DisclosureContentProps
  extends ak.DisclosureContentProps,
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
  ...props
}: DisclosureContentProps) {
  const bodyEl = createRender(DisclosureContentBody, body, { prose });
  return (
    <ak.DisclosureContent
      {...props}
      className={clsx(
        "data-open:ak-disclosure-content_open",
        baseClassName || "ak-disclosure-content",
        guide && "ak-disclosure-guide",
        props.className,
      )}
    >
      <ak.Role render={bodyEl}>{props.children}</ak.Role>
    </ak.DisclosureContent>
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
