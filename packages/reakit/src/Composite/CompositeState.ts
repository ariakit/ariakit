import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
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

export type unstable_CompositeState = unstable_IdState & {
  /**
   * Determines how `next` and `previous` will behave. If `rtl` is set to `true`,
   * then `next` will move focus to the previous item in the DOM.
   */
  rtl: boolean;
  /**
   * Defines the orientation of the composite widget.
   *
   * When the composite widget has multiple groups (two-dimensional) and `wrap`
   * is `true`, the navigation will wrap based on the value of `orientation`:
   *   - `undefined`: wraps in both directions.
   *   - `horizontal`: wraps horizontally only.
   *   - `vertical`: wraps vertically only.
   *
   * If the composite widget has a single row or column (one-dimensional), the
   * `orientation` value determines which arrow keys can be used to move focus:
   *   - `undefined`: all arrow keys work.
   *   - `horizontal`: only left and right arrow keys work.
   *   - `vertical`: only up and down arrow keys work.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Lists all the composite items.
   */
  items: Item[];
  /**
   * Lists all the composite groups.
   */
  groups: Group[];
  /**
   * The current focused item ID.
   */
  currentId: string | null;
  /**
   * If enabled, moving to the next item from the last one will focus the first
   * item and vice-versa. It doesn't work if the composite widget has multiple
   * groups (two-dimensional).
   */
  loop: boolean;
  /**
   * If enabled, moving to the next item from the last one in a row or column
   * will focus the first item in the next row or column and vice-versa.
   * Depending on the value of the `orientation` state, it'll wrap in only one
   * direction:
   *   - If `orientation` is `undefined`, it wraps in both directions.
   *   - If `orientation` is `horizontal`, it wraps horizontally only.
   *   - If `orientation` is `vertical`, it wraps vertically only.
   *
   * `focusWrap` only works if the composite widget has multiple groups
   * (two-dimensional).
   */
  focusWrap: boolean;
  /**
   * Stores the number of moves that have been made by calling `move`, `next`,
   * `previous`, `up`, `down`, `first` or `last`.
   * @private
   */
  unstable_moves: number;
  /**
   * Determines which type of keyboard navigation the composite widget will
   * use. [Roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex)
   * or [aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant)
   * @private
   */
  unstable_focusStrategy: "roving-tabindex" | "aria-activedescendant";
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
   * Sets `focusWrap`.
   */
  setFocusWrap: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["focusWrap"]>
  >;
  /**
   * Sets `focusStrategy`.
   * @private
   */
  unstable_setFocusStrategy: React.Dispatch<
    React.SetStateAction<unstable_CompositeState["unstable_focusStrategy"]>
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
      | "unstable_focusStrategy"
      | "rtl"
      | "orientation"
      | "currentId"
      | "loop"
      | "focusWrap"
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
  | { type: "move"; id?: string | null; silently?: boolean }
  | { type: "next"; allTheWay?: boolean; silently?: boolean }
  | { type: "previous"; allTheWay?: boolean; silently?: boolean }
  | { type: "up"; allTheWay?: boolean; silently?: boolean }
  | { type: "down"; allTheWay?: boolean; silently?: boolean }
  | { type: "first"; silently?: boolean }
  | { type: "last"; silently?: boolean }
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
      type: "setFocusWrap";
      wrap: React.SetStateAction<unstable_CompositeState["focusWrap"]>;
    };

type CompositeReducerState = Omit<
  unstable_CompositeState,
  "unstable_focusStrategy" | "unstable_hasActiveWidget" | keyof unstable_IdState
