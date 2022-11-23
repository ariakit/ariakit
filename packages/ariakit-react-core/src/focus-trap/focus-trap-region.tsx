import { useRef } from "react";
import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { useForkRef, useWrapElement } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Options, Props } from "../utils/types";
import { FocusTrap } from "./focus-trap";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a focus trap region element.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * const props = useFocusTrapRegion();
 * <Role {...props} />
 * ```
 */
export const useFocusTrapRegion = createHook<FocusTrapRegionOptions>(
  ({ enabled = false, ...props }) => {
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
      [enabled]
    );

    props = {
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    return props;
  }
);

/**
 * A component that renders a focus trap region element.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * <FocusTrapRegion>
 *  <Button>click me</Button>
 *  <Button>trap focus</Button>
 *  <Button disabled>disabled Button</Button>
 * </FocusTrapRegion>
 * ```
 */
export const FocusTrapRegion = createComponent<FocusTrapRegionOptions>(
  (props) => {
    const htmlProps = useFocusTrapRegion(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  FocusTrapRegion.displayName = "FocusTrapRegion";
}

export type FocusTrapRegionOptions<T extends As = "div"> = Options<T> & {
  /**
   * If true, it will trap the focus in the region.
   * @default false
   */
  enabled?: boolean;
};

export type FocusTrapRegionProps<T extends As = "div"> = Props<
  FocusTrapRegionOptions<T>
>;
