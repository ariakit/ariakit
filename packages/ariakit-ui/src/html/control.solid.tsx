import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { Show, splitProps } from "solid-js";
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
  const [variantProps, rest] = splitProps(props, control.html.propKeys);
  // A div has no native disabled state, so the disabled visuals key off
  // aria-disabled. The accessor is called inside the JSX spread so it stays
  // reactive, and an explicit $disabled prop still wins.
  const disabled = () =>
    props["aria-disabled"] === true || props["aria-disabled"] === "true";
  return (
    <div
      {...control.html({ $disabled: disabled(), ...variantProps })}
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
  const [variantProps, rest] = splitProps(props, controlSlot.html.propKeys);
  return (
    <span {...controlSlot.html(variantProps)} {...rest}>
      {/* getVariants runs inside the JSX so the badge check stays reactive */}
      <Show
        when={controlSlot.getVariants(variantProps).$kind === "badge"}
        fallback={rest.children}
      >
        <span>{rest.children}</span>
      </Show>
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
  const [variantProps, rest] = splitProps(props, controlContent.html.propKeys);
  return <span {...controlContent.html(variantProps)} {...rest} />;
}

export interface ControlLabelProps
  extends ComponentProps<"span">, VariantProps<typeof controlLabel> {}

/**
 * Control label text. Expects Control and ControlContent ancestors: it reads
 * their channels for the disabled visuals and the content layout.
 */
export function ControlLabel(props: ControlLabelProps) {
  const [variantProps, rest] = splitProps(props, controlLabel.html.propKeys);
  return <span {...controlLabel.html(variantProps)} {...rest} />;
}

export interface ControlDescriptionProps
  extends ComponentProps<"span">, VariantProps<typeof controlDescription> {}

/**
 * Secondary text below the control's label. Expects a Control ancestor
 * (usually inside ControlContent): it reads the control channel for the
 * disabled visuals.
 */
export function ControlDescription(props: ControlDescriptionProps) {
  const [variantProps, rest] = splitProps(
    props,
    controlDescription.html.propKeys,
  );
  return <span {...controlDescription.html(variantProps)} {...rest} />;
}

export interface ControlSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof controlSeparator> {}

/**
 * Separator drawn between sibling controls. Expects the control group
 * channels: it hides in vertical groups and, when shy, fades next to
 * hovered, selected, or focused controls.
 */
export function ControlSeparator(props: ControlSeparatorProps) {
  const [variantProps, rest] = splitProps(
    props,
    controlSeparator.html.propKeys,
  );
  return <div {...controlSeparator.html(variantProps)} {...rest} />;
}

export interface ControlGroupProps
  extends ComponentProps<"div">, VariantProps<typeof controlGroup> {}

/**
 * Groups sibling controls, sizing them together and providing the group
 * channels that ControlSeparator and the layout variants read.
 */
export function ControlGroup(props: ControlGroupProps) {
  const [variantProps, rest] = splitProps(props, controlGroup.html.propKeys);
  return <div {...controlGroup.html(variantProps)} {...rest} />;
}
