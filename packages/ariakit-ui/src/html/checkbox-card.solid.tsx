import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { Show, splitProps } from "solid-js";
import {
  checkboxCard,
  checkboxCardCheck,
  checkboxCardContent,
  checkboxCardDescription,
  checkboxCardLabel,
  checkboxCardSlot,
} from "../styles/checkbox-card.ts";

export interface CheckboxCardProps
  extends ComponentProps<"input">, VariantProps<typeof checkboxCard> {}

export function CheckboxCard(props: CheckboxCardProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["children", "disabled"],
    checkboxCard.html.propKeys,
  );
  return (
    <label
      {...checkboxCard.html({
        $disabled: localProps.disabled,
        ...variantProps,
      })}
    >
      <input type="checkbox" disabled={localProps.disabled} {...rest} />
      {localProps.children}
    </label>
  );
}

export interface CheckboxCardLabelProps
  extends ComponentProps<"span">, VariantProps<typeof checkboxCardLabel> {}

export function CheckboxCardLabel(props: CheckboxCardLabelProps) {
  const [variantProps, rest] = splitProps(
    props,
    checkboxCardLabel.html.propKeys,
  );
  return <span {...checkboxCardLabel.html(variantProps)} {...rest} />;
}

export interface CheckboxCardSlotProps
  extends ComponentProps<"span">, VariantProps<typeof checkboxCardSlot> {}

export function CheckboxCardSlot(props: CheckboxCardSlotProps) {
  const [variantProps, rest] = splitProps(
    props,
    checkboxCardSlot.html.propKeys,
  );
  return <span {...checkboxCardSlot.html(variantProps)} {...rest} />;
}

export interface CheckboxCardCheckProps
  extends ComponentProps<"span">, VariantProps<typeof checkboxCardCheck> {}

export function CheckboxCardCheck(props: CheckboxCardCheckProps) {
  const [variantProps, rest] = splitProps(
    props,
    checkboxCardCheck.html.propKeys,
  );
  return (
    <span {...checkboxCardCheck.html(variantProps)} {...rest}>
      <Show when={rest.children} fallback={<CheckIcon />}>
        {rest.children}
      </Show>
    </span>
  );
}

export interface CheckboxCardContentProps
  extends ComponentProps<"span">, VariantProps<typeof checkboxCardContent> {}

export function CheckboxCardContent(props: CheckboxCardContentProps) {
  const [variantProps, rest] = splitProps(
    props,
    checkboxCardContent.html.propKeys,
  );
  return <span {...checkboxCardContent.html(variantProps)} {...rest} />;
}

export interface CheckboxCardDescriptionProps
  extends
    ComponentProps<"span">,
    VariantProps<typeof checkboxCardDescription> {}

export function CheckboxCardDescription(props: CheckboxCardDescriptionProps) {
  const [variantProps, rest] = splitProps(
    props,
    checkboxCardDescription.html.propKeys,
  );
  return <span {...checkboxCardDescription.html(variantProps)} {...rest} />;
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
