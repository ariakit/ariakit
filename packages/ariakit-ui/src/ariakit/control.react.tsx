import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
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
  extends ak.RoleProps<"div">, VariantProps<typeof control> {}

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
    <ak.Role.div
      {...control.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? disabled,
      })}
      {...rest}
    />
  );
}

export interface ControlSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof controlSlot> {}

/**
 * Fixed-size slot for icons, avatars, badges, and shortcuts. Expects a
 * Control ancestor: it sizes itself from the control's font and reads the
 * control channel for the disabled visuals.
 */
export function ControlSlot(props: ControlSlotProps) {
  const [variantProps, rest] = splitProps(props, controlSlot);
  const variants = controlSlot.getVariants(variantProps);
  return (
    <ak.Role.span {...controlSlot.jsx(variantProps)} {...rest}>
      {variants.$kind === "badge" ? (
        <span>{rest.children}</span>
      ) : (
        rest.children
      )}
    </ak.Role.span>
  );
}

export interface ControlContentProps
  extends ak.RoleProps<"span">, VariantProps<typeof controlContent> {}

/**
 * Flexible content area that hosts the control's label and description.
 * Expects a Control ancestor: it inherits the control's gap variables.
 */
export function ControlContent(props: ControlContentProps) {
  const [variantProps, rest] = splitProps(props, controlContent);
  return <ak.Role.span {...controlContent.jsx(variantProps)} {...rest} />;
}

export interface ControlLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof controlLabel> {}

/**
 * Control label text. Expects Control and ControlContent ancestors: it reads
 * their channels for the disabled visuals and the content layout.
 */
export function ControlLabel(props: ControlLabelProps) {
  const [variantProps, rest] = splitProps(props, controlLabel);
  return <ak.Role.span {...controlLabel.jsx(variantProps)} {...rest} />;
}

export interface ControlDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof controlDescription> {}

/**
 * Secondary text below the control's label. Expects a Control ancestor
 * (usually inside ControlContent): it reads the control channel for the
 * disabled visuals.
 */
export function ControlDescription(props: ControlDescriptionProps) {
  const [variantProps, rest] = splitProps(props, controlDescription);
  return <ak.Role.span {...controlDescription.jsx(variantProps)} {...rest} />;
}

export interface ControlSeparatorProps
  extends ak.RoleProps<"div">, VariantProps<typeof controlSeparator> {}

/**
 * Separator drawn between sibling controls. Expects the control group
 * channels: it hides in vertical groups and, when shy, fades next to
 * hovered, selected, or focused controls.
 */
export function ControlSeparator(props: ControlSeparatorProps) {
  const [variantProps, rest] = splitProps(props, controlSeparator);
  return <ak.Role.div {...controlSeparator.jsx(variantProps)} {...rest} />;
}

export interface ControlGroupProps
  extends ak.GroupProps, VariantProps<typeof controlGroup> {}

/**
 * Groups sibling controls, sizing them together and providing the group
 * channels that ControlSeparator and the layout variants read.
 */
export function ControlGroup(props: ControlGroupProps) {
  const [variantProps, rest] = splitProps(props, controlGroup);
  return <ak.Group {...controlGroup.jsx(variantProps)} {...rest} />;
}
