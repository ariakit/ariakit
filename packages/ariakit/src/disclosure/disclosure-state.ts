import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useControlledState, usePreviousValue } from "ariakit-utils/hooks";
import { SetState } from "ariakit-utils/types";

/**
 * Provides state for the `Disclosure` components.
 * @example
 * ```jsx
 * const disclosure = useDisclosureState();
 * <Disclosure state={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent state={disclosure}>Content</DisclosureContent>
 * ```
 */
export function useDisclosureState({
  animated = false,
  ...props
}: DisclosureStateProps = {}): DisclosureState {
  const disclosureRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useControlledState(
    props.defaultOpen ?? false,
    props.open,
    props.setOpen
  );
  const [contentElement, setContentElement] = useState<HTMLElement | null>(
    null
  );
  const [animating, setAnimating] = useState(false);
  const prevVisible = usePreviousValue(open);
  const mounted = open || animating;

  if (animated && !animating && prevVisible !== open) {
    setAnimating(true);
  }

  useEffect(() => {
    if (typeof animated === "number" && animating) {
      const timeout = setTimeout(() => setAnimating(false), animated);
      return () => clearTimeout(timeout);
    }
    // TODO: warn when 8 seconds have been passed
    return;
    // We're also listening to the open state here although it's not used in
    // the effect. This is so we can clear previous timeouts and avoid hiding
    // the content when the disclosure button gets clicked several times in
    // sequence.
  }, [animated, animating, open]);

  const show = useCallback(() => setOpen(true), [setOpen]);
  const hide = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen((v) => !v), [setOpen]);
  const stopAnimation = useCallback(() => setAnimating(false), []);

  const state = useMemo(
    () => ({
      disclosureRef,
      open,
      mounted,
      animated,
      animating,
      contentElement,
      setContentElement,
      setOpen,
      show,
      hide,
      toggle,
      stopAnimation,
    }),
    [
      open,
      mounted,
      animated,
      animating,
      contentElement,
      setContentElement,
      setOpen,
      show,
      hide,
      toggle,
      stopAnimation,
    ]
  );

  return state;
}

export type DisclosureState = {
  /**
   * The disclosure element ref.
   */
  disclosureRef: MutableRefObject<HTMLElement | null>;
  /**
   * The visibility state of the content.
   * @default false
   */
  open: boolean;
  /**
   * The mounted state of the content. If `animated` is `false` or not defined,
   * this will be the same as `open`. Otherwise, it will wait for the
   * animation to complete before becoming `false` so the content is not
   * unmounted while animating.
   * @example
   * ```jsx
   * const disclosure = useDisclosureState({ animated: 500 });
   * <Disclosure state={disclosure} />
   * {disclosure.mounted && <DisclosureContent state={disclosure} />}
   * ```
   */
  mounted: boolean;
  /**
   * Determines whether the content should animate when it is shown or hidden.
   *   - If `true`, the `animating` state will be `true` when the content is
   *     shown or hidden and it will wait for `stopAnimation` to be called or a
   *     CSS animation/transition to end before becoming `false`.
   *   - If it's set to a number, the `animating` state will be `true` when the
   *     content is shown or hidden and it will wait for the number of
   *     milliseconds to pass before becoming `false`.
   * @default false
   */
  animated: boolean | number;
  /**
   * Whether the content is currently animating.
   */
  animating: boolean;
  /**
   * The content element that is being shown or hidden.
   */
  contentElement: HTMLElement | null;
  /**
   * Sets the `contentElement` state.
   */
  setContentElement: SetState<DisclosureState["contentElement"]>;
  /**
   * Sets the `open` state.
   */
  setOpen: SetState<DisclosureState["open"]>;
  /**
   * Sets the `open` state to `true`.
   */
  show: () => void;
  /**
   * Sets the `open` state to `false`.
   */
  hide: () => void;
  /**
   * Sets the `open` state to the opposite of the current value.
   */
  toggle: () => void;
  /**
   * Stops the animation.
   */
  stopAnimation: () => void;
};

export type DisclosureStateProps = Partial<
  Pick<DisclosureState, "open" | "animated">
> & {
  /**
   * The default visibility state of the content.
   * @default false
   */
  defaultOpen?: DisclosureState["open"];
  /**
   * Function that will be called when setting the disclosure `open` state.
   * @example
   * // Uncontrolled example
   * useDisclosureState({ setOpen: (open) => console.log(open) });
   * @example
   * // Controlled example
   * const [open, setOpen] = useState(false);
   * useDisclosureState({ open, setOpen });
   * @example
   * // Externally controlled example
   * function MyDisclosure({ open, onOpenChange }) {
   *   const disclosure = useDisclosureState({
   *     open,
   *     setOpen: onOpenChange,
   *   });
   * }
   */
  setOpen?: (open: DisclosureState["open"]) => void;
};
