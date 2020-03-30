import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import { applyState } from "reakit-utils/applyState";
import {
  unstable_IdState,
  unstable_IdActions,
  unstable_IdInitialState,
  unstable_useIdState,
  unstable_IdStateReturn
} from "../Id/IdState";
import { reverse } from "./__utils/reverse";
import { Item, Group, Orientation } from "./__utils/types";
import { findDOMIndex } from "./__utils/findDOMIndex";
import { findFirstEnabledItem } from "./__utils/findFirstEnabledItem";
import { findEnabledItemById } from "./__utils/findEnabledItemById";
import { verticalizeItems } from "./__utils/verticalizeItems";
import { groupItems } from "./__utils/groupItems";
import { flatten } from "./__utils/flatten";
import { fillGroups } from "./__utils/fillGroups";
import { getCurrentId } from "./__utils/getCurrentId";
import { placeItemsAfter } from "./__utils/placeItemsAfter";
import { getItemsInGroup } from "./__utils/getItemsInGroup";
import { getOppositeOrientation } from "./__utils/getOppositeOrientation";
import { addItemAtIndex } from "./__utils/addItemAtIndex";

export type unstable_CompositeState = unstable_IdState & {
  /**
   * If enabled, the composite element will act as an
   * [aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant)
   * container instead of
   * [roving tabindex](https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex).
   * DOM focus will remain on the composite while its items receive virtual focus.
   */
  unstable_virtual: boolean;
  /**
   * Determines how `next` and `previous` functions will behave. If `rtl` is
   * set to `true`, they will be inverted. You still need to set `dir="rtl"` on
   * HTML/CSS.
   */
  rtl: boolean;
  /**
   * Defines the orientation of the composite widget. If the composite has a
   * single row or column (one-dimensional), the `orientation` value determines
   * which arrow keys can be used to move focus:
   *   - `undefined`: all arrow keys work.
   *   - `horizontal`: only left and right arrow keys work.
   *   - `vertical`: only up and down arrow keys work.
   *
   * It doesn't have any effect on two-dimensional composites.
   */
  orientation?: Orientation;
  /**
   * Lists all the composite items with their `id`, DOM `ref`, `disabled` state
   * and `groupId` if any. This state is automatically updated when
   * `registerItem` and `unregisterItem` are called.
   */
  items: Item[];
  /**
   * Lists all the composite groups with their `id` and DOM `ref`. This state
   * is automatically updated when `registerGroup` and `unregisterGroup` are
   * called.
   */
  groups: Group[];
  /**
   * The current focused item `id`.
   *   - `undefined` will automatically focus the first enabled composite item.
   *   - `null` will focus the composite container and users will be able to
   * navigate out of it using arrow keys.
   *   - If `currentId` is initially set to `null`, the composite element
   * itself will have focus and users will be able to navigate to it using
   * arrow keys.
   */
  currentId?: string | null;
  /**
   * On one-dimensional composites:
   *   - `true` loops from the last item to the first item and vice-versa.
   *   - `horizontal` loops only if `orientation` is `horizontal` or not set.
   *   - `vertical` loops only if `orientation` is `vertical` or not set.
   *   - If `currentId` is initially set to `null`, the composite element will
   * be focused in between the last and first items.
   *
   * On two-dimensional composites:
   *   - `true` loops from the last row/column item to the first item in the
   * same row/column and vice-versa. If it's the last item in the last row, it
   * moves to the first item in the first row and vice-versa.
   *   - `horizontal` loops only from the last row item to the first item in
   * the same row.
   *   - `vertical` loops only from the last column item to the first item in
   * the column row.
   *   - If `currentId` is initially set to `null`, vertical loop will have no
   * effect as moving down from the last row or up from the first row will
   * focus the composite element.
   *   - If `wrap` matches the value of `loop`, it'll wrap between the last
   * item in the last row or column and the first item in the first row or
   * column and vice-versa.
   */
  loop: boolean | Orientation;
  /**
   * If enabled, moving to the next item from the last one in a row or column
   * will focus the first item in the next row or column and vice-versa.
   *   - `true` wraps between rows and columns.
   *   - `horizontal` wraps only between rows.
   *   - `vertical` wraps only between columns.
   *   - If `loop` matches the value of `wrap`, it'll wrap between the last
   * item in the last row or column and the first item in the first row or
   * column and vice-versa.
   */
  wrap: boolean | Orientation;
  /**
   * Stores the number of moves that have been performed by calling `move`,
   * `next`, `previous`, `up`, `down`, `first` or `last`.
   */
  unstable_moves: number;
  /**
   * @private
   */
  unstable_hasActiveWidget: boolean;
};

