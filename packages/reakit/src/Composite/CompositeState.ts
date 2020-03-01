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

type Row = {
  id: string;
  ref: React.RefObject<HTMLElement>;
};

type Item = {
  id: string;
  ref: React.RefObject<HTMLElement>;
  rowId?: Row["id"];
  disabled?: boolean;
};

export type unstable_CompositeState = unstable_IdState & {
  /**
   * Determines how `next` and `previous` will behave. If `rtl` is set to `true`,
   * then `next` will move focus to the previous item in the DOM.
   */
  rtl: boolean;
  /**
   * Defines the orientation of the composite widget.
   *
   * When the composite widget has multiple rows (two-dimensional) and `wrap`
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
   * Lists all the composite rows.
   */
  rows: Row[];
  /**
   * The current focused item ID.
   */
  currentId: string | null;
  /**
   * If enabled, moving to the next item from the last one will focus the first
   * item and vice-versa. It doesn't work if the composite widget has multiple
   * rows (two-dimensional).
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
   * `wrap` only works if the composite widget has multiple rows
   * (two-dimensional).
   */
  wrap: boolean;
  /**
   * Stores the number of moves that have been made by calling `move`, `next`,
   * `previous`, `up`, `down`, `first` or `last`.
   * @private
   */
  unstable_moves: number;
  /**
   * The last focused element ID.
   * @private
   */
  unstable_pastId: string | null;
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
  unstable_hasFocusInsideItem: boolean;
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
   * Registers a composite row.
   */
  registerRow: (row: Row) => void;
  /**
   * Unregisters a composite row.
   */
  unregisterRow: (id: string) => void;
  /**
   * Moves focus to a given item ID.
   */
  move: (id: string | null) => void;
  /**
   * Moves focus to the next item.
   */
  next: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the previous item.
   */
  previous: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the item above.
   */
  up: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the item below.
   */
  down: (unstable_allTheWayInRow?: boolean) => void;
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
  setRTL: React.Dispatch<unstable_CompositeState["rtl"]>;
  /**
   * Sets `orientation`.
   */
  setOrientation: React.Dispatch<unstable_CompositeState["orientation"]>;
  /**
   * Sets `currentId`.
   */
  setCurrentId: React.Dispatch<unstable_CompositeState["currentId"]>;
  /**
   * Sets `loop`.
   */
  setLoop: React.Dispatch<unstable_CompositeState["loop"]>;
  /**
   * Sets `wrap`.
   */
  setWrap: React.Dispatch<unstable_CompositeState["wrap"]>;
  /**
   * Sets `focusStrategy`.
   * @private
   */
  unstable_setFocusStrategy: React.Dispatch<
    unstable_CompositeState["unstable_focusStrategy"]
  >;
  /**
   * Sets `hasFocusInsideItem`.
   * @private
   */
  unstable_setHasFocusInsideItem: React.Dispatch<
    unstable_CompositeState["unstable_hasFocusInsideItem"]
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
      | "wrap"
    >
  >;

export type unstable_CompositeStateReturn = unstable_IdStateReturn &
  unstable_CompositeState &
  unstable_CompositeActions;

type CompositeReducerAction =
  | { type: "registerItem"; item: Item }
  | { type: "unregisterItem"; id: string | null }
  | { type: "registerRow"; row: Row }
  | { type: "unregisterRow"; id: string | null }
  | { type: "move"; id?: string | null }
  | { type: "next"; allTheWayInRow?: boolean }
  | { type: "previous"; allTheWayInRow?: boolean }
  | { type: "up"; allTheWayInRow?: boolean }
  | { type: "down"; allTheWayInRow?: boolean }
  | { type: "first" }
  | { type: "last" }
  | {
      type: "setRTL";
      rtl: unstable_CompositeState["rtl"];
    }
  | {
      type: "setOrientation";
      orientation?: unstable_CompositeState["orientation"];
    }
  | {
      type: "setCurrentId";
      currentId: unstable_CompositeState["currentId"];
    }
  | { type: "setLoop"; loop: unstable_CompositeState["loop"] }
  | { type: "setWrap"; wrap: unstable_CompositeState["wrap"] };

type CompositeReducerState = Omit<
  unstable_CompositeState,
  | "unstable_focusStrategy"
  | "unstable_hasFocusInsideItem"
  | keyof unstable_IdState
>;

function groupItemsByRowId(items: Item[]) {
  const rows = [[]] as Item[][];

  for (const item of items) {
    const row = rows.find(
      rowItems => !rowItems[0] || rowItems[0].rowId === item.rowId
    );
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }

  return rows;
}

function getRowsMaxLength(rows: Item[][]) {
  let maxLength = 0;
  for (const { length } of rows) {
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}

function flattenRows(rows: Item[][]) {
  const flattened = [] as Item[];
  for (const row of rows) {
    flattened.push(...row);
  }
  return flattened;
}

function fillRowsWithLessLength(items: Item[]) {
  const rows = groupItemsByRowId(items);
  const maxLength = getRowsMaxLength(rows);

  for (const row of rows) {
    for (let i = 0; i < maxLength; i += 1) {
      if (!row[i]) {
        row[i] = {
          id: "__EMPTY_ITEM__",
          disabled: true,
          ref: { current: null },
          rowId: row[i - 1].rowId
        };
      }
    }
  }

  return flattenRows(rows);
}

function verticalizeItems(items: Item[]) {
  const rows = groupItemsByRowId(items);
  const maxLength = getRowsMaxLength(rows);
  const verticalized = [] as Item[];

  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      if (row[i]) {
        verticalized.push(row[i]);
      }
    }
  }

  return verticalized;
}

