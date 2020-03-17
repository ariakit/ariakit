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
import { Item, Group } from "./__utils/types";
import { findDOMIndex } from "./__utils/findDOMIndex";
import { findFirstEnabledItem } from "./__utils/findFirstEnabledItem";
import { findEnabledItemById } from "./__utils/findEnabledItemById";
import { verticalizeItems } from "./__utils/verticalizeItems";
import { groupItems } from "./__utils/groupItems";
import { flatten } from "./__utils/flatten";
import { fillGroups } from "./__utils/fillGroups";
import { getCurrentId } from "./__utils/getCurrentId";
import { orderItemsStartingFrom } from "./__utils/orderItemsStartingFrom";

export type unstable_CompositeState = unstable_IdState & {
  /**
   * If enabled, the composite element will act as an
   * [aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant)
   * container. DOM focus will remain on the composite while its items receive
   * virtual focus.
   */
  virtual: boolean;
  /**
   * Determines how `next` and `previous` functions will behave. If `rtl` is
   * set to `true`, then they will be inverted. You still need to set
   * `dir="rtl"` on HTML.
   */
  rtl: boolean;
  /**
   * Defines the orientation of the composite widget. If the composite widget
   * has a single row or column (one-dimensional), the `orientation` value
   * determines which arrow keys can be used to move focus:
   *   - `undefined`: all arrow keys work.
   *   - `horizontal`: only left and right arrow keys work.
   *   - `vertical`: only up and down arrow keys work.
   */
  orientation?: "horizontal" | "vertical";
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
   * The current focused item `id`. It's `undefined` by default, which means
   * that the composite will automatically set the first enabled item as the
   * current item.
   *   - If `currentId` is set to `null`, the composite element itself will
   * have focus and users will be able to navigate out of it using arrow keys.
   *   - If `currentId` is explicitly set to `null` in the initial state, the
   * composite element itself will have focus and users will be able to
   * navigate **in and out** of it using arrow keys.
   */
  currentId?: string | null;
  /**
   * If enabled, moving to the next item from the last one will focus the first
   * item and vice-versa.
   */
  loop: boolean | "horizontal" | "vertical";
  /**
   * If enabled, moving to the next item from the last one in a row or column
   * will focus the first item in the next row or column and vice-versa.
   */
  wrap: boolean | "horizontal" | "vertical";
  /**
   * Stores the number of moves that have been performed by calling `move`,
   * `next`, `previous`, `up`, `down`, `first` or `last`.
   */
  moves: number;
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
  setVirtual: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["virtual"]>
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
      "virtual" | "rtl" | "orientation" | "currentId" | "loop" | "wrap"
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
  | { type: "next"; allTheWay?: boolean; lol?: boolean }
  | { type: "previous"; allTheWay?: boolean }
  | { type: "up"; allTheWay?: boolean }
  | { type: "down"; allTheWay?: boolean }
  | { type: "first" }
  | { type: "last" }
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
    };

type CompositeReducerState = Omit<
  unstable_CompositeState,
  "virtual" | "unstable_hasActiveWidget" | keyof unstable_IdState
