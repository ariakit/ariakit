import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useMetadataProps,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import { useEffect, useState } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import { useDisclosureProviderContext } from "./disclosure-context.tsx";
import type { DisclosureStore } from "./disclosure-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const symbol = Symbol("disclosure");

/**
 * Returns props to create a `Disclosure` component.
 * @see https://ariakit.com/components/disclosure
 * @example
 * ```jsx
 * const store = useDisclosureStore();
 * const props = useDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <DisclosureContent store={store}>Content</DisclosureContent>
 * ```
 */
export const useDisclosure = createHook<TagName, DisclosureOptions>(
  function useDisclosure({ store, toggleOnClick = true, ...props }) {
    const context = useDisclosureProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Disclosure must receive a `store` prop or be wrapped in a DisclosureProvider component.",
    );

    const [element, setElement] = useState<HTMLType | null>(null);
    const disclosureElement = useStoreState(store, "disclosureElement");
    const open = useStoreState(store, "open");
    const expanded =
      open && (disclosureElement == null || disclosureElement === element);

    // Assigns the disclosure element whenever it's undefined or disconnected
    // from the DOM. Re-run on open changes so a stale disconnected disclosure
    // element is claimed before deriving aria-expanded for the next open state.
    useEffect(() => {
      if (disclosureElement?.isConnected) return;
      store?.setDisclosureElement(element);
    }, [disclosureElement, store, open, element]);

    const onClickProp = props.onClick;
    const toggleOnClickProp = useBooleanEvent(toggleOnClick);
    const [isDuplicate, metadataProps] = useMetadataProps(props, symbol, true);

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (!toggleOnClickProp(event)) return;
      store?.setDisclosureElement(event.currentTarget);
      store?.toggle();
    });

    const contentElement = useStoreState(store, "contentElement");

    props = {
      "aria-expanded": expanded,
      "aria-controls": contentElement?.id,
      ...metadataProps,
      ...props,
      ref: useMergeRefs(setElement, props.ref),
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders an element that controls the visibility of a
 * [`DisclosureContent`](https://ariakit.com/reference/disclosure-content)
 * element.
 * @see https://ariakit.com/components/disclosure
 * @example
 * ```jsx {2}
 * <DisclosureProvider>
 *   <Disclosure>Disclosure</Disclosure>
 *   <DisclosureContent>Content</DisclosureContent>
 * </DisclosureProvider>
 * ```
 */
export const Disclosure = forwardRef(function Disclosure(
  props: DisclosureProps,
) {
  const htmlProps = useDisclosure(props);
  return createElement(TagName, htmlProps);
});

export interface DisclosureOptions<
  T extends ElementType = TagName,
> extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useDisclosureStore`](https://ariakit.com/reference/use-disclosure-store)
   * hook. If not provided, the closest
   * [`DisclosureProvider`](https://ariakit.com/reference/disclosure-provider)
   * component's context will be used.
   */
  store?: DisclosureStore;
  /**
   * Determines whether
   * [`toggle`](https://ariakit.com/reference/use-disclosure-store#toggle) will
   * be called on click. This is useful if you want to handle the toggle logic
   * yourself.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * @default true
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}

export type DisclosureProps<T extends ElementType = TagName> = Props<
  T,
  DisclosureOptions<T>
>;
