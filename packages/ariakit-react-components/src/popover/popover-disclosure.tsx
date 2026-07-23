import {
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.tsx";
import {
  PopoverScopedContextProvider,
  usePopoverProviderContext,
} from "./popover-context.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `PopoverDisclosure` component.
 * @see https://ariakit.com/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <Popover store={store}>Popover</Popover>
 * ```
 */
export const usePopoverDisclosure = createHook<
  TagName,
  PopoverDisclosureOptions
>(function usePopoverDisclosure({ store, ...props }) {
  const context = usePopoverProviderContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "PopoverDisclosure must receive a `store` prop or be wrapped in a PopoverProvider component.",
  );

  props = useWrapElement(
    props,
    (element) => (
      <PopoverScopedContextProvider value={store}>
        {element}
      </PopoverScopedContextProvider>
    ),
    [store],
  );

  props = useDialogDisclosure({ store, ...props });

  return props;
});

/**
 * Renders a button that controls the visibility of the
 * [`Popover`](https://ariakit.com/reference/popover) component when clicked.
 * @see https://ariakit.com/components/popover
 * @example
 * ```jsx {2}
 * <PopoverProvider>
 *   <PopoverDisclosure>Disclosure</PopoverDisclosure>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverDisclosure = forwardRef(function PopoverDisclosure(
  props: PopoverDisclosureProps,
) {
  const htmlProps = usePopoverDisclosure(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface PopoverDisclosureOptions<
  T extends ElementType = TagName,
> extends Omit<DialogDisclosureOptions<T>, "store"> {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.com/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`PopoverProvider`](https://ariakit.com/reference/popover-provider)
   * component's context will be used.
   */
  store?: PopoverStore;
}

export type PopoverDisclosureProps<T extends ElementType = TagName> = Props<
  T,
  PopoverDisclosureOptions<T>
>;
