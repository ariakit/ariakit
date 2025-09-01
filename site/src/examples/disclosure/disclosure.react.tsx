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
    Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen"> {}

export function Disclosure({
  open,
  setOpen,
  defaultOpen,
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
          "ak-disclosure data-open:ak-disclosure_open",
          props.className,
        )}
      />
    </ak.DisclosureProvider>
  );
}

export interface DisclosureButtonProps extends ak.DisclosureProps {
  checked?: boolean | number;
  description?: React.ReactNode;
  icon?:
    | "chevron-before"
    | "chevron-after"
    | "chevron-next"
    | "plus-before"
    | "plus-after"
    | false;
}

export function DisclosureButton({
  checked,
  description,
  icon = "chevron-before",
  ...props
}: DisclosureButtonProps) {
  const baseId = React.useId();
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  return (
    <ak.Disclosure
      {...props}
      aria-labelledby={description ? labelId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={clsx(
        "ak-disclosure-button",
        icon === "chevron-before" && "before:ak-disclosure-chevron-before",
        icon === "chevron-after" && "after:ak-disclosure-chevron-after",
        icon === "chevron-next" &&
          "after:ak-disclosure-chevron-after after:ms-0",
        icon === "plus-before" && "before:ak-disclosure-plus-before",
        icon === "plus-after" && "after:ak-disclosure-plus-after",
        props.className,
      )}
    >
      {description ? (
        <span className="grid gap-2">
          <span id={labelId}>{props.children}</span>
          <span
            id={descriptionId}
            className="ak-text/60 grid gap-[inherit] font-normal text-sm"
          >
            {description}
          </span>
        </span>
      ) : (
        props.children
      )}
    </ak.Disclosure>
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
