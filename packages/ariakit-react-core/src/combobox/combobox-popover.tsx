import { getDocument } from "@ariakit/core/utils/dom";
import { invariant, isFalsyBooleanCallback } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import { useRef } from "react";
import { createDialogComponent } from "../dialog/dialog.tsx";
import type { PopoverOptions } from "../popover/popover.tsx";
import { usePopover } from "../popover/popover.tsx";
import { useStoreState } from "../utils/store.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxListOptions } from "./combobox-list.tsx";
import { useComboboxList } from "./combobox-list.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

function isController(
  target: EventTarget | Element | null,
  ...ids: Array<string | undefined>
) {
  if (!target) return false;
  if ("id" in target) {
    const selector = ids
      .filter(Boolean)
      .map((id) => `[aria-controls~="${id}"]`)
      .join(", ");
    if (!selector) return false;
    return target.matches(selector);
  }
  return false;
}

/**
 * Returns props to create a `ComboboxPopover` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxPopover({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxPopover = createHook<TagName, ComboboxPopoverOptions>(
  function useComboboxPopover({
    store,
    modal,
    tabIndex,
    alwaysVisible,
    autoFocusOnHide = true,
    hideOnInteractOutside = true,
    ...props
  }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxPopover must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const baseElement = store.useState("baseElement");
    const hiddenByClickOutsideRef = useRef(false);

    // When new tags are rendered while the combobox popover is open, they will
    // be considered nested popups, and therefore the popover won't hide when
    // interacting with them. We use the treeSnapshotKey to force the popover to
    // take a new snapshot of the tree when new items are rendered.
    const treeSnapshotKey = useStoreState(
      store.tag,
      (state) => state?.renderedItems.length,
    );

    props = useComboboxList({ store, alwaysVisible, ...props });

    props = usePopover({
      store,
      modal,
      alwaysVisible,
      backdrop: false,
      autoFocusOnShow: false,
      finalFocus: baseElement,
      preserveTabOrderAnchor: null,
      unstable_treeSnapshotKey: treeSnapshotKey,
      ...props,
      // When the combobox popover is modal, we make sure to include the
      // combobox input and all the combobox controls (cancel, disclosure) in
      // the list of persistent elements so they make part of the modal context,
      // allowing users to tab through them.
      getPersistentElements() {
        const elements = props.getPersistentElements?.() || [];
        if (!modal) return elements;
        if (!store) return elements;
        const { contentElement, baseElement } = store.getState();
        if (!baseElement) return elements;
        const doc = getDocument(baseElement);
        const selectors: string[] = [];
        if (contentElement?.id) {
          selectors.push(`[aria-controls~="${contentElement.id}"]`);
        }
        if (baseElement?.id) {
          selectors.push(`[aria-controls~="${baseElement.id}"]`);
        }
        if (!selectors.length) return [...elements, baseElement];
        const selector = selectors.join(",");
        const controlElements = doc.querySelectorAll<HTMLElement>(selector);
        return [...elements, ...controlElements];
      },
      // The combobox popover should focus on the combobox input when it hides,
      // unless the event was triggered by a click outside the popover, in which
      // case the input shouldn't be re-focused.
      autoFocusOnHide(element) {
        if (isFalsyBooleanCallback(autoFocusOnHide, element)) return false;
        if (hiddenByClickOutsideRef.current) {
          hiddenByClickOutsideRef.current = false;
          return false;
        }
        return true;
      },
      // Make sure we don't hide the popover when the user interacts with the
      // combobox cancel or the combobox disclosure buttons. They will have the
      // aria-controls attribute pointing to either the combobox input or the
      // combobox popover elements.
      hideOnInteractOutside(event: Event) {
        const state = store?.getState();
        const contentId = state?.contentElement?.id;
        const baseId = state?.baseElement?.id;
        if (isController(event.target, contentId, baseId)) return false;
        const result =
          typeof hideOnInteractOutside === "function"
            ? hideOnInteractOutside(event)
            : hideOnInteractOutside;
        if (result) {
          hiddenByClickOutsideRef.current = event.type === "click";
        }
        return result;
      },
    });

    return props;
  },
);

/**
 * Renders a combobox popover. The `role` prop is set to `listbox` by default,
 * but can be overriden by any other valid combobox popup role (`listbox`,
 * `menu`, `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxPopover = createDialogComponent(
  forwardRef(function ComboboxPopover(props: ComboboxPopoverProps) {
    const htmlProps = useComboboxPopover(props);
    return createElement(TagName, htmlProps);
  }),
  useComboboxProviderContext,
);

export interface ComboboxPopoverOptions<T extends ElementType = TagName>
  extends ComboboxListOptions<T>,
    Omit<PopoverOptions<T>, "store"> {}

export type ComboboxPopoverProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxPopoverOptions<T>
>;