>;

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
    focusWrap,
    unstable_moves: moves
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
      const currentItem = items.find(item => item.id === currentId);
      let nextState = state;
      // If the group being unregistered has the current focused item, move focus
      // to the item in the same position in the next group (visually, it'll
      // occupy the same position). If this is the last group, move up instead.
      if (currentItem?.groupId === id) {
        nextState = reducer(state, { type: "down", silently: true });
        if (nextState.currentId === currentId) {
          nextState = reducer(state, { type: "up", silently: true });
        }
      }
      return { ...nextState, groups: nextGroups };
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
      // If currentId is not explicitly set on useCompositeState, get the first
      // enabled item id
      const nextCurrentId =
        currentId || findFirstEnabledItem(nextItems)?.id || null;

      return { ...state, currentId: nextCurrentId, items: nextItems };
    }
    case "unregisterItem": {
      const { id } = action;
      const nextItems = items.filter(item => item.id !== id);
      // The item isn't registered, so do nothing
      if (nextItems.length === items.length) {
        return state;
      }
      let nextState = state;
      // If the item being unregistered is the current focused item, move focus
      // to the next item (visually, it'll occupy the same position). If this
      // is the last enabled item, move focus to the previous one.
      if (currentId && currentId === id) {
        nextState = reducer(
          { ...state, focusWrap: true },
          { type: "next", silently: true }
        );
        if (nextState.currentId === id) {
          nextState = reducer(
            { ...state, focusWrap: true },
            { type: "previous", silently: true }
          );
        }
      }
      return { ...nextState, focusWrap, items: nextItems };
    }
    case "move": {
      const { id, silently } = action;
      const nextMoves = silently ? moves : moves + 1;
      // move(null) moves to the first item
      if (id === null) {
        return reducer(state, { ...action, type: "first" });
      }
      // move() does nothing
      if (id === undefined) {
        return state;
      }
      const item = findEnabledItemById(items, id);
      // Item doesn't exist or is disabled, so we don't count a move
      if (!item) {
        return state;
      }
      return {
        ...state,
        currentId: item.id,
        unstable_moves: nextMoves
      };
    }
    case "next": {
      if (currentId == null) {
        // If there's no item focused, we just move the first one
        return reducer(state, { ...action, type: "first" });
      }

      const itemsInDirection = rtl ? reverse(items) : items;
      const currentItem = itemsInDirection.find(item => item.id === currentId);

      if (!currentItem) {
        // If there's no item focused, we just move the first one
        return reducer(state, { ...action, type: "first" });
      }

      const currentIndex = itemsInDirection.indexOf(currentItem);
      // Turns [0, 1, current, 3, 4] into [3, 4]
      const nextItems = itemsInDirection.slice(currentIndex + 1);
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

      const isHorizontal = !orientation || orientation === "horizontal";

      // Wraps horizontally
      if (isHorizontal && currentItem.groupId && focusWrap) {
        // Using nextItems instead of nextItemsInGroup so we can wrap between groups
        const nextItem = findFirstEnabledItem(nextItems, currentId);
        return reducer(state, { ...action, type: "move", id: nextItem?.id });
      }

      // Loops on one-dimensional composites
      if (!currentItem.groupId && loop) {
        // Turns [0, 1, current, 3, 4] into [3, 4, 0, 1]
        const reorderedItems = [
          ...itemsInDirection.slice(currentIndex + 1),
          ...itemsInDirection.slice(0, currentIndex)
        ];
        const nextItem = findFirstEnabledItem(reorderedItems, currentId);
        return reducer(state, { ...action, type: "move", id: nextItem?.id });
      }

      const nextItem = findFirstEnabledItem(nextItemsInGroup, currentId);
      return reducer(state, { ...action, type: "move", id: nextItem?.id });
    }
    case "previous": {
      const nextState = reducer(
        { ...state, items: reverse(items) },
        { ...action, type: "next" }
      );
      return { ...nextState, items };
    }
    case "down": {
      const orientationMap = {
        horizontal: "vertical",
        vertical: "horizontal"
      } as const;
      const nextState = reducer(
        {
          ...state,
          rtl: false,
          orientation: orientation ? orientationMap[orientation] : orientation,
          items: verticalizeItems(flatten(fillGroups(groupItems(items))))
        },
        { ...action, type: "next" }
      );
      return { ...nextState, rtl, orientation, items };
    }
    case "up": {
      const nextState = reducer(
        {
          ...state,
          items: reverse(flatten(fillGroups(groupItems(items))))
        },
        { ...action, type: "down" }
      );
      return { ...nextState, items };
    }
    case "first": {
      const firstItem = rtl
        ? items
            .slice()
            .reverse()
            .find(item => !item.disabled)
        : items.find(item => !item.disabled);
      return reducer(state, { ...action, type: "move", id: firstItem?.id });
    }
    case "last": {
      const { items: _, ...nextState } = reducer(
        { ...state, items: items.slice().reverse() },
        { ...action, type: "first" }
      );
      return { ...state, ...nextState };
    }
    case "setRTL":
      return {
        ...state,
        rtl: typeof action.rtl === "function" ? action.rtl(rtl) : action.rtl
      };
    case "setOrientation":
      return {
        ...state,
        orientation:
          typeof action.orientation === "function"
            ? action.orientation(orientation)
            : action.orientation
      };
    case "setCurrentId": {
      const value =
        typeof action.currentId === "function"
          ? action.currentId(currentId)
          : action.currentId;
      const id = value || currentId || findFirstEnabledItem(items)?.id || null;
      return { ...state, currentId: id };
    }
    case "setLoop":
      return {
        ...state,
        loop:
          typeof action.loop === "function" ? action.loop(loop) : action.loop
      };
    case "setFocusWrap":
      return {
        ...state,
        focusWrap:
          typeof action.wrap === "function"
            ? action.wrap(focusWrap)
            : action.wrap
      };
    default:
      throw new Error();
  }
}