export type unstable_CompositeActions = unstable_IdActions & {
  /**
   * Registers a composite item.
   */
  registerItem: (item: Item) => void;
  /**
   * Unregisters a composite item.
   */
  unregisterItem: (id: string) => void;
  /**
   * Registers a composite group.
   */
  registerGroup: (group: Group) => void;
  /**
   * Unregisters a composite group.
   */
  unregisterGroup: (id: string) => void;
  /**
   * Moves focus to a given item ID.
   */
  move: (id: string | null) => void;
  /**
   * Moves focus to the next item.
   */
  next: (unstable_allTheWay?: boolean) => void;
  /**
   * Moves focus to the previous item.
   */
  previous: (unstable_allTheWay?: boolean) => void;
  /**
   * Moves focus to the item above.
   */
  up: (unstable_allTheWay?: boolean) => void;
  /**
   * Moves focus to the item below.
   */
  down: (unstable_allTheWay?: boolean) => void;
  /**
   * Moves focus to the first item.
   */
  first: () => void;
  /**
   * Moves focus to the last item.
   */
  last: () => void;
  /**
   * Sets `virtual`.
   */
  unstable_setVirtual: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["unstable_virtual"]>
  >;
  /**
   * Sets `rtl`.
   */
  setRTL: React.Dispatch<React.SetStateAction<unstable_CompositeState["rtl"]>>;
  /**
   * Sets `orientation`.
   */
  setOrientation: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["orientation"]>
  >;
  /**
   * Sets `currentId`.
   */
  setCurrentId: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["currentId"]>
  >;
  /**
   * Sets `loop`.
   */
  setLoop: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["loop"]>
  >;
  /**
   * Sets `wrap`.
   */
  setWrap: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["wrap"]>
  >;
  /**
   * Resets to initial state.
   */
  reset: () => void;
  /**
   * Sets `hasFocusInsideItem`.
   * @private
   */
  unstable_setHasActiveWidget: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["unstable_hasActiveWidget"]>
  >;
};

export type unstable_CompositeInitialState = unstable_IdInitialState &
  Partial<
    Pick<
      unstable_CompositeState,
      "unstable_virtual" | "rtl" | "orientation" | "currentId" | "loop" | "wrap"
    >
  >;

export type unstable_CompositeStateReturn = unstable_IdStateReturn &
  unstable_CompositeState &
  unstable_CompositeActions;

type CompositeReducerAction =
  | { type: "registerItem"; item: Item }
  | { type: "unregisterItem"; id: string | null }
  | { type: "registerGroup"; group: Group }
  | { type: "unregisterGroup"; id: string | null }
  | { type: "move"; id?: string | null }
  | { type: "next"; allTheWay?: boolean; hasNullItem?: boolean }
  | { type: "previous"; allTheWay?: boolean }
  | { type: "up"; allTheWay?: boolean }
  | { type: "down"; allTheWay?: boolean }
  | { type: "first" }
  | { type: "last" }
  | {
      type: "setVirtual";
      virtual: React.SetStateAction<
        unstable_CompositeState["unstable_virtual"]
      >;
    }
  | {
      type: "setRTL";
      rtl: React.SetStateAction<unstable_CompositeState["rtl"]>;
    }
  | {
      type: "setOrientation";
      orientation?: React.SetStateAction<
        unstable_CompositeState["orientation"]
      >;
    }
  | {
      type: "setCurrentId";
      currentId?: React.SetStateAction<unstable_CompositeState["currentId"]>;
    }
  | {
      type: "setLoop";
      loop: React.SetStateAction<unstable_CompositeState["loop"]>;
    }
  | {
      type: "setWrap";
      wrap: React.SetStateAction<unstable_CompositeState["wrap"]>;
    }
  | { type: "reset" };

type CompositeReducerState = Omit<
  unstable_CompositeState,
  "unstable_hasActiveWidget" | keyof unstable_IdState
> & {
  pastIds: string[];
  initialVirtual: unstable_CompositeState["unstable_virtual"];
  initialRTL: unstable_CompositeState["rtl"];
  initialOrientation: unstable_CompositeState["orientation"];
  initialCurrentId: unstable_CompositeState["currentId"];
  initialLoop: unstable_CompositeState["loop"];
  initialWrap: unstable_CompositeState["wrap"];
};

