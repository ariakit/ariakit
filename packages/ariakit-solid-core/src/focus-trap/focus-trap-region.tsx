import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { combineProps } from "@solid-primitives/props";
import { Show, type ValidComponent, createSignal } from "solid-js";
import { useWrapInstance } from "../utils/hooks.ts";
import { createHook, createInstance, withOptions } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { FocusTrap } from "./focus-trap.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `FocusTrapRegion` component.
 * @see https://solid.ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * const props = useFocusTrapRegion();
 * <Role {...props} />
 * ```
 */
export const useFocusTrapRegion = createHook<TagName, FocusTrapRegionOptions>(
  withOptions({ enabled: false }, function useFocusTrapRegion(props, options) {
    const [ref, setRef] = createSignal<HTMLType>();

    props = useWrapInstance(props, (wrapperProps) => {
      const renderFocusTrap = () => {
        return (
          <Show when={options.enabled}>
            <FocusTrap
              onFocus={(event) => {
                // TODO: opportunity to extract into @ariakit/core?
                const container = ref();
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
          </Show>
        );
      };
      return (
        <>
          {renderFocusTrap()}
          {wrapperProps.children}
          {renderFocusTrap()}
        </>
      );
    });

    props = combineProps({ ref: setRef }, props);

    return props;
  }),
);

/**
 * Renders a wrapper element that traps the focus inside it when the
 * [`enabled`](https://solid.ariakit.org/reference/focus-trap-region#enabled)
 * prop is `true`.
 * @see https://solid.ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrapRegion>
 *  <Button>click me</Button>
 *  <Button>trap focus</Button>
 *  <Button disabled>disabled Button</Button>
 * </FocusTrapRegion>
 * ```
 */
export const FocusTrapRegion = function FocusTrapRegion(
  props: FocusTrapRegionProps,
) {
  const htmlProps = useFocusTrapRegion(props);
  return createInstance(TagName, htmlProps);
};

export interface FocusTrapRegionOptions<_T extends ValidComponent = TagName>
  extends Options {
  /**
   * If true, it will trap the focus in the region.
   * @default false
   */
  enabled?: boolean;
}

export type FocusTrapRegionProps<T extends ValidComponent = TagName> = Props<
  T,
  FocusTrapRegionOptions<T>
>;
