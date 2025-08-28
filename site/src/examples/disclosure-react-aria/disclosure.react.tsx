import clsx from "clsx";
import * as rac from "react-aria-components";

export interface DisclosureGroupProps extends rac.DisclosureGroupProps {}

export function DisclosureGroup(props: DisclosureGroupProps) {
  return (
    <rac.DisclosureGroup
      {...props}
      className={clsx(
        "ak-disclosure-group ak-frame-card ak-frame-border ak-layer divide-y",
        props.className,
      )}
    />
  );
}

export interface DisclosureProps extends rac.DisclosureProps {}

export function Disclosure(props: DisclosureProps) {
  return (
    <rac.Disclosure
      {...props}
      className={clsx(
        "ak-disclosure data-expanded:ak-disclosure_open ak-frame-card",
        props.className,
      )}
    />
  );
}

export interface DisclosureButtonProps extends rac.ButtonProps {
  chevronPosition?: "before" | "after" | "none";
}

export function DisclosureButton({
  chevronPosition = "before",
  ...props
}: DisclosureButtonProps) {
  return (
    <rac.Button
      slot="trigger"
      {...props}
      className={clsx(
        "ak-disclosure-button",
        chevronPosition === "before" && "before:ak-disclosure-chevron-before",
        chevronPosition === "after" && "after:ak-disclosure-chevron-after",
        props.className,
      )}
    />
  );
}

export interface DisclosureContentProps extends rac.DisclosurePanelProps {
  prose?: boolean;
}

export function DisclosureContent({ prose, ...props }: DisclosureContentProps) {
  return (
    <rac.DisclosurePanel
      {...props}
      className={clsx("ak-disclosure-content", props.className)}
    >
      <div
        className={clsx(prose && "ak-prose ak-prose-gap-(--ak-frame-padding)")}
      >
        {props.children}
      </div>
    </rac.DisclosurePanel>
  );
}
