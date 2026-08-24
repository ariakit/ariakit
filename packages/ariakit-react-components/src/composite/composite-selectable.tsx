import type { SelectableController } from "@ariakit/components/composite/composite-selectable-store";
import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
  memo,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  getDocument,
  getSelectionAttributeByRole,
  getWindow,
  invariant,
  isDownloading,
  isOpeningInNewTab,
  isSelfTarget,
  isVirtualClick,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type {
  ElementType,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useRef } from "react";
import { useCompositeScopedContext } from "./composite-context.tsx";
import type { CompositeSelectableStore } from "./composite-selectable-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

interface StoreWithSelection {
  unstable_selection?: SelectableController;
}

interface KeyboardActivation {
  key: "Enter" | " ";
  select: boolean;
}

/**
 * Returns props that add selection behavior to a composite item.
 * @example
 * ```jsx
 * <CompositeItem id="item" render={<CompositeSelectable />} />
 * ```
 */
export const useCompositeSelectable = createHook<
  TagName,
  CompositeSelectableOptions
>(function useCompositeSelectable({
  store,
  selectable = true,
  selectOnClick = true,
  selectOnEnter = true,
  selectedAttribute,
  ...props
}) {
  const context = useCompositeScopedContext();
  const composite = store || context;
  const selection = (composite as StoreWithSelection | undefined)
    ?.unstable_selection;

  invariant(
    selection,
    process.env.NODE_ENV !== "production" &&
      "CompositeSelectable must be used with a selectable Composite store.",
  );

  const id = props.id;
  const ariaDisabled =
    props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const locallySelectable = selectable && !ariaDisabled;

  // Hosts inspect this registration before composed click handlers run.
  useSafeLayoutEffect(() => {
    if (!selection) return;
    if (!id) return;
    return selection.setOptIn(id, locallySelectable);
  }, [selection, id, locallySelectable]);

  const selected = useStoreState(composite, () =>
    id && selection ? selection.isSelected(id) : false,
  );
  const mode = useStoreState(composite, () => selection?.getMode());

  const keyboardActivationRef = useRef<KeyboardActivation | null>(null);
  const selectOnClickProp = useBooleanEvent(selectOnClick);
  const selectOnEnterProp = useBooleanEvent(selectOnEnter);

  const onKeyDownCaptureProp = props.onKeyDownCapture;
  const onKeyDownCapture = useEvent((event: ReactKeyboardEvent<HTMLType>) => {
    keyboardActivationRef.current = null;
    onKeyDownCaptureProp?.(event);
    if (event.defaultPrevented) return;
    if (!isSelfTarget(event)) return;
    if (event.key === "Enter") {
      keyboardActivationRef.current = {
        key: event.key,
        select: selectOnEnterProp(event),
      };
    } else if (event.key === " ") {
      keyboardActivationRef.current = { key: event.key, select: true };
    }
  });

  const onPointerDownCaptureProp = props.onPointerDownCapture;
  const onPointerDownCapture = useEvent(
    (event: ReactPointerEvent<HTMLType>) => {
      onPointerDownCaptureProp?.(event);
      keyboardActivationRef.current = null;
    },
  );

  const onKeyUpProp = props.onKeyUp;
  const onKeyUp = useEvent((event: ReactKeyboardEvent<HTMLType>) => {
    onKeyUpProp?.(event);
    const activation = keyboardActivationRef.current;
    if (!activation) return;
    if (event.key !== activation.key) return;
    getWindow(event.currentTarget).setTimeout(() => {
      if (keyboardActivationRef.current !== activation) return;
      keyboardActivationRef.current = null;
    });
  });

  const onBlurProp = props.onBlur;
  const onBlur = useEvent((event: FocusEvent<HTMLType>) => {
    onBlurProp?.(event);
    keyboardActivationRef.current = null;
  });

  const onClickProp = props.onClick;

  const onClick = useEvent((event: ReactMouseEvent<HTMLType>) => {
    const keyboardActivation = keyboardActivationRef.current;
    keyboardActivationRef.current = null;
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (isDownloading(event)) return;
    if (isOpeningInNewTab(event)) return;
    if (!selection) return;
    if (!id) return;
    if (!locallySelectable) return;

    if (keyboardActivation) {
      if (!keyboardActivation.select) return;
    } else {
      if (!selectOnClickProp(event)) return;
    }

    if (selection.isIgnored(event)) return;
    const canMutate = selection.getMode() !== "none";
    selection.activate(id, event);

    // Pointer Shift selection can leave a browser text selection behind. The
    // click must finish first so CompositeItem can focus and update activeId.
    if (canMutate && event.shiftKey && !isVirtualClick(event)) {
      getDocument(event.currentTarget).getSelection()?.removeAllRanges();
    }
  });

  const hostProvidesSelectionAttribute =
    props["aria-selected"] !== undefined || props["aria-checked"] !== undefined;
  const attribute =
    selectedAttribute === false
      ? undefined
      : (selectedAttribute ?? getSelectionAttributeByRole(props.role));
  const ariaValue = locallySelectable
    ? selected
      ? true
      : attribute === "aria-checked" || mode === "multiple"
        ? false
        : undefined
    : undefined;
  const selectionProps: {
    "aria-selected"?: boolean;
    "aria-checked"?: boolean;
  } = {};
  if (attribute && !hostProvidesSelectionAttribute) {
    selectionProps[attribute] = ariaValue;
  }

  return {
    ...selectionProps,
    "data-selected": (locallySelectable && selected) || undefined,
    ...props,
    onKeyDownCapture,
    onPointerDownCapture,
    onKeyUp,
    onBlur,
    onClick,
  };
});

/** Adds selection behavior and state attributes to a composite item. */
export const CompositeSelectable = memo(
  forwardRef(function CompositeSelectable(props: CompositeSelectableProps) {
    const htmlProps = useCompositeSelectable(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface CompositeSelectableOptions<
  _T extends ElementType = TagName,
> extends Options {
  /** The selectable composite store. */
  store?: CompositeSelectableStore;
  /** Whether this item takes part in selection. @default true */
  selectable?: boolean;
  /** Whether click activation mutates the selection. @default true */
  selectOnClick?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
  /** Whether Enter mutates the selection. Space always does. @default true */
  selectOnEnter?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
  /**
   * The ARIA attribute used to expose selection state. By default, this is
   * derived from the item role. Pass `false` to suppress both selection ARIA
   * attributes while keeping `data-selected` for styling.
   */
  selectedAttribute?: "aria-selected" | "aria-checked" | false;
}

export type CompositeSelectableProps<T extends ElementType = TagName> = Props<
  T,
  CompositeSelectableOptions<T>
>;
