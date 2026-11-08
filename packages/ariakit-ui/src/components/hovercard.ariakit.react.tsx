import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { hasContent } from "../react-utils/create-render.react.ts";
import {
  hovercard,
  hovercardDescription,
  hovercardDisclosure,
  hovercardDismiss,
  hovercardHeading,
} from "../styles/hovercard.ts";
import { popoverPositioner } from "../styles/popover.ts";
import { ButtonSlot } from "./button.ariakit.react.tsx";
import { usePopoverPositionerProps } from "./popover.ariakit.react.tsx";

export interface HovercardProviderProps extends ak.HovercardProviderProps {}

/**
 * Shares open state, timeouts, and the active anchor between a hovercard and
 * its anchors. One provider can hold several anchors that share one hovercard,
 * which reads the anchor that it shows for from the `anchorElement` state of
 * the store.
 * @example
 * <HovercardProvider>
 *   <HovercardAnchor href="/profile/kai">Kai</HovercardAnchor>
 *   <Hovercard>
 *     <HovercardHeading>Kai Tanaka</HovercardHeading>
 *   </Hovercard>
 * </HovercardProvider>
 */
export function HovercardProvider(props: HovercardProviderProps) {
  return <ak.HovercardProvider {...props} />;
}

export interface HovercardAnchorProps extends ak.HovercardAnchorProps {}

/**
 * Shows its hovercard when the pointer rests on it, after the show timeout of
 * the store. It renders a link by default.
 * @example
 * <HovercardProvider>
 *   <HovercardAnchor href="/profile/kai">Kai</HovercardAnchor>
 *   <Hovercard>
 *     <HovercardHeading>Kai Tanaka</HovercardHeading>
 *   </Hovercard>
 * </HovercardProvider>
 */
export function HovercardAnchor(props: HovercardAnchorProps) {
  return <ak.HovercardAnchor {...props} />;
}

export interface HovercardProps
  extends
    ak.HovercardProps,
    VariantProps<typeof hovercard>,
    VariantProps<typeof popoverPositioner> {}

/**
 * Renders the hovercard popup next to its anchor, with an 8px gutter by
 * default. People can move the pointer onto it, and it stays while they hover
 * it. Escape closes it. Several anchors in one `HovercardProvider` can share
 * it; `$slide` makes it slide from one anchor to the next.
 * @example
 * <HovercardProvider>
 *   <HovercardAnchor href="/profile/kai">Kai</HovercardAnchor>
 *   <Hovercard>
 *     <HovercardHeading>Kai Tanaka</HovercardHeading>
 *     <HovercardDescription>Designer in Lisbon.</HovercardDescription>
 *   </Hovercard>
 * </HovercardProvider>
 * @example
 * function SharedHovercard() {
 *   const store = useHovercardContext();
 *   const anchor = useStoreState(store, "anchorElement");
 *   return (
 *     <Hovercard $slide>
 *       <HovercardHeading>{anchor?.textContent}</HovercardHeading>
 *     </Hovercard>
 *   );
 * }
 */