function findDOMIndex(items: Item[], item: Item) {
  return items.findIndex(currentItem => {
    if (!currentItem.ref.current || !item.ref.current) {
      return false;
    }
    // Returns true if the new item is located earlier in the DOM compared
    // to the current item in the iteration.
    return Boolean(
      currentItem.ref.current.compareDocumentPosition(item.ref.current) &
        Node.DOCUMENT_POSITION_PRECEDING
    );
  });
}

function reducer(
  state: CompositeReducerState,
  action: CompositeReducerAction
): CompositeReducerState {
  const {
    rtl,
    orientation,
    items,
    rows,
    currentId,
    unstable_pastId: pastId,
    unstable_moves: moves,
    loop,
    wrap
  } = state;

  switch (action.type) {
    case "registerRow": {
      const { row } = action;
      // If there are no rows yet, just add it as the first one
      if (rows.length === 0) {
        return { ...state, rows: [row] };
      }
      // If the row is already there, do nothing
      if (rows.some(r => r.id === row.id)) {
        return state;
      }
      // Find the row index based on DOM position
      const rowIndex = findDOMIndex(rows, row);
      // If it's -1, this should be added at the end of the list
      if (rowIndex === -1) {
        return { ...state, rows: [...rows, row] };
      }
      const nextRows = [
        ...rows.slice(0, rowIndex),
        row,
        ...rows.slice(rowIndex)
      ];
      return { ...state, rows: nextRows };
    }
    case "unregisterRow": {
      const { id } = action;
      const nextRows = rows.filter(row => row.id !== id);
      // The row isn't registered, so do nothing
      if (nextRows.length === rows.length) {
        return state;
      }
      return { ...state, rows: nextRows };
    }
    case "registerItem": {
      const { item } = action;
      // Find the item row based on the DOM hierarchy
      const row = rows.find(r => r.ref.current?.contains(item.ref.current));
      // Row will be null if it's a one-dimensional composite
      const nextItem = { ...item, rowId: row?.id };
      const nextId = currentId || items[0]?.id || item.id;
      // If there are no items yet, just add it as the first item
      if (items.length === 0) {
        return { ...state, items: [nextItem], currentId: nextId };
      }
      // If the item is already there, do nothing
      if (items.some(i => i.id === nextItem.id)) {
        return state;
      }
      // Find the item index based on DOM position
      const itemIndex = findDOMIndex(items, nextItem);
      let nextItems = [...items, nextItem];
      if (itemIndex !== -1) {
        nextItems = [
          ...items.slice(0, itemIndex),
          nextItem,
          ...items.slice(itemIndex)
        ];
      }
      return { ...state, items: nextItems, currentId: nextId };
    }
    case "unregisterItem": {
      const { id } = action;
      const nextItems = items.filter(item => item.id !== id);
      // The item isn't registered, so do nothing
      if (nextItems.length === items.length) {
        return state;
      }
      let nextId = currentId;
      // If the item being unregistered is the current focused item, move focus
      // to the next item (visually, it'll occupy the same position). If this
      // is the last enabled item, move focus to the previous one.
      if (currentId && currentId === id) {
        let nextState = reducer(state, { type: "next" });
        if (nextState.currentId === id) {
          nextState = reducer(state, { type: "previous" });
        }
        nextId = nextState.currentId;
      }
      return {
        ...state,
        items: nextItems,
        currentId: nextId,
        unstable_pastId: pastId && pastId === id ? null : pastId
      };
    }
    case "move": {
      const { id } = action;
      const nextMoves = moves + 1;

      // move(null) moves to the first item
      if (id === null) {
        return reducer(state, { type: "first" });
      }

      // move() does nothing
      if (id === undefined) {
        return state;
      }

      const item = items.find(i => i.id === id && !i.disabled);

      // Item doesn't exist or is disabled, so we don't count a move
      if (!item) {
        return state;
      }

      // If it's the current focused item, just increment moves
      if (item.id === currentId) {
        return { ...state, unstable_moves: nextMoves };
      }

      return {
        ...state,
        currentId: item.id,
        unstable_pastId: currentId,
        unstable_moves: nextMoves
      };
    }
    case "next": {
      if (currentId == null) {
        return reducer(state, { type: "move", id: null });
      }
      // TODO: Abstract the whole thing so it can be used by both next and previous?
      // Maybe a big part of this can be used for down and up
      const { allTheWayInRow } = action;
      // TODO: if rtl then .reverse() items
      const rightItems = rtl ? items.slice().reverse() : items;
      const currentItem = rightItems.find(item => item.id === currentId)!;
      const currentIndex = rightItems.indexOf(currentItem);
      const nextItems = rightItems.slice(currentIndex + 1);
      const nextItemsInRow = nextItems.filter(
        item => item.rowId === currentItem.rowId
      );

      // Maybe everything below it can be shared with next, previous, down and up
      if (allTheWayInRow) {
        // TODO: Abstract reverse
        const reverseNextItemsInRow = nextItemsInRow.slice().reverse();
        // TODO: Abstract find
        const nextItem = reverseNextItemsInRow.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      // TODO: Abstract condition
      if (
        currentItem.rowId &&
        wrap &&
        (!orientation || orientation === "horizontal")
      ) {
        // TODO: Abstract find
        const nextItem = nextItems.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      if (!currentItem.rowId && loop) {
        // Turns [0, currentId, 2, 3] into [2, 3, 0]
        // TODO: Abstract
        const reorderedItems = [
          ...rightItems.slice(currentIndex + 1),
          ...rightItems.slice(0, currentIndex)
        ];
        // TODO: Abstract
        const nextItem = reorderedItems.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      // TODO: Abstract
      const nextItem = nextItemsInRow.find(
        item => !item.disabled && item.id !== currentId
      );
      return reducer(state, { type: "move", id: nextItem?.id });
    }
    case "previous": {
      const { items: _, ...nextState } = reducer(
        { ...state, items: items.slice().reverse() },
        { ...action, type: "next" }
      );
      return { ...state, ...nextState };
    }
    case "down": {
      if (currentId == null) {
        return reducer(state, { type: "first" });
      }
      // TODO: Abstract the whole thing so it can be used by both down and up?
      const { allTheWayInRow } = action;
      const verticalized = verticalizeItems(fillRowsWithLessLength(items));
      const currentItem = verticalized.find(
        item => item && item.id === currentId
      )!;
      const currentIndex = verticalized.indexOf(currentItem);
      const nextItems = verticalized.slice(currentIndex + 1);
      let index = -1;
      const nextItemsInColumn = groupItemsByRowId(items).reduce((arr, curr) => {
        const idx = curr.findIndex(s => s.id === currentId);
        if (curr[index]) {
          arr.push(curr[index]);
        }
        if (idx >= 0) {
          index = idx;
        }
        return arr;
      }, [] as Item[]);

      if (allTheWayInRow) {
        const reverseNextItemsInColumn = nextItemsInColumn.slice().reverse();
        const nextItem = reverseNextItemsInColumn.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      if (
        currentItem.rowId &&
        wrap &&
        (!orientation || orientation === "vertical")
      ) {
        const nextItem = nextItems.find(
          item => item && !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      if (!currentItem.rowId && loop) {
        // Turns [0, currentId, 2, 3] into [2, 3, 0]
        const reorderedItems = [
          ...verticalized.slice(currentIndex + 1),
          ...verticalized.slice(0, currentIndex)
        ];
        const nextItem = reorderedItems.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      const nextItem = nextItemsInColumn.find(
        item => !item.disabled && item.id !== currentId
      );
      return reducer(state, { type: "move", id: nextItem?.id });
    }
    case "up": {
      const { items: _, ...nextState } = reducer(
        {
          ...state,
          items: fillRowsWithLessLength(items)
            .slice()
            .reverse()
        },
        { ...action, type: "down" }
      );
      return { ...state, ...nextState };
    }
    case "first": {
      const firstItem = rtl
        ? items
            .slice()
            .reverse()
            .find(item => !item.disabled)
        : items.find(item => !item.disabled);
      return reducer(state, { type: "move", id: firstItem?.id });
    }
    case "last": {
      const { items: _, ...nextState } = reducer(
        { ...state, items: items.slice().reverse() },
        { ...action, type: "first" }
      );
      return { ...state, ...nextState };
    }
    case "setRTL":
      return { ...state, rtl: action.rtl };
    case "setOrientation":
      return { ...state, orientation: action.orientation };
    case "setCurrentId":
      return { ...state, currentId: action.currentId || items[0]?.id };
    case "setLoop":
      return { ...state, loop: action.loop };
    case "setWrap":
      return { ...state, wrap: action.wrap };
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
    wrap = false,
    ...sealed
  } = useSealedState(initialState);
  const [state, dispatch] = React.useReducer(reducer, {
    rtl,
    orientation,
    items: [],
    rows: [],
    currentId,
    loop,
    wrap,
    unstable_moves: 0,
    unstable_pastId: null
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
    unstable_hasFocusInsideItem: hasFocusInsideItem,
    unstable_setHasFocusInsideItem: setHasFocusInsideItem,
    registerItem: React.useCallback(
      item => dispatch({ type: "registerItem", item }),
      []
    ),
    unregisterItem: React.useCallback(
      id => dispatch({ type: "unregisterItem", id }),
      []
    ),
    registerRow: React.useCallback(
      row => dispatch({ type: "registerRow", row }),
      []
    ),
    unregisterRow: React.useCallback(
      id => dispatch({ type: "unregisterRow", id }),
      []
    ),
    move: React.useCallback(id => dispatch({ type: "move", id }), []),
    next: React.useCallback(
      allTheWayInRow => dispatch({ type: "next", allTheWayInRow }),
      []
    ),
    previous: React.useCallback(
      allTheWayInRow => dispatch({ type: "previous", allTheWayInRow }),
      []
    ),
    up: React.useCallback(
      allTheWayInRow => dispatch({ type: "up", allTheWayInRow }),
      []
    ),
    down: React.useCallback(
      allTheWayInRow => dispatch({ type: "down", allTheWayInRow }),
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
    setWrap: React.useCallback(
      value => dispatch({ type: "setWrap", wrap: value }),
      []
    )
  };
}

const keys: Array<keyof unstable_CompositeStateReturn> = [
  ...unstable_useIdState.__keys,
  "rtl",
  "orientation",
  "items",
  "rows",
  "currentId",
  "loop",
  "wrap",
  "unstable_moves",
  "unstable_pastId",
  "unstable_focusStrategy",
  "unstable_hasFocusInsideItem",
  "registerItem",
  "unregisterItem",
  "registerRow",
  "unregisterRow",
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
  "setWrap",
  "unstable_setFocusStrategy",
  "unstable_setHasFocusInsideItem"
];

unstable_useCompositeState.__keys = keys;
