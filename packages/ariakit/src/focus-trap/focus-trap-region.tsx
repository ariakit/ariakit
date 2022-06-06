import React from "react";
import { getAllTabbableIn } from "ariakit-utils/focus";
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
  ({ enabled, ...props }) => {
    const firstRef = React.useRef<HTMLElement>();
    const lastRef = React.useRef<HTMLElement>();
    const container = React.useRef<HTMLDivElement>();

    React.useEffect(() => {
      if (!container.current) return;
      const tabbables = getAllTabbableIn(container.current);
      firstRef.current = tabbables[0];
      lastRef.current = tabbables[tabbables.length - 1];
    }, []);

    props = useWrapElement(
      props,
      (element) => {
        const renderFocusTrap = () => {
          if (!enabled) return null;
          return (
            <FocusTrap
              onFocus={(event) => {
                if (event.relatedTarget === firstRef.current) {
                  lastRef.current?.focus();
                } else {
                  firstRef.current?.focus();
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
  enabled: boolean;
};

export type FocusTrapRegionProps<T extends As = "div"> = Props<
  FocusTrapRegionOptions<T>
>;
