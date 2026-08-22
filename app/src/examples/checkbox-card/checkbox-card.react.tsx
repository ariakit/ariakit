import * as Ariakit from "@ariakit/react";
import type {
  CheckboxCardProps as CheckboxCardBaseProps,
  CheckboxCardCheckProps as CheckboxCardCheckBaseProps,
  CheckboxCardContentProps as CheckboxCardContentBaseProps,
  CheckboxCardDescriptionProps as CheckboxCardDescriptionBaseProps,
  CheckboxCardLabelProps as CheckboxCardLabelBaseProps,
} from "@ariakit/ui/ariakit/checkbox-card.react.tsx";
import {
  CheckboxCard as CheckboxCardBase,
  CheckboxCardCheck as CheckboxCardCheckBase,
  CheckboxCardContent as CheckboxCardContentBase,
  CheckboxCardDescription as CheckboxCardDescriptionBase,
  CheckboxCardLabel as CheckboxCardLabelBase,
} from "@ariakit/ui/ariakit/checkbox-card.react.tsx";
import { checkboxCardGrid } from "@ariakit/ui/styles/checkbox-card.ts";
import { clsx } from "clsx";
import type { ComponentProps } from "react";

// Round cards are pill-shaped chips: the exact full radius (no concentric
// adjustment) with tighter padding, like the legacy ak-checkbox-card-round
// (ak-frame-full/2).
const roundVariantProps = {
  $rounded: "full",
  $forceRounded: true,
  $p: 2,
} as const;

export interface CheckboxCardProps extends CheckboxCardBaseProps {
  variant?: "default" | "vertical" | "round";
}

export function CheckboxCard({
  variant = "default",
  ...props
}: CheckboxCardProps) {
  return (
    <CheckboxCardBase
      // By default, native checkboxes don't activate with the Enter key. But
      // since this custom one is styled as a button, it would confuse sighted
      // keyboard users if Enter didn't work.
      clickOnEnter
      // Making the checkbox focusable when disabled allows its checked state
      // to be passed to FormData.
      accessibleWhenDisabled
      {...(variant === "round" ? roundVariantProps : undefined)}
      {...props}
      className={clsx(
        // The vertical marker pairs with the group-[.vertical]/checkbox
        // variants on the children below (the card cv already names the
        // group/checkbox). The plain grid and justify-stretch overrides win
        // over the cv's flex and justify-start by stylesheet order.
        variant === "vertical" && "vertical grid justify-stretch",
        props.className,
      )}
    />
  );
}

export interface CheckboxCardCheckProps extends CheckboxCardCheckBaseProps {}

export function CheckboxCardCheck(props: CheckboxCardCheckProps) {
  return (
    <CheckboxCardCheckBase
      {...props}
      className={clsx(
        // In the vertical layout the check overlays the first row (shared
        // with the image), pinned to the top end like the legacy
        // ak-checkbox-card-check.
        "group-[.vertical]/checkbox:justify-self-end",
        "group-[.vertical]/checkbox:col-start-1",
        "group-[.vertical]/checkbox:row-start-1",
        props.className,
      )}
    />
  );
}

type Value = Ariakit.CheckboxStoreState["value"];

export interface CheckboxCardGridProps<T extends Value = Value>
  extends
    Omit<ComponentProps<"div">, "defaultValue">,
    Pick<
      Ariakit.CheckboxProviderProps<T>,
      "value" | "setValue" | "defaultValue"
    > {
  minItemWidth?: string;
}

export function CheckboxCardGrid<T extends Value = Value>({
  value,
  setValue,
  defaultValue,
  minItemWidth,
  ...props
}: CheckboxCardGridProps<T>) {
  return (
    <Ariakit.CheckboxProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue}
    >
      <div
        {...props}
        {...checkboxCardGrid.jsx({
          $minItemSize: minItemWidth,
          className: props.className,
          style: props.style,
        })}
      />
    </Ariakit.CheckboxProvider>
  );
}

export interface CheckboxCardLabelProps extends CheckboxCardLabelBaseProps {}

export function CheckboxCardLabel(props: CheckboxCardLabelProps) {
  return (
    <CheckboxCardLabelBase
      {...props}
      className={clsx(
        // Vertical cards center the label under the image, like the legacy
        // ak-checkbox-card-label under ak-checkbox-vertical.
        "group-[.vertical]/checkbox:w-full",
        "group-[.vertical]/checkbox:text-center",
        props.className,
      )}
    />
  );
}

export interface CheckboxCardDescriptionProps extends CheckboxCardDescriptionBaseProps {}

export function CheckboxCardDescription(props: CheckboxCardDescriptionProps) {
  return (
    <CheckboxCardDescriptionBase
      // The example descriptions wrap onto multiple lines like the legacy
      // ak-checkbox-card-description, so the package's default truncation is
      // turned off.
      $truncate={false}
      {...props}
    />
  );
}

export interface CheckboxCardContentProps extends CheckboxCardContentBaseProps {}

export function CheckboxCardContent(props: CheckboxCardContentProps) {
  return (
    <CheckboxCardContentBase
      // Horizontal, wrapping content like the legacy
      // ak-checkbox-card-content, so a check placed inside the content sits
      // next to the label instead of stacking below it.
      $orientation="horizontal"
      {...props}
    />
  );
}

export interface CheckboxCardImageProps extends ComponentProps<"div"> {}

export function CheckboxCardImage(props: CheckboxCardImageProps) {
  return (
    <div
      {...props}
      className={clsx(
        // The package card has no image piece, so the legacy
        // ak-checkbox-card-image recipe is restated with plugin utilities.
        "ak-frame ak-frame-p-2 flex h-full w-20 items-center justify-center",
        // In the vertical layout the image becomes a centered top row shared
        // with the check.
        "group-[.vertical]/checkbox:w-full",
        "group-[.vertical]/checkbox:max-w-4/5",
        "group-[.vertical]/checkbox:justify-self-center",
        "group-[.vertical]/checkbox:col-start-1",
        "group-[.vertical]/checkbox:row-start-1",
        props.className,
      )}
    />
  );
}
