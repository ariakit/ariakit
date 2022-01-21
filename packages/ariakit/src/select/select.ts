import { KeyboardEvent, useCallback } from "react";
import { BasePlacement } from "@popperjs/core";
import { queueBeforeEvent } from "ariakit-utils/events";
import { hasFocus } from "ariakit-utils/focus";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
  useRefId,
} from "ariakit-utils/hooks";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead";
import {
  PopoverDisclosureOptions,
  usePopoverDisclosure,
} from "../popover/popover-disclosure";
import { SelectContext, findFirstEnabledItemWithValue } from "./__utils";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select button.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelect({ state });
 * <Role {...props} />
 * ```
 */
export const useSelect = createHook<SelectOptions>(
  ({ state, showOnKeyDown = true, moveOnKeyDown = false, ...props }) => {
    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const showOnKeyDownProp = useBooleanEventCallback(showOnKeyDown);
    const moveOnKeyDownProp = useBooleanEventCallback(moveOnKeyDown);
    const dir = state.placement.split("-")[0] as BasePlacement;

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        if (event.key === " " || event.key === "Enter") {
          state.toggle();
        }
        if (showOnKeyDownProp(event)) {
          const isTopOrBottom = dir === "top" || dir === "bottom";
          const isLeft = dir === "left";
          const isRight = dir === "right";
          const keyMap = {
            ArrowDown: isTopOrBottom,
            ArrowUp: isTopOrBottom,
            ArrowLeft: isLeft,
            ArrowRight: isRight,
          };
          const canShow = keyMap[event.key as keyof typeof keyMap];
          if (canShow) {
            event.preventDefault();
            state.show();
          }
        }
        if (moveOnKeyDownProp(event)) {
          const isVertical = state.orientation !== "horizontal";
          const isHorizontal = state.orientation !== "vertical";
          const isGrid = !!findFirstEnabledItemWithValue(state.items)?.rowId;
          // TODO: Refactor and explain
          const withValue = (next = state.next) => {
            return () => {
              const id = next();
              if (!id) return;
              let i = 0;
              let item = state.items.find(({ id: itemId }) => itemId === id);
              while (item && item.value == null) {
                const nextId = next(++i);
                item = state.items.find(({ id: itemId }) => itemId === nextId);
              }
              return item?.id;
            };
          };
          const keyMap = {
            ArrowUp: (isGrid || isVertical) && withValue(state.up),
            ArrowRight: (isGrid || isHorizontal) && withValue(state.next),
            ArrowDown: (isGrid || isVertical) && withValue(state.down),
            ArrowLeft: (isGrid || isHorizontal) && withValue(state.previous),
          };
          const getId = keyMap[event.key as keyof typeof keyMap];
          if (getId) {
            event.preventDefault();
            state.move(getId());
          }
        }
      },
      [
        onKeyDownProp,
        showOnKeyDownProp,
        dir,
        state.activeId,
        state.show,
        moveOnKeyDownProp,
        state.orientation,
        state.items,
        state.up,
        state.next,
        state.down,
        state.previous,
        state.move,
      ]
    );

    props = useStoreProvider({ state, ...props }, SelectContext);
    const labelId = useRefId(state.labelRef);

    props = {
      role: "combobox",
      "aria-autocomplete": "none",
      // "aria-live":
      //   state.mounted || !state.setValueOnMove || !moveOnKeyDownProp
      //     ? "off"
      //     : "assertive",
      // "aria-atomic": state.setValueOnMove ? true : undefined,
      "aria-labelledby": labelId,
      children: state.value,
      ...props,
      ref: useForkRef(state.selectRef, props.ref),
      onKeyDown,
      // TODO: Should also listen to onClick without onMouseDown (VoiceOver
      // click)
      onMouseDown: (event) => {
        queueBeforeEvent(event.currentTarget, "focus", state.toggle);
        // if (hasFocus(event.currentTarget)) {
        //   requestAnimationFrame(state.show);
        // } else {
        //   event.currentTarget.addEventListener("focusin", state.show, {
        //     once: true,
        //   });
        // }
      },
    };

    props = usePopoverDisclosure({ state, toggleOnClick: false, ...props });
    props = useCompositeTypeahead({ state, ...props });

    return props;
  }
);

/**
 * A component that renders a select button.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const Select = createComponent<SelectOptions>((props) => {
  const htmlProps = useSelect(props);
  return createElement("div", htmlProps);
});

export type SelectOptions<T extends As = "div"> = Omit<
  PopoverDisclosureOptions<T>,
  "state"
> &
  Omit<CompositeTypeaheadOptions<T>, "state"> & {
    /**
     * Object returned by the `useSelectState` hook.
     */
    state: SelectState;
    /**
     * Determines whether the select list will be shown when the user presses
     * arrow keys while the select element is focused.
     * @default true
     */
    showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * Determines whether pressing arrow keys will move the active item even
     * when the select list is hidden.
     * @default false
     */
    moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  };

export type SelectProps<T extends As = "div"> = Props<SelectOptions<T>>;