function reducer(
  state: CompositeReducerState,
  action: CompositeReducerAction
): CompositeReducerState {
  const {
    rtl,
    orientation,
    items,
    groups,
    currentId,
    loop,
    wrap,
    pastIds,
    unstable_moves: moves,
    initialVirtual,
    initialRTL,
    initialOrientation,
    initialCurrentId,
    initialLoop,
    initialWrap
  } = state;

  switch (action.type) {
    case "registerGroup": {
      const { group } = action;
      // If there are no groups yet, just add it as the first one
      if (groups.length === 0) {
        return { ...state, groups: [group] };
      }
      // Finds the group index based on DOM position
      const index = findDOMIndex(groups, group);
      return { ...state, groups: addItemAtIndex(groups, group, index) };
    }
    case "unregisterGroup": {
      const { id } = action;
      const nextGroups = groups.filter(group => group.id !== id);
      // The group isn't registered, so do nothing
      if (nextGroups.length === groups.length) {
        return state;
      }
      return { ...state, groups: nextGroups };
    }
    case "registerItem": {
      const { item } = action;
      // Finds the item group based on the DOM hierarchy
      const group = groups.find(r => r.ref.current?.contains(item.ref.current));
      // Group will be null if it's a one-dimensional composite
      const nextItem = { groupId: group?.id, ...item };
      const index = findDOMIndex(items, nextItem);
      const nextState = {
        ...state,
        items: addItemAtIndex(items, nextItem, index)
      };
      return { ...nextState, currentId: getCurrentId(nextState) };
    }
    case "unregisterItem": {
      const { id } = action;
      const nextItems = items.filter(item => item.id !== id);
      // The item isn't registered, so do nothing
      if (nextItems.length === items.length) {
        return state;
      }
      // Filters out the item that is being removed from the pastIds list
      const nextPastIds = pastIds.filter(pastId => pastId !== id);
      const nextState = {
        ...state,
        pastIds: nextPastIds,
        items: nextItems
      };
      // If the current item is the item that is being removed, focus pastId
      if (currentId && currentId === id) {
        const nextId = getCurrentId({
          ...nextState,
          currentId: nextPastIds[0]
        });
        return { ...nextState, currentId: nextId };
      }
      return nextState;
    }
    case "move": {
      const { id } = action;
      // move() does nothing
      if (id === undefined) {
        return state;
      }
      // Removes the current item and the item that is receiving focus from the
      // pastIds list
      const filteredPastIds = pastIds.filter(
        pastId => pastId !== currentId && pastId !== id
      );
      // If there's a currentId, add it to the pastIds list so it can be focused
      // if the new item gets removed or disabled
      const nextPastIds = currentId
        ? [currentId, ...filteredPastIds]
        : filteredPastIds;
      // move(null) will focus the composite element itself, not an item
      if (id === null) {
        return {
          ...state,
          pastIds: nextPastIds,
          unstable_moves: moves + 1,
          currentId: getCurrentId(state, id)
        };
      }
      const item = findEnabledItemById(items, id);
      return {
        ...state,
        pastIds: nextPastIds,
        unstable_moves: item ? moves + 1 : moves,
        currentId: getCurrentId(state, item?.id)
      };
    }
    case "next": {
      // If there's no item focused, we just move the first one
      if (currentId == null) {
        return reducer(state, { ...action, type: "first" });
      }
      // RTL doesn't make sense on vertical navigation
      const isHorizontal = orientation !== "vertical";
      const isRTL = rtl && isHorizontal;
      const allItems = isRTL ? reverse(items) : items;
      const currentItem = allItems.find(item => item.id === currentId);
      // If there's no item focused, we just move the first one
      if (!currentItem) {
        return reducer(state, { ...action, type: "first" });
      }
      const isGrid = !!currentItem.groupId;
      const currentIndex = allItems.indexOf(currentItem);
      const nextItems = allItems.slice(currentIndex + 1);
      const nextItemsInGroup = getItemsInGroup(nextItems, currentItem.groupId);
      // Home, End
      if (action.allTheWay) {
        // We reverse so we can get the last enabled item in the group. If it's
        // RTL, nextItems and nextItemsInGroup are already reversed and don't
        // have the items before the current one anymore. So we have to get
        // items in group again with allItems.
        const nextItem = findFirstEnabledItem(
          isRTL
            ? getItemsInGroup(allItems, currentItem.groupId)
            : reverse(nextItemsInGroup)
        );
        return reducer(state, { ...action, type: "move", id: nextItem?.id });
      }
      const oppositeOrientation = getOppositeOrientation(
        // If it's a grid and orientation is not set, it's a next/previous
        // call, which is inherently horizontal. up/down will call next with
        // orientation set to vertical by default (see below on up/down cases).
        isGrid ? orientation || "horizontal" : orientation
      );
      const canLoop = loop && loop !== oppositeOrientation;
      const canWrap = isGrid && wrap && wrap !== oppositeOrientation;
      const hasNullItem =
        // `previous` and `up` will set action.hasNullItem, but when calling
        // next directly, hasNullItem will only be true if it's not a grid and
        // loop is set to true, which means that pressing right or down keys on
        // grids will never focus the composite element. On one-dimensional
        // composites that don't loop, pressing right or down keys also doesn't
        // focus the composite element.
        action.hasNullItem || (!isGrid && canLoop && initialCurrentId === null);

      if (canLoop) {
        const loopItems =
          canWrap && !hasNullItem
            ? allItems
            : getItemsInGroup(allItems, currentItem.groupId);
        // Turns [0, 1, current, 3, 4] into [3, 4, 0, 1]
        const sortedItems = placeItemsAfter(loopItems, currentId, hasNullItem);
        const nextItem = findFirstEnabledItem(sortedItems, currentId);
        return reducer(state, { ...action, type: "move", id: nextItem?.id });
      }
      if (canWrap) {
        const nextItem = findFirstEnabledItem(
          // We can use nextItems, which contains all the next items, including
          // items from other groups, to wrap between groups. However, if there
          // is a null item (the composite element), we'll only use the next
          // items in the group. So moving next from the last item will focus
          // the composite element (null). On grid composites, horizontal
          // navigation never focuses the composite element, only vertical.
          hasNullItem ? nextItemsInGroup : nextItems,
          currentId
        );
        const nextId = hasNullItem ? nextItem?.id || null : nextItem?.id;
        return reducer(state, { ...action, type: "move", id: nextId });
      }
      const nextItem = findFirstEnabledItem(nextItemsInGroup, currentId);
      if (!nextItem && hasNullItem) {
        return reducer(state, { ...action, type: "move", id: null });
      }
      return reducer(state, { ...action, type: "move", id: nextItem?.id });
    }
    case "previous": {
      // If currentId is initially set to null, the composite element will be
      // focusable while navigating with arrow keys. But, if it's a grid, we
      // don't want to focus the composite element with horizontal navigation.
      const isGrid = !!groups.length;
      const hasNullItem = !isGrid && initialCurrentId === null;
      const nextState = reducer(
        { ...state, items: reverse(items) },
        { ...action, type: "next", hasNullItem }
      );
      return { ...nextState, items };
    }
    case "down": {
      // First, we make sure groups have the same number of items by filling it
      // with disabled fake items. Then, we reorganize the items list so
      // [1-1, 1-2, 2-1, 2-2] becomes [1-1, 2-1, 1-2, 2-2].
      const verticalItems = verticalizeItems(
        flatten(fillGroups(groupItems(items)))
      );
      const canLoop = loop && loop !== "horizontal";
      // Pressing down arrow key will only focus the composite element if loop
      // is true or vertical.
      const hasNullItem = canLoop && initialCurrentId === null;
      const nextState = reducer(
        { ...state, orientation: "vertical", items: verticalItems },
        { ...action, type: "next", hasNullItem }
      );
      return { ...nextState, orientation, items };
    }
    case "up": {
      const verticalItems = verticalizeItems(
        reverse(flatten(fillGroups(groupItems(items))))
      );
      // If currentId is initially set to null, we'll always focus the
      // composite element when the up arrow key is pressed in the first row.
      const hasNullItem = initialCurrentId === null;
      const nextState = reducer(
        { ...state, orientation: "vertical", items: verticalItems },
        { ...action, type: "next", hasNullItem }
      );
      return { ...nextState, orientation, items };
    }
    case "first": {
      const firstItem = findFirstEnabledItem(items);
      return reducer(state, { ...action, type: "move", id: firstItem?.id });
    }
    case "last": {
      const nextState = reducer(
        { ...state, items: reverse(items) },
        { ...action, type: "first" }
      );
      return { ...nextState, items };
    }
    case "setRTL":
      return { ...state, rtl: applyState(action.rtl, rtl) };
    case "setOrientation":
      return {
        ...state,
        orientation: applyState(action.orientation, orientation)
      };
    case "setCurrentId": {
      const nextCurrentId = getCurrentId({
        ...state,
        currentId: applyState(action.currentId, currentId)
      });
      return { ...state, currentId: nextCurrentId };
    }
    case "setLoop":
      return { ...state, loop: applyState(action.loop, loop) };
    case "setWrap":
      return { ...state, wrap: applyState(action.wrap, wrap) };
    case "reset":
      return {
        ...state,
        unstable_virtual: initialVirtual,
        rtl: initialRTL,
        orientation: initialOrientation,
        currentId: initialCurrentId,
        loop: initialLoop,
        wrap: initialWrap,
        unstable_moves: 0,
        pastIds: []
      };
    default:
      throw new Error();
  }
}

