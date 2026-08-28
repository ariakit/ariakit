import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  getActiveElement,
  invariant,
  isFocusable,
  isSelfTarget,
} from "@ariakit/utils";
import type { ElementType, FocusEvent } from "react";
import { useContext, useMemo, useRef, useState } from "react";
import { DialogHeadingContext } from "../dialog/dialog-context.tsx";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.tsx";
import { isHidden } from "../disclosure/disclosure-content.tsx";
import {
  ComboboxHeadingContext,
  ComboboxListRoleContext,
  ComboboxNestedListContext,
  ComboboxScopedContextProvider,
  useComboboxContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<TagName, ComboboxListOptions>(
  function useComboboxList({ store, alwaysVisible, ...props }) {
    const scopedContext = useComboboxScopedContext(true);
    const context = useComboboxContext();
    store = store || context;
    const scopedContextSameStore = !!store && store === scopedContext;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    // Virtual focus keeps DOM focus on the combobox input or select, so the
    // list itself must never hold it. Otherwise arrow keys stop working until
    // the user tabs back out.
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      const compositeElement = store.getState().compositeElement;
      if (!compositeElement) return;
      // A modal popover may render the composite element inert, in which case
      // moving focus there would fight the dialog's focus containment.
      if (!isFocusable(compositeElement)) return;
      const list = event.currentTarget;
      queueMicrotask(() => {
        if (getActiveElement(list) !== list) return;
        compositeElement.focus();
      });
    });

    const ref = useRef<HTMLType>(null);
    const id = useId(props.id);
    const mounted = useStoreState(store, "mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    const multiSelectable = useStoreState(store, ["selectedValue"], (state) =>
      Array.isArray(state.selectedValue),
    );

    const role = useAttribute(ref, "role", props.role);
    const isCompositeRole =
      role === "listbox" || role === "tree" || role === "grid";
    const ariaMultiSelectable = isCompositeRole
      ? multiSelectable || undefined
      : undefined;

    const parentList = useContext(ComboboxNestedListContext);
    // A list for another store is a separate popup that happens to render
    // inside this one, so it does not own the outer list's popup role.
    const registerInParentList = scopedContextSameStore ? parentList : null;
    const [nestedListCount, setNestedListCount] = useState(0);
    const parentHeadingContext = useContext(ComboboxHeadingContext);
    const headingState = useState<string>();
    const [headingId, setHeadingId] = parentHeadingContext || headingState;
    const headingContext = useMemo<typeof headingState>(
      () => [headingId, setHeadingId],
      [headingId, setHeadingId],
    );
    // We support nested <ComboboxList> elements (usually in the form of
    // ComboboxPopover>ComboboxList). The innermost list owns the popup role,
    // whichever role that is, so an outer list must not render one of its own.
    // Nested lists register through context so that only a real ComboboxList
    // suppresses the role, not any descendant with a popup role attribute.
    const registerNestedList = useEvent((element: Element) => {
      // ComboboxPopover is built on this same hook, so a ComboboxList passed to
      // its render prop shares this element rather than nesting inside it.
      if (element === ref.current) return;
      setNestedListCount((count) => count + 1);
      // Both hooks install their own context, so a nested list only reaches the
      // inner one. Forwarding stops the outer hook from rendering a popup role
      // on the shared element.
      const unregisterFromParentList = registerInParentList?.(element);
      return () => {
        setNestedListCount((count) => count - 1);
        unregisterFromParentList?.();
      };
    });

    useSafeLayoutEffect(() => {
      if (!registerInParentList) return;
      const element = ref.current;
      if (!element) return;
      return registerInParentList(element);
    }, [registerInParentList]);

    if (!nestedListCount) {
      props = {
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable,
        ...props,
      };
    }

    // Heading hooks publish their id through DialogHeadingContext. Redirecting
    // that setter here makes the heading label this list, whose props take
    // precedence when it shares an element with ComboboxPopover.
    // ComboboxHeadingContext also exposes the id so nested lists can inherit it.
    props = useWrapElement(
      props,
      (element) => (
        <ComboboxScopedContextProvider value={store}>
          <ComboboxNestedListContext.Provider value={registerNestedList}>
            <ComboboxHeadingContext.Provider value={headingContext}>
              <DialogHeadingContext.Provider value={setHeadingId}>
                <ComboboxListRoleContext.Provider value={role}>
                  {element}
                </ComboboxListRoleContext.Provider>
              </DialogHeadingContext.Provider>
            </ComboboxHeadingContext.Provider>
          </ComboboxNestedListContext.Provider>
        </ComboboxScopedContextProvider>
      ),
      [store, role, headingContext, registerNestedList],
    );

    // When nesting ComboboxList elements, the content element should be
    // assigned to the topmost ComboboxList element.
    const setContentElement =
      id && (!scopedContext || !scopedContextSameStore)
        ? store.setContentElement
        : null;
    const labelElement = useStoreState(
      store,
      ["labelElement", "selectLabelElement"],
      (state) => {
        if (headingId) return null;
        return state.selectLabelElement || state.labelElement;
      },
    );
    useAttribute(labelElement, "id");
    const labelId = headingId || labelElement?.id;

    props = {
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      hidden,
      ...props,
      id,
      onFocus,
      ref: useMergeRefs(setContentElement, ref, props.ref),
      style,
      // Keep DOM focus on the combobox control. Making the list a Tab stop
      // would cause its focus redirect to restart sequential navigation.
      tabIndex: -1,
    };

    return props;
  },
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxList>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxList>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxList = forwardRef(function ComboboxList(
  props: ComboboxListProps,
) {
  const htmlProps = useComboboxList(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxListOptions<T extends ElementType = TagName>
  extends Options, Pick<DisclosureContentOptions<T>, "alwaysVisible"> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
