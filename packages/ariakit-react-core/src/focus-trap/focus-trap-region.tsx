import { useRef } from "react";
import type { ElementType } from "react";
import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useMergeRefs, useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { FocusTrap } from "./focus-trap.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `FocusTrapRegion` component.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * const props = useFocusTrapRegion();
 * <Role {...props} />
 * ```
 */
export const useFocusTrapRegion = createHook<TagName, FocusTrapRegionOptions>(
  function useFocusTrapRegion({ enabled = false, ...props }) {
    const ref = useRef<HTMLType>(null);

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

    return removeUndefinedValues(props);
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
  extends Options {
  /**
   * If true, it will trap the focus in the region.
   * @default false
   */
  enabled?: boolean;
}

export type FocusTrapRegionProps<T extends ElementType = TagName> = Props<
  T,
  FocusTrapRegionOptions<T>
>;
