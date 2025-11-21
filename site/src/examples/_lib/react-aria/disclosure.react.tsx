import clsx from "clsx";
import * as React from "react";
import * as rac from "react-aria-components";
import { createRender } from "#app/examples/_lib/react-utils/create-render.ts";

export interface DisclosureProps extends Omit<rac.DisclosureProps, "children"> {
  button?: React.ReactNode | DisclosureButtonProps;
  content?: React.ReactElement | DisclosureContentProps;
  split?: boolean;
  baseClassName?: string;
  children?: React.ReactNode;
}

export function Disclosure({
  split,
  baseClassName,
  button,
  content,
  children,
  ...props
}: DisclosureProps) {
  const buttonEl = createRender(DisclosureButton, button);
  const contentEl = createRender(DisclosureContent, content, { children });
  return (
    <rac.Disclosure
      {...props}
      className={clsx(
        "data-expanded:ak-disclosure_open",
        baseClassName || "ak-disclosure",
        split && "ak-disclosure-split",
        props.className,
      )}
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

export interface DisclosureGroupProps extends React.ComponentProps<"div"> {
  baseClassName?: string;
  render?: React.ReactElement;
}

export function DisclosureGroup({
  baseClassName,
  render,
  ...props
}: DisclosureGroupProps) {
  return createRender("div", render, {
    ...props,
    className: clsx(
      baseClassName || "ak-disclosure-group",
      "ak-layer-current border-y divide-y divide-(--ak-layer-border)",
      props.className,
    ),
  });
}

export interface DisclosureButtonProps
  extends Omit<rac.ButtonProps, "children"> {
  actions?: React.ReactNode;
  description?: React.ReactNode;
  baseClassName?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
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
      <rac.Button
        slot="trigger"
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
      </rac.Button>
      {actions && <div aria-owns={actionsId} />}
    </>
  );
}

export interface DisclosureContentProps
  extends rac.DisclosurePanelProps,
    Pick<DisclosureContentBodyProps, "prose"> {
  body?: React.ReactElement | DisclosureContentBodyProps;
  guide?: boolean;
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
    <rac.DisclosurePanel
      {...props}
      className={clsx(
        "data-expanded:ak-disclosure-content_open",
        baseClassName || "ak-disclosure-content",
        guide && "ak-disclosure-guide",
        props.className,
      )}
    >
      {bodyEl}
    </rac.DisclosurePanel>
  );
}

export interface DisclosureContentBodyProps
  extends React.ComponentProps<"div"> {
  prose?: boolean;
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
