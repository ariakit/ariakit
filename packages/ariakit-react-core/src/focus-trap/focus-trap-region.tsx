import { useRef } from "react";
import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { useMergeRefs, useWrapElement } from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";
import { FocusTrap } from "./focus-trap.js";

/**
 * Returns props to create a `FocusTrapRegion` component.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * const props = useFocusTrapRegion();
 * <Role {...props} />
 * ```
 */
export const useFocusTrapRegion = createHook2<TagName, FocusTrapRegionOptions>(
  function useFocusTrapRegion({ enabled = false, ...props }) {
    const ref = useRef<HTMLDivElement>(null);

    props = useWrapElement(
      props,
      (element) => {
        const renderFocusTrap = () => {
          if (!enabled) return null;
          return (
            <FocusTrap
              onFocus={(event) => {
                const container = ref.current;
                if (!container) return;
                const tabbables = getAllTabbableIn(container, true);
                const first = tabbables[0];
                const last = tabbables[tabbables.length - 1];
                // Fallbacks to the container element
                if (!tabbables.length) {
                  container.focus();
                  return;
                }
                if (event.relatedTarget === first) {
                  last?.focus();
                } else {
                  first?.focus();
                }
              }}
            />
          );
        };
        return (
          <>
            {renderFocusTrap()}
            {element}
            {renderFocusTrap()}
          </>
        );
      },
      [enabled],
    );

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    return props;
  },
);

/**
 * Renders a wrapper element that traps the focus inside it when the
 * [`enabled`](https://ariakit.org/reference/focus-trap-region#enabled) prop is
 * `true`.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrapRegion>
 *  <Button>click me</Button>
 *  <Button>trap focus</Button>
 *  <Button disabled>disabled Button</Button>
 * </FocusTrapRegion>
 * ```
 */
export const FocusTrapRegion = forwardRef(function FocusTrapRegion(
  props: FocusTrapRegionProps,
) {
  const htmlProps = useFocusTrapRegion(props);
  return createElement(TagName, htmlProps);
});

export interface FocusTrapRegionOptions<_T extends ElementType = TagName>
  extends Options2 {
  /**
   * If true, it will trap the focus in the region.
   * @default false
   */
  enabled?: boolean;
}

export type FocusTrapRegionProps<T extends ElementType = TagName> = Props2<
  T,
  FocusTrapRegionOptions<T>
>;
