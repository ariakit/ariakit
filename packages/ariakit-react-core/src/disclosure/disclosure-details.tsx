import { useCallback } from "react";
import type { ElementType, SyntheticEvent } from "react";
import { useEvent, useMergeRefs, useWrapElement } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import {
  DisclosureContextProvider,
  DisclosureDetailsContext,
  useDisclosureProviderContext,
} from "./disclosure-context.js";
import { useDisclosureStore } from "./disclosure-store.js";
import type {
  DisclosureStore,
  DisclosureStoreProps,
} from "./disclosure-store.js";

const TagName = "details" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `Disclosure` component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const store = useDisclosureStore();
 * const props = useDisclosure({ store });
 * <Role {...props}>
 *   <DisclosureItem>Item 1</DisclosureItem>
 *   <DisclosureItem>Item 2</DisclosureItem>
 * </Role>
 * ```
 */
export const useDisclosureDetails = createHook<
  TagName,
  DisclosureDetailsOptions
>(function useDisclosureDetails({
  store: storeProp,
  open,
  setOpen,
  defaultOpen,
  ...props
}) {
  const context = useDisclosureProviderContext();
  storeProp = storeProp || context;

  const store = useDisclosureStore({
    store: storeProp,
    open,
    setOpen,
    defaultOpen,
  });

  const mounted = store.useState("mounted");

  const onToggleProp = props.onToggle;

  const onToggle = useEvent((event: SyntheticEvent<HTMLType>) => {
    onToggleProp?.(event);
    if (event.defaultPrevented) return;
    store.setOpen(event.currentTarget.open);
  });

  props = useWrapElement(
    props,
    (element) => (
      <DisclosureDetailsContext.Provider value={true}>
        <DisclosureContextProvider value={store}>
          {element}
        </DisclosureContextProvider>
      </DisclosureDetailsContext.Provider>
    ),
    [store],
  );

  const ref = useCallback((element: HTMLType | null) => {
    // Hydrate the dialog state. This is necessary because the user may have
    // opened the dialog before JavaScript has loaded.
    store.setOpen(!!element?.open);
  }, []);

  props = {
    ...props,
    onToggle,
    ref: useMergeRefs(ref, props.ref),
  };

  return { open: mounted, ...props };
});

/**
 * Renders a disclosure element that groups interactive elements together.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * <Disclosure>
 *   <DisclosureItem>Item 1</DisclosureItem>
 *   <DisclosureItem>Item 2</DisclosureItem>
 * </Disclosure>
 * ```
 */
export const DisclosureDetails = forwardRef(function DisclosureDetails(
  props: DisclosureDetailsProps,
) {
  const htmlProps = useDisclosureDetails(props);
  return createElement(TagName, htmlProps);
});

export interface DisclosureDetailsOptions<_T extends ElementType = TagName>
  extends Options,
    Pick<DisclosureStoreProps, "defaultOpen" | "open" | "setOpen"> {
  /**
   * Object returned by the
   * [`useDisclosureStore`](https://ariakit.org/reference/use-disclosure-store) hook.
   * If not provided, the closest
   * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
   * component context will be used. If the component is not wrapped in a
   * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
   * component, an internal store will be used.
   */
  store?: DisclosureStore;
}

export type DisclosureDetailsProps<T extends ElementType = TagName> = Props<
  T,
  DisclosureDetailsOptions<T>
>;