> & {
  pastIds: string[];
  hasNullItem?: boolean;
  initialCurrentId?: unstable_CompositeState["currentId"];
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
    initialCurrentId,
    hasNullItem,
    moves
  } = state;

  switch (action.type) {
    case "registerGroup": {
      const { group } = action;
      // If there are no groups yet, just add it as the first one
      if (groups.length === 0) {
        return { ...state, groups: [group] };
      }
      // If the group is already there, do nothing
      if (groups.some(r => r.id === group.id)) {
        return state;
      }
      // Finds the group index based on DOM position
      const groupIndex = findDOMIndex(groups, group);
      // If it's -1, this should be added at the end of the list
      if (groupIndex === -1) {
        return { ...state, groups: [...groups, group] };
      }
      const nextGroups = [
        ...groups.slice(0, groupIndex),
        group,
        ...groups.slice(groupIndex)
      ];
      return { ...state, groups: nextGroups };
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
      // If the item is already there, do nothing
      if (items.some(i => i.id === item.id)) {
        return state;
      }
      // Finds the item group based on the DOM hierarchy
      const group = groups.find(r => r.ref.current?.contains(item.ref.current));
      // Group will be null if it's a one-dimensional composite
      const nextItem = { groupId: group?.id, ...item };
      let nextItems = [...items, nextItem];

      if (items.length) {
        // Finds the item index based on DOM position
        const itemIndex = findDOMIndex(items, nextItem);
        if (itemIndex !== -1) {
          nextItems = [
            ...items.slice(0, itemIndex),
            nextItem,
            ...items.slice(itemIndex)
          ];
        }
      }
      const nextState = { ...state, items: nextItems };
      return { ...nextState, currentId: getCurrentId(nextState) };
    }
    case "unregisterItem": {
      const { id } = action;
      const nextItems = items.filter(item => item.id !== id);
      // The item isn't registered, so do nothing
      if (nextItems.length === items.length) {
        return state;
      }
      const nextPastIds = pastIds.filter(pastId => pastId !== id);
      const nextState = {
        ...state,
        pastIds: nextPastIds,
        items: nextItems
      };
      if (currentId && currentId === id) {
        return {
          ...nextState,
          currentId: getCurrentId({ ...nextState, currentId: nextPastIds[0] })
        };
      }
      return nextState;
    }
    case "move": {
      const { id } = action;
      // move() does nothing
      if (id === undefined) {
        return state;
      }

      const item = id ? findEnabledItemById(items, id) : undefined;
      const filteredPastIds = pastIds.filter(
        pastId => pastId !== currentId && pastId !== id
      );
      const nextPastIds = currentId
        ? [currentId, ...filteredPastIds]
        : filteredPastIds;

      if (id === null) {
        return {
          ...state,
          pastIds: nextPastIds,
          currentId: getCurrentId(state, id)
        };
      }
      return {
        ...state,
        pastIds: nextPastIds,
        moves: item ? moves + 1 : moves,
        currentId: getCurrentId(state, item?.id)
      };
    }
    case "next": {
      if (currentId == null) {
        // If there's no item focused, we just move the first one
        return reducer(state, { ...action, type: "first" });
      }

      const isHorizontal = orientation !== "vertical";
      const allItems = rtl && isHorizontal ? reverse(items) : items;
      const currentItem = allItems.find(item => item.id === currentId);

      if (!currentItem) {
        // If there's no item focused, we just move the first one
        return reducer(state, { ...action, type: "first" });
      }

      const isGrid = !!currentItem.groupId;
      const currentIndex = allItems.indexOf(currentItem);
      // Turns [0, 1, current, 3, 4] into [3, 4]
      const nextItems = allItems.slice(currentIndex + 1);
      const itemsInGroup = allItems.filter(
        item => item.groupId === currentItem.groupId
      );
      const nextItemsInGroup = nextItems.filter(
        item => item.groupId === currentItem.groupId
      );

      // Home, End
      if (action.allTheWay) {
        // Reverse so we can get the last one.
        const reverseNextItemsInGroup = reverse(nextItemsInGroup);
        const nextItem = findFirstEnabledItem(
          reverseNextItemsInGroup,
          currentId
        );
        return reducer(state, { ...action, type: "move", id: nextItem?.id });
      }

      const orientationMap = {
        horizontal: "vertical",
        vertical: "horizontal"
      } as const;

      // TODO: Test this
      const oppositeOrientation =
        orientation && !currentItem.groupId
          ? orientationMap[orientation]
          : "vertical";
      const canLoop = loop && loop !== oppositeOrientation;
      const canWrap = isGrid && wrap && wrap !== oppositeOrientation;

      if (canLoop) {
        const nextItem = findFirstEnabledItem(
          orderItemsStartingFrom(
            canWrap && !hasNullItem ? allItems : itemsInGroup,
            currentId,
            hasNullItem || (initialCurrentId === null && !isGrid)
          ),
          currentId
        );
        return reducer(state, { ...action, type: "move", id: nextItem?.id });
      }

      if (canWrap) {
        // Using nextItems instead of nextItemsInGroup so we can wrap between groups
        // TODO: Test wrap: true, currentId: null, loop: true
        const nextItem = findFirstEnabledItem(
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
      const nextState = reducer(
        {
          ...state,
          hasNullItem: !groups.length && initialCurrentId === null,
          wrap: wrap && wrap !== "vertical",
          loop: loop && loop !== "vertical",
          items: reverse(items)
        },
        { ...action, type: "next" }
      );
      return { ...nextState, hasNullItem, wrap, loop, items };
    }
    case "down": {
      const nextState = reducer(
        {
          ...state,
          rtl: false,
          wrap: wrap && wrap !== "horizontal",
          loop: loop && loop !== "horizontal",
          items: verticalizeItems(flatten(fillGroups(groupItems(items))))
        },
        { ...action, type: "next" }
      );
      return { ...nextState, rtl, wrap, loop, items };
    }
    case "up": {
      const nextState = reducer(
        {
          ...state,
          hasNullItem: initialCurrentId === null,
          items: reverse(flatten(fillGroups(groupItems(items))))
        },
        { ...action, type: "down" }
      );
      return { ...nextState, hasNullItem, items };
    }
    case "first": {
      const allItems = rtl ? items.slice().reverse() : items;
      const firstItem = findFirstEnabledItem(allItems);
      return reducer(state, { ...action, type: "move", id: firstItem?.id });
    }
    case "last": {
      const nextState = reducer(
        { ...state, rtl: !rtl },
        { ...action, type: "first" }
      );
      return { ...nextState, rtl };
    }
    case "setRTL":
      return { ...state, rtl: applyState(action.rtl, rtl) };
    case "setOrientation":
      return {
        ...state,
        orientation: applyState(action.orientation, orientation)
      };
    case "setCurrentId":
      return { ...state, currentId: applyState(action.currentId, currentId) };
    case "setLoop":
      return { ...state, loop: applyState(action.loop, loop) };
    case "setWrap":
      return { ...state, wrap: applyState(action.wrap, wrap) };
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
    virtual: initialVirtual = false,
    rtl = false,
    orientation,
    currentId,
    loop = false,
    wrap = false,
    ...sealed
  } = useSealedState(initialState);
  const [
    { pastIds, initialCurrentId, hasNullItem, ...state },
    dispatch
  ] = React.useReducer(reducer, {
    rtl,
    orientation,
    items: [],
    groups: [],
    currentId,
    loop,
    wrap,
    moves: 0,
    pastIds: [],
    initialCurrentId: currentId
  });
  const [virtual, setVirtual] = React.useState(initialVirtual);
  const [hasActiveWidget, setHasActiveWidget] = React.useState(false);
  const idState = unstable_useIdState(sealed);

  return {
    ...idState,
    ...state,
    virtual,
    setVirtual,
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
    setRTL: useAction(value => dispatch({ type: "setRTL", rtl: value })),
    setOrientation: useAction(value =>
      dispatch({ type: "setOrientation", orientation: value })
    ),
    setCurrentId: useAction(value =>
      dispatch({ type: "setCurrentId", currentId: value })
    ),
    setLoop: useAction(value => dispatch({ type: "setLoop", loop: value })),
    setWrap: useAction(value => dispatch({ type: "setWrap", wrap: value }))
  };
}

const keys: Array<keyof unstable_CompositeStateReturn> = [
  ...unstable_useIdState.__keys,
  "virtual",
  "rtl",
  "orientation",
  "items",
  "groups",
  "currentId",
  "loop",
  "wrap",
  "moves",
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
  "setVirtual",
  "setRTL",
  "setOrientation",
  "setCurrentId",
  "setLoop",
  "setWrap",
  "unstable_setHasActiveWidget"
];

unstable_useCompositeState.__keys = keys;
