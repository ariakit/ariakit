import React from "react";
import { getFirstTabbableIn, getLastTabbableIn } from "ariakit-utils/focus";
import { useForkRef, useWrapElement } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { FocusTrap } from "ariakit/focus-trap";

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
    const container = React.useRef<HTMLDivElement>();

    props = useWrapElement(
      props,
      (element) => {
        const renderFocusTrap = (getTabbable: typeof getFirstTabbableIn) => {
          if (!enabled) return null;
          return (
            <FocusTrap
              onFocus={() => {
                if (!container.current) return;
                const tabbable = getTabbable(container.current, true);
                tabbable?.focus();
              }}
            />
          );
        };
        return (
          <>
            {renderFocusTrap(getLastTabbableIn)}
            {element}
            {renderFocusTrap(getFirstTabbableIn)}
          </>
        );
      },
      [enabled]
    );

    props = {
      ...props,
      ref: useForkRef(container, props.ref),
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

export type FocusTrapRegionOptions<T extends As = "div"> = Options<T> & {
  /**
   * If true, will trap the focus in the region
   *
   * @default false
   */
  enabled?: boolean;
};

export type FocusTrapRegionProps<T extends As = "div"> = Props<
  FocusTrapRegionOptions<T>
>;
