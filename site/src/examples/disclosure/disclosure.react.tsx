import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";

export interface DisclosureGroupProps extends React.ComponentProps<"div"> {}

export function DisclosureGroup(props: DisclosureGroupProps) {
  return (
    <div
      {...props}
      className={clsx(
        "ak-disclosure-group ak-layer-current border-y divide-y divide-(--ak-layer-border)",
        props.className,
      )}
    />
  );
}

export interface DisclosureProps
  extends React.ComponentProps<"div">,
    Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen"> {
  split?: boolean;
}

export function Disclosure({
  open,
  setOpen,
  defaultOpen,
  split,
  ...props
}: DisclosureProps) {
  const disclosure = ak.useDisclosureStore({ open, setOpen, defaultOpen });
  const isOpen = ak.useStoreState(disclosure, "open");
  return (
    <ak.DisclosureProvider store={disclosure}>
      <div
        {...props}
        data-open={isOpen || undefined}
        className={clsx(
          "ak-disclosure data-open:ak-disclosure_open relative",
          split && "ak-disclosure-split",
          props.className,
        )}
      />
    </ak.DisclosureProvider>
  );
}

export interface DisclosureButtonProps extends ak.DisclosureProps {
  checked?: boolean | number;
  actions?: React.ReactNode;
  description?: React.ReactNode;
  icon?:
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
  checked,
  actions,
  description,
  icon = "chevron-right-start",
  ...props
}: DisclosureButtonProps) {
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
  return (
    <>
      <ak.Disclosure
        render={actionsElement ? <div /> : undefined}
        {...props}
        data-disclosure-button
        aria-labelledby={description ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={clsx(
          "ak-disclosure-button",
          description && "ak-command-depth-2",
          icon === "chevron-down-start" && "before:ak-disclosure-chevron-down",
          icon === "chevron-down-next" && "after:ak-disclosure-chevron-down",
          icon === "chevron-down-end" &&
            "after:ak-disclosure-chevron-down after:ms-auto",
          icon === "chevron-right-start" &&
            "before:ak-disclosure-chevron-right",
          icon === "chevron-right-next" && "after:ak-disclosure-chevron-right",
          icon === "chevron-right-end" &&
            "after:ak-disclosure-chevron-right after:ms-auto",
          icon === "plus-start" && "before:ak-disclosure-plus",
          icon === "plus-next" && "after:ak-disclosure-plus",
          icon === "plus-end" && "after:ak-disclosure-plus after:ms-auto",
          props.className,
        )}
      >
        {description ? (
          <span className="grid w-full gap-[min(var(--ak-frame-padding)/2,--spacing(2))]">
            <span className="min-w-0 flex gap-2 w-full items-start">
              {labelElement}
              {actionsElement}
            </span>
            <span
              id={descriptionId}
              className="ak-text/60 grid gap-[inherit] font-normal text-sm"
            >
              {description}
            </span>
          </span>
        ) : (
          <span className="min-w-0 flex gap-2 w-full items-start">
            {labelElement}
            {actionsElement}
          </span>
        )}
      </ak.Disclosure>
      {actions && <div aria-owns={actionsId} />}
    </>
  );
}

export interface DisclosureContentProps extends ak.DisclosureContentProps {
  prose?: boolean;
}

export function DisclosureContent({ prose, ...props }: DisclosureContentProps) {
  return (
    <ak.DisclosureContent
      {...props}
      className={clsx(
        "ak-disclosure-content data-open:ak-disclosure-content_open",
        props.className,
      )}
    >
      <div
        className={clsx(
          prose &&
            "ak-prose ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))]",
        )}
      >
        {props.children}
      </div>
    </ak.DisclosureContent>
  );
}
