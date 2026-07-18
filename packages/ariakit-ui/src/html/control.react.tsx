import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import {
  control,
  controlContent,
  controlDescription,
  controlGroup,
  controlLabel,
  controlSeparator,
  controlSlot,
} from "../styles/control.ts";

export interface ControlProps
  extends ComponentProps<"div">, VariantProps<typeof control> {}

/**
 * Control row that sizes and spaces its parts. Provides the control channel
 * read by ControlSlot, ControlContent, ControlLabel, and ControlDescription.
 */
export function Control(props: ControlProps) {
  const [variantProps, rest] = splitProps(props, control);
  // A div has no native disabled state, so the disabled visuals key off
  // aria-disabled. An explicit $disabled prop still wins.
  const disabled =
    props["aria-disabled"] === true || props["aria-disabled"] === "true";
  return (
    <div
      {...control.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? disabled,
      })}
      {...rest}
    />
  );
}

export interface ControlSlotProps
  extends ComponentProps<"span">, VariantProps<typeof controlSlot> {}

/**
 * Fixed-size slot for icons, avatars, badges, and shortcuts. Expects a
 * Control ancestor: it sizes itself from the control's font and reads the
 * control channel for the disabled visuals.
 */
export function ControlSlot(props: ControlSlotProps) {
  const [variantProps, rest] = splitProps(props, controlSlot);
  const variants = controlSlot.getVariants(variantProps);
  return (
    <span {...controlSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </span>
  );
}

export interface ControlContentProps
  extends ComponentProps<"span">, VariantProps<typeof controlContent> {}

/**
 * Flexible content area that hosts the control's label and description.
 * Expects a Control ancestor: it inherits the control's gap variables.
 */
export function ControlContent(props: ControlContentProps) {
  const [variantProps, rest] = splitProps(props, controlContent);
  return <span {...controlContent.jsx(variantProps)} {...rest} />;
}

export interface ControlLabelProps
  extends ComponentProps<"span">, VariantProps<typeof controlLabel> {}

/**
 * Control label text. Expects Control and ControlContent ancestors: it reads
 * their channels for the disabled visuals and the content layout.
 */
export function ControlLabel(props: ControlLabelProps) {
  const [variantProps, rest] = splitProps(props, controlLabel);
  return <span {...controlLabel.jsx(variantProps)} {...rest} />;
}

export interface ControlDescriptionProps
  extends ComponentProps<"span">, VariantProps<typeof controlDescription> {}

/**
 * Secondary text below the control's label. Expects a Control ancestor
 * (usually inside ControlContent): it reads the control channel for the
 * disabled visuals.
 */
export function ControlDescription(props: ControlDescriptionProps) {
  const [variantProps, rest] = splitProps(props, controlDescription);
  return <span {...controlDescription.jsx(variantProps)} {...rest} />;
}

export interface ControlSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof controlSeparator> {}

/**
 * Separator drawn between sibling controls. Expects the control group
 * channels: it hides in vertical groups and, when shy, fades next to
 * hovered, selected, or focused controls.
 */
export function ControlSeparator(props: ControlSeparatorProps) {
  const [variantProps, rest] = splitProps(props, controlSeparator);
  return <div {...controlSeparator.jsx(variantProps)} {...rest} />;
}

export interface ControlGroupProps
  extends ComponentProps<"div">, VariantProps<typeof controlGroup> {}

/**
 * Groups sibling controls, sizing them together and providing the group
 * channels that ControlSeparator and the layout variants read.
 */
export function ControlGroup(props: ControlGroupProps) {
  const [variantProps, rest] = splitProps(props, controlGroup);
  return <div {...controlGroup.jsx(variantProps)} {...rest} />;
}
