import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { removeUndefinedValues } from "@ariakit/core/utils/misc";
import { combineProps } from "@solid-primitives/props";
import { type JSX, Show, type ValidComponent, createSignal } from "solid-js";
import { As } from "../as/as.tsx";
import { useWrapElement } from "../utils/hooks.ts";
import { extractPropsWithDefaults } from "../utils/misc.ts";
import { createHook, createInstance } from "../utils/system.tsx";
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
  function useFocusTrapRegion(props) {
    const p = extractPropsWithDefaults(props, (p) => (props = p), {
      enabled: false,
    });

    const [ref, setRef] = createSignal<HTMLType>();

    function Wrapper(props: { children: JSX.Element }) {
      const renderFocusTrap = () => {
        return (
          <Show when={p.enabled}>
            <FocusTrap
              onFocus={(event) => {
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
          {props.children}
          {renderFocusTrap()}
        </>
      );
    }
    // TODO: experiment with accepting inline component functions here
    // instead of "As".
    props = useWrapElement(props, <As component={Wrapper} />);

    props = combineProps({ ref: setRef }, props);

    return removeUndefinedValues(props);
  },
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