function useAction<T extends (...args: any[]) => any>(fn: T) {
  return React.useCallback(fn, []);
}

export function unstable_useCompositeState(
  initialState: SealedInitialState<unstable_CompositeInitialState> = {}
): unstable_CompositeStateReturn {
  const {
    unstable_virtual: virtual = false,
    rtl = false,
    orientation,
    currentId,
    loop = false,
    wrap = false,
    ...sealed
  } = useSealedState(initialState);
  const [
    {
      pastIds,
      initialVirtual,
      initialRTL,
      initialOrientation,
      initialCurrentId,
      initialLoop,
      initialWrap,
      ...state
    },
    dispatch
  ] = React.useReducer(reducer, {
    unstable_virtual: virtual,
    rtl,
    orientation,
    items: [],
    groups: [],
    currentId,
    loop,
    wrap,
    unstable_moves: 0,
    pastIds: [],
    initialVirtual: virtual,
    initialRTL: rtl,
    initialOrientation: orientation,
    initialCurrentId: currentId,
    initialLoop: loop,
    initialWrap: wrap
  });
  const [hasActiveWidget, setHasActiveWidget] = React.useState(false);
  const idState = unstable_useIdState(sealed);

  return {
    ...idState,
    ...state,
    unstable_hasActiveWidget: hasActiveWidget,
    unstable_setHasActiveWidget: setHasActiveWidget,
    registerItem: useAction(item => dispatch({ type: "registerItem", item })),
    unregisterItem: useAction(id => dispatch({ type: "unregisterItem", id })),
    registerGroup: useAction(group =>
      dispatch({ type: "registerGroup", group })
    ),
    unregisterGroup: useAction(id => dispatch({ type: "unregisterGroup", id })),
    move: useAction(id => dispatch({ type: "move", id })),
    next: useAction(allTheWay => dispatch({ type: "next", allTheWay })),
    previous: useAction(allTheWay => dispatch({ type: "previous", allTheWay })),
    up: useAction(allTheWay => dispatch({ type: "up", allTheWay })),
    down: useAction(allTheWay => dispatch({ type: "down", allTheWay })),
    first: useAction(() => dispatch({ type: "first" })),
    last: useAction(() => dispatch({ type: "last" })),
    unstable_setVirtual: useAction(value =>
      dispatch({ type: "setVirtual", virtual: value })
    ),
    setRTL: useAction(value => dispatch({ type: "setRTL", rtl: value })),
    setOrientation: useAction(value =>
      dispatch({ type: "setOrientation", orientation: value })
    ),
    setCurrentId: useAction(value =>
      dispatch({ type: "setCurrentId", currentId: value })
    ),
    setLoop: useAction(value => dispatch({ type: "setLoop", loop: value })),
    setWrap: useAction(value => dispatch({ type: "setWrap", wrap: value })),
    reset: useAction(() => dispatch({ type: "reset" }))
  };
}

const keys: Array<keyof unstable_CompositeStateReturn> = [
  ...unstable_useIdState.__keys,
  "unstable_virtual",
  "rtl",
  "orientation",
  "items",
  "groups",
  "currentId",
  "loop",
  "wrap",
  "unstable_moves",
  "unstable_hasActiveWidget",
  "registerItem",
  "unregisterItem",
  "registerGroup",
  "unregisterGroup",
  "move",
  "next",
  "previous",
  "up",
  "down",
  "first",
  "last",
  "unstable_setVirtual",
  "setRTL",
  "setOrientation",
  "setCurrentId",
  "setLoop",
  "setWrap",
  "reset",
  "unstable_setHasActiveWidget"
];

unstable_useCompositeState.__keys = keys;