export function unstable_useCompositeState(
  initialState: SealedInitialState<unstable_CompositeInitialState> = {}
): unstable_CompositeStateReturn {
  const {
    rtl = false,
    orientation,
    unstable_focusStrategy: initialFocusStrategy = "roving-tabindex",
    currentId = null,
    loop = false,
    focusWrap = false,
    ...sealed
  } = useSealedState(initialState);
  const [state, dispatch] = React.useReducer(reducer, {
    rtl,
    orientation,
    items: [],
    groups: [],
    currentId,
    loop,
    focusWrap,
    unstable_moves: 0
  });
  const [focusStrategy, setFocusStrategy] = React.useState(
    initialFocusStrategy
  );
  const [hasFocusInsideItem, setHasFocusInsideItem] = React.useState(false);
  const idState = unstable_useIdState(sealed);

  return {
    ...idState,
    ...state,
    unstable_focusStrategy: focusStrategy,
    unstable_setFocusStrategy: setFocusStrategy,
    unstable_hasActiveWidget: hasFocusInsideItem,
    unstable_setHasActiveWidget: setHasFocusInsideItem,
    registerItem: React.useCallback(
      item => dispatch({ type: "registerItem", item }),
      []
    ),
    unregisterItem: React.useCallback(
      id => dispatch({ type: "unregisterItem", id }),
      []
    ),
    registerGroup: React.useCallback(
      group => dispatch({ type: "registerGroup", group }),
      []
    ),
    unregisterGroup: React.useCallback(
      id => dispatch({ type: "unregisterGroup", id }),
      []
    ),
    move: React.useCallback(id => dispatch({ type: "move", id }), []),
    next: React.useCallback(
      allTheWay => dispatch({ type: "next", allTheWay }),
      []
    ),
    previous: React.useCallback(
      allTheWay => dispatch({ type: "previous", allTheWay }),
      []
    ),
    up: React.useCallback(allTheWay => dispatch({ type: "up", allTheWay }), []),
    down: React.useCallback(
      allTheWay => dispatch({ type: "down", allTheWay }),
      []
    ),
    first: React.useCallback(() => dispatch({ type: "first" }), []),
    last: React.useCallback(() => dispatch({ type: "last" }), []),
    setRTL: React.useCallback(
      value => dispatch({ type: "setRTL", rtl: value }),
      []
    ),
    setOrientation: React.useCallback(
      value => dispatch({ type: "setOrientation", orientation: value }),
      []
    ),
    setCurrentId: React.useCallback(
      value => dispatch({ type: "setCurrentId", currentId: value }),
      []
    ),
    setLoop: React.useCallback(
      value => dispatch({ type: "setLoop", loop: value }),
      []
    ),
    setFocusWrap: React.useCallback(
      value => dispatch({ type: "setFocusWrap", wrap: value }),
      []
    )
  };
}

const keys: Array<keyof unstable_CompositeStateReturn> = [
  ...unstable_useIdState.__keys,
  "rtl",
  "orientation",
  "items",
  "groups",
  "currentId",
  "loop",
  "focusWrap",
  "unstable_moves",
  "unstable_focusStrategy",
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
  "setRTL",
  "setOrientation",
  "setCurrentId",
  "setLoop",
  "setFocusWrap",
  "unstable_setFocusStrategy",
  "unstable_setHasActiveWidget"
];

unstable_useCompositeState.__keys = keys;
