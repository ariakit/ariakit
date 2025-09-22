import * as ak from "@ariakit/react";
import clsx from "clsx";
import type * as React from "react";

interface UnorderedListProps extends React.ComponentProps<"ul"> {}

interface OrderedListProps extends React.ComponentProps<"ol"> {
  ordered: true;
}

export type ListProps = UnorderedListProps | OrderedListProps;

export function List(props: ListProps) {
  if ("ordered" in props) {
    const { ordered, ...rest } = props;
    return <ol {...rest} className={clsx("ak-list", rest.className)} />;
  }
  return <ul {...props} className={clsx("ak-list", props.className)} />;
}

export interface ListItemCheckProps extends React.ComponentProps<"span"> {
  checked?: boolean | number;
  item?: boolean;
}

export function ListItemCheck({
  checked,
  item = true,
  ...props
}: ListItemCheckProps) {
  if (checked == null) {
    return null;
  }
  const inProgress = typeof checked === "number" && checked < 1;
  const isChecked = checked === true || checked === 1;
  return (
    <span
      style={
        inProgress ? ({ "--progress": checked } as React.CSSProperties) : {}
      }
      className={clsx(
        item
          ? [
              "ak-list-item-check",
              isChecked && "ak-list-item-check_checked",
              inProgress && `ak-list-item-check-progress-(--progress)`,
            ]
          : [
              "ak-list-check",
              isChecked && "ak-list-item-check_checked",
              inProgress && `ak-list-item-check-progress-(--progress)`,
            ],
        props.className,
      )}
    />
  );
}
export interface ListItemProps
  extends React.ComponentProps<"li">,
    Omit<ListItemCheckProps, keyof React.ComponentProps<"span">> {}

export function ListItem({ checked, ...props }: ListItemProps) {
  return (
    <li {...props} className={clsx("ak-list-item", props.className)}>
      <ListItemCheck checked={checked} />
      {props.children}
    </li>
  );
}

export interface ListItemDisclosureProps
  extends React.ComponentProps<"div">,
    Pick<ak.DisclosureProviderProps, "open" | "setOpen" | "defaultOpen"> {}

export function ListItemDisclosure({
  open,
  setOpen,
  defaultOpen,
  ...props
}: ListItemDisclosureProps) {
  const disclosure = ak.useDisclosureStore({ open, setOpen, defaultOpen });
  const isOpen = ak.useStoreState(disclosure, "open");
  return (
    <ak.DisclosureProvider store={disclosure}>
      <div
        {...props}
        data-open={isOpen || undefined}
        className={clsx(
          "ak-list-item-disclosure data-open:ak-list-item-disclosure_open ak-frame-field data-open:ak-layer-pop",
          props.className,
        )}
      />
    </ak.DisclosureProvider>
  );
}

export interface ListItemDisclosureButtonProps
  extends ak.DisclosureProps,
    Omit<ListItemCheckProps, keyof React.ComponentProps<"span">> {
  icon?:
    | "chevron-before"
    | "chevron-after"
    | "chevron-next"
    | "plus-before"
    | "plus-after"
    | false;
}

export function ListItemDisclosureButton({
  icon = "chevron-after",
  checked,
  ...props
}: ListItemDisclosureButtonProps) {
  return (
    <ak.Disclosure
      {...props}
      className={clsx(
        "ak-list-item-disclosure-button",
        icon === "chevron-before" && "before:ak-disclosure-chevron-right",
        icon === "chevron-after" && "after:ak-disclosure-chevron-down",
        icon === "chevron-next" &&
          "after:ak-disclosure-chevron-down after:ms-0",
        icon === "plus-before" && "before:ak-disclosure-plus",
        icon === "plus-after" && "after:ak-disclosure-plus",
        props.className,
      )}
    >
      <ListItemCheck checked={checked} />
      {props.children}
    </ak.Disclosure>
  );
}

export interface ListItemDisclosureContentProps
  extends ak.DisclosureContentProps {
  prose?: boolean;
}

export function ListItemDisclosureContent({
  prose,
  ...props
}: ListItemDisclosureContentProps) {
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
          "ak-list-item-disclosure-content-child",
          prose &&
            "ak-prose ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))]",
        )}
      >
        {props.children}
      </div>
    </ak.DisclosureContent>
  );
}
