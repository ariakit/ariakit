import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useMetadataProps,
} from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useDisclosureProviderContext } from "./disclosure-context.tsx";
import type { DisclosureStore } from "./disclosure-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const symbol = Symbol("disclosure");

/**
 * Returns props to create a `Disclosure` component.
 * @see https://ariakit.org/components/disclosure
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

    const ref = useRef<HTMLType>(null);
    const [expanded, setExpanded] = useState(false);
    const disclosureElement = store.useState("disclosureElement");
    const open = store.useState("open");

    // Assigns the disclosure element whenever it's undefined or disconnected
    // from the DOM. If the current element is the disclosure element, it will
    // get the `aria-expanded` attribute set to `true` when the disclosure
    // content is open.
    useEffect(() => {
      let isCurrentDisclosure = disclosureElement === ref.current;
      if (!disclosureElement?.isConnected) {
        store?.setDisclosureElement(ref.current);
        isCurrentDisclosure = true;
      }
      setExpanded(open && isCurrentDisclosure);
    }, [disclosureElement, store, open]);

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

    const contentElement = store.useState("contentElement");

    props = {
      "aria-expanded": expanded,
      "aria-controls": contentElement?.id,
      ...metadataProps,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders an element that controls the visibility of a
 * [`DisclosureContent`](https://ariakit.org/reference/disclosure-content)
 * element.
 * @see https://ariakit.org/components/disclosure
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

export interface DisclosureOptions<T extends ElementType = TagName>
  extends ButtonOptions<T> {
  /**
   * Object returned by the
   * [`useDisclosureStore`](https://ariakit.org/reference/use-disclosure-store)
   * hook. If not provided, the closest
   * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
   * component's context will be used.
   */
  store?: DisclosureStore;
  /**
   * Determines whether
   * [`toggle`](https://ariakit.org/reference/use-disclosure-store#toggle) will
   * be called on click. This is useful if you want to handle the toggle logic
   * yourself.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * @default true
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}

export type DisclosureProps<T extends ElementType = TagName> = Props<
  T,
  DisclosureOptions<T>
>;