export function Hovercard({
  gutter = 8,
  wrapperProps,
  ...props
}: HovercardProps) {
  const [variantProps, positionerProps, rest] = splitProps(
    props,
    hovercard,
    popoverPositioner,
  );
  const positioner = usePopoverPositionerProps(positionerProps, wrapperProps);
  return (
    <ak.Hovercard
      gutter={gutter}
      wrapperProps={positioner}
      {...hovercard.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface HovercardArrowProps extends ak.HovercardArrowProps {}

/**
 * Renders an arrow that points from the hovercard to its anchor.
 * @example
 * <Hovercard>
 *   <HovercardArrow />
 *   <HovercardHeading>Kai Tanaka</HovercardHeading>
 * </Hovercard>
 */
export function HovercardArrow(props: HovercardArrowProps) {
  return <ak.HovercardArrow {...props} />;
}

export interface HovercardHeadingProps
  extends ak.HovercardHeadingProps, VariantProps<typeof hovercardHeading> {}

/**
 * Renders a heading that gives its hovercard an accessible name.
 * @example
 * <Hovercard>
 *   <HovercardHeading>Kai Tanaka</HovercardHeading>
 * </Hovercard>
 */
export function HovercardHeading(props: HovercardHeadingProps) {
  const [variantProps, rest] = splitProps(props, hovercardHeading);
  return (
    <ak.HovercardHeading {...hovercardHeading.jsx(variantProps)} {...rest} />
  );
}

export interface HovercardDescriptionProps
  extends
    ak.HovercardDescriptionProps,
    VariantProps<typeof hovercardDescription> {}

/**
 * Renders text that describes its hovercard to assistive technology.
 * @example
 * <Hovercard>
 *   <HovercardHeading>Kai Tanaka</HovercardHeading>
 *   <HovercardDescription>Designer in Lisbon.</HovercardDescription>
 * </Hovercard>
 */
export function HovercardDescription(props: HovercardDescriptionProps) {
  const [variantProps, rest] = splitProps(props, hovercardDescription);
  return (
    <ak.HovercardDescription
      {...hovercardDescription.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface HovercardDismissProps
  extends ak.HovercardDismissProps, VariantProps<typeof hovercardDismiss> {}

/**
 * Renders a button that closes its hovercard. Without children, it shows an
 * icon in a square button named "Dismiss popup".
 * @example
 * <Hovercard>
 *   <HovercardDismiss />
 *   <HovercardHeading>Kai Tanaka</HovercardHeading>
 * </Hovercard>
 */
export function HovercardDismiss({
  children,
  ...props
}: HovercardDismissProps) {
  const [variantProps, rest] = splitProps(props, hovercardDismiss);
  // A slot keeps the icon-only button square. Its hidden icon needs a button
  // label. Empty children, such as an optional label that is null, render the
  // icon too, so the button keeps a name.
  const iconOnly = !hasContent(children);
  const fallbackLabel = iconOnly ? "Dismiss popup" : undefined;
  return (
    <ak.HovercardDismiss
      {...hovercardDismiss.jsx(variantProps)}
      {...rest}
      // Preserve the fallback when the caller passes undefined.
      aria-label={rest["aria-label"] ?? fallbackLabel}
    >
      {iconOnly ? (
        <ButtonSlot>
          <XIcon />
        </ButtonSlot>
      ) : (
        children
      )}
    </ak.HovercardDismiss>
  );
}

export interface HovercardDisclosureProps
  extends
    ak.HovercardDisclosureProps,
    VariantProps<typeof hovercardDisclosure> {}

/**
 * Renders a button after the anchor that opens the hovercard from the keyboard.
 * It stays visually hidden until the anchor takes keyboard focus. Without
 * children, it shows a chevron and has the name "More details", so give it a
 * name that says whose details, such as "More details about Kai". Without this
 * button, keyboard users don't reach the hovercard, so its content must also be
 * somewhere else on the page.
 * @example
 * <HovercardProvider>
 *   <HovercardAnchor href="/profile/kai">Kai</HovercardAnchor>
 *   <HovercardDisclosure aria-label="More details about Kai" />
 *   <Hovercard>
 *     <HovercardHeading>Kai Tanaka</HovercardHeading>
 *   </Hovercard>
 * </HovercardProvider>
 */
export function HovercardDisclosure({
  children,
  ...props
}: HovercardDisclosureProps) {
  const [variantProps, rest] = splitProps(props, hovercardDisclosure);
  // The icon is hidden from assistive technology, so an icon-only button needs
  // a label.
  const iconOnly = !hasContent(children);
  const fallbackLabel = iconOnly ? "More details" : undefined;
  return (
    <ak.HovercardDisclosure
      {...hovercardDisclosure.jsx(variantProps)}
      {...rest}
      // Preserve the fallback when the caller passes undefined.
      aria-label={rest["aria-label"] ?? fallbackLabel}
    >
      {iconOnly ? <ChevronDownIcon /> : children}
    </ak.HovercardDisclosure>
  );
}
