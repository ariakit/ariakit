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

type Item = {
  id: string;
  ref: React.RefObject<HTMLElement>;
  rowId?: string;
  disabled?: boolean;
  colSpan?: number;
  rowSpan?: number;
};

type Row = {
  id: string;
  ref: React.RefObject<HTMLElement>;
};

export type unstable_CompositeState = unstable_IdState & {
  /**
   * TODO
   */
  unstable_focusStrategy: "roving-tabindex" | "aria-activedescendant";
  /**
   * Defines the orientation of the composite.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * TODO
   */
  compositeRef: React.MutableRefObject<HTMLElement | undefined>;
  /**
   * TODO
   */
  items: Item[];
  /**
   * A list rows.
   */
  rows: Row[];
  /**
   * The current focused item ID.
   */
  currentId: string | null;
  /**
   * TODO
   */
  spanIndex: number;
  /**
   * If enabled, moving to the next item from the last one will focus the first
   * item and vice-versa. It doesn't work if this is a two-dimensional
   * composite (with rows and cells).
   */
  loop: boolean;
  /**
   * If enabled, moving to the next item from the last one in a row or column
   * will focus the first item in the next row or column and vice-versa. If
   * this is going to wrap rows, columns or both, it depends on the value of
   * `orientation`:
   *
   *   - If `undefined`, it wraps both.
   *   - If `horizontal`, it wraps rows only.
   *   - If `vertical`, it wraps columns only.
   *
   * `wrap` only works if this is a two-dimensional composite (with rows and
   * cells).
   */
  wrap: boolean;
  /**
   * Stores the number of moves that have been made by calling `move`, `next`,
   * `previous`, `up`, `down`, `first` or `last`.
   */
  unstable_moves: number;
  /**
   * The last focused element ID.
   * @private
   */
  unstable_pastId: string | null;
};

export type unstable_CompositeActions = unstable_IdActions & {
  /**
   * TODO
   */
  registerItem: (item: Item) => void;
  /**
   * TODO
   */
  unregisterItem: (id: string) => void;
  /**
   * TODO
   */
  registerRow: (row: Row) => void;
  /**
   * TODO
   */
  unregisterRow: (id: string) => void;
  /**
   * Moves focus to a given element ID.
   */
  move: (id: string | null, spanIndex?: number) => void;
  /**
   * Moves focus to the next element.
   */
  next: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the previous element.
   */
  previous: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the element above.
   */
  up: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the element below.
   */
  down: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the first element.
   */
  first: () => void;
  /**
   * Moves focus to the last element.
   */
  last: () => void;
  /**
   * Resets `currentId` and `pastId` states.
   * @private
   */
  unstable_resetFocus: () => void;
  /**
   * TODO
   */
  unstable_setFocusStrategy: React.Dispatch<
    unstable_CompositeState["unstable_focusStrategy"]
  >;
  /**
   * TODO
   */
  setOrientation: React.Dispatch<unstable_CompositeState["orientation"]>;
  /**
   * TODO
   */
  setCurrentId: React.Dispatch<unstable_CompositeState["currentId"]>;
  /**
   * TODO
   */
  setLoop: React.Dispatch<unstable_CompositeState["loop"]>;
  /**
   * TODO
   */
  setWrap: React.Dispatch<unstable_CompositeState["wrap"]>;
};

export type unstable_CompositeInitialState = unstable_IdInitialState &
  Partial<
    Pick<
      unstable_CompositeState,
      "unstable_focusStrategy" | "orientation" | "currentId" | "loop" | "wrap"
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
  | { type: "move"; id?: string | null; spanIndex?: number }
  | { type: "next"; allTheWayInRow?: boolean }
  | { type: "previous"; allTheWayInRow?: boolean }
  | { type: "up"; allTheWayInRow?: boolean }
  | { type: "down"; allTheWayInRow?: boolean }
  | { type: "first" }
  | { type: "last" }
  | { type: "resetFocus" }
  | {
      type: "unstable_setFocusStrategy";
      unstable_focusStrategy: unstable_CompositeState["unstable_focusStrategy"];
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
  "compositeRef" | keyof unstable_IdState
>;

function groupByRow(items: Item[]) {
  const rows = [[]] as Item[][];

  for (const item of items) {
    const lastRow = rows[rows.length - 1];
    if (lastRow[0]?.rowId === item.rowId) {
      lastRow.push(item);
    } else {
      rows.push([item]);
    }
  }

  return rows;
}

function fillGaps(items: Item[]) {
  const rows = [] as Item[][];
  let maxLength = 0;

  for (const item of items) {
    const lastRow = rows[rows.length - 1];
    if (lastRow?.[0].rowId === item.rowId) {
      lastRow.push(item);
    } else {
      if (lastRow?.length > maxLength) {
        maxLength = lastRow.length;
      }
      rows.push([item]);
    }
  }

  for (const row of rows) {
    for (let i = 0; i < maxLength; i += 1) {
      if (!row[i]) {
        row[i] = {
          id: "",
          disabled: true,
          rowId: row[i - 1].rowId,
          ref: { current: null }
        };
      }
    }
  }

  const normalizedItems = [] as Item[];

  for (const row of rows) {
    normalizedItems.push(...row);
  }

  return normalizedItems;
}

function verticalizeItems(items: Item[]) {
  const rows = [] as Item[][];
  let maxLength = 0;

  for (const item of items) {
    const lastRow = rows[rows.length - 1];
    if (lastRow?.[0].rowId === item.rowId) {
      lastRow.push(item);
    } else {
      if (lastRow?.length > maxLength) {
        maxLength = lastRow.length;
      }
      rows.push([item]);
    }
  }
  const verticalized = [] as Item[];

  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      if (row[1]) {
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
      if (rows.length === 0) {
        return { ...state, rows: [row] };
      }
      if (rows.some(r => r.id === row.id)) {
        return state;
      }
      const rowIndex = findDOMIndex(rows, row);
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
      if (nextRows.length === rows.length) {
        return state;
      }
      return { ...state, rows: nextRows };
    }
    case "registerItem": {
      const { item } = action;
      const row = rows.find(r => r.ref.current?.contains(item.ref.current));
      const nextItem = { ...item, rowId: row?.id };
      const nextId = currentId || items[0]?.id || item.id;
      if (items.length === 0) {
        return { ...state, items: [nextItem], currentId: nextId };
      }
      if (items.some(i => i.id === nextItem.id)) {
        return state;
      }
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
      if (nextItems.length === items.length) {
        return state;
      }
      let nextId = currentId;
      if (currentId && currentId === id) {
        const index = items.findIndex(item => item.id === id);
        const nextIndex =
          index >= nextItems.length ? nextItems.length - 1 : index;
        nextId = nextItems[nextIndex]?.id;
      }
      return {
        ...state,
        items: nextItems,
        currentId: nextId,
        unstable_pastId: pastId && pastId === id ? null : pastId
      };
    }
    case "move": {
      const { id, spanIndex = 0 } = action;
      const nextMoves = moves + 1;

      if (id === null) {
        return {
          ...state,
          spanIndex,
          currentId: items[0]?.id,
          unstable_pastId: currentId,
          unstable_moves: nextMoves
        };
      }

      if (id === undefined) {
        return state;
      }

      const index = items.findIndex(item => item.id === id && !item.disabled);

      // Item doesn't exist or is disabled, so we don't count a move
      if (index === -1) {
        return state;
      }

      if (items[index].id === currentId) {
        return { ...state, unstable_moves: nextMoves };
      }

      return {
        ...state,
        currentId: items[index].id,
        unstable_pastId: currentId,
        unstable_moves: nextMoves
      };
    }
    case "next": {
      if (currentId == null) {
        return reducer(state, { type: "first" });
      }
      const { allTheWayInRow } = action;
      const currentItem = items.find(item => item.id === currentId)!;
      const currentIndex = items.indexOf(currentItem);
      const nextItems = items.slice(currentIndex + 1);
      const nextItemsInRow = nextItems.filter(
        item => item.rowId === currentItem.rowId
      );

      if (allTheWayInRow) {
        const reverseNextItemsInRow = nextItemsInRow.slice().reverse();
        const nextItem = reverseNextItemsInRow.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      if (
        currentItem.rowId &&
        wrap &&
        (!orientation || orientation === "horizontal")
      ) {
        const nextItem = nextItems.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

      if (!currentItem.rowId && loop) {
        // Turns [0, currentId, 2, 3] into [2, 3, 0]
        const reorderedItems = [
          ...items.slice(currentIndex + 1),
          ...items.slice(0, currentIndex)
        ];
        const nextItem = reorderedItems.find(
          item => !item.disabled && item.id !== currentId
        );
        return reducer(state, { type: "move", id: nextItem?.id });
      }

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
      const { allTheWayInRow } = action;
      const verticalized = verticalizeItems(fillGaps(items));
      const currentItem = verticalized.find(
        item => item && item.id === currentId
      )!;
      const currentIndex = verticalized.indexOf(currentItem);
      const nextItems = verticalized.slice(currentIndex + 1);
      let index = -1;
      const nextItemsInColumn = groupByRow(items).reduce((arr, curr) => {
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
        const spanIndex =
          nextItem &&
          items.filter(item => item.id === currentId).indexOf(nextItem);
        return reducer(state, { type: "move", id: nextItem?.id, spanIndex });
      }

      if (
        currentItem.rowId &&
        wrap &&
        (!orientation || orientation === "vertical")
      ) {
        const nextItem = nextItems.find(
          item => item && !item.disabled && item.id !== currentId
        );
        const spanIndex =
          nextItem &&
          items.filter(item => item.id === currentId).indexOf(nextItem);
        return reducer(state, { type: "move", id: nextItem?.id, spanIndex });
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
        const spanIndex =
          nextItem &&
          items.filter(item => item.id === currentId).indexOf(nextItem);
        return reducer(state, { type: "move", id: nextItem?.id, spanIndex });
      }

      const nextItem = nextItemsInColumn.find(
        item => !item.disabled && item.id !== currentId
      );
      const spanIndex =
        nextItem &&
        items.filter(item => item.id === currentId).indexOf(nextItem);
      return reducer(state, { type: "move", id: nextItem?.id, spanIndex });
    }
    case "up": {
      const { items: _, ...nextState } = reducer(
        {
          ...state,
          items: fillGaps(items)
            .slice()
            .reverse()
        },
        { ...action, type: "down" }
      );
      return { ...state, ...nextState };
    }
    case "first": {
      const firstItem = items.find(item => !item.disabled);
      return reducer(state, { type: "move", id: firstItem?.id });
    }
    case "last": {
      const { items: _, ...nextState } = reducer(
        { ...state, items: items.slice().reverse() },
        { ...action, type: "first" }
      );
      return { ...state, ...nextState };
    }
    case "resetFocus": {
      return {
        ...state,
        currentId: items[0]?.id,
        unstable_pastId: null
      };
    }
    case "unstable_setFocusStrategy":
      return {
        ...state,
        unstable_focusStrategy: action.unstable_focusStrategy
      };
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
    orientation,
    unstable_focusStrategy = "roving-tabindex",
    currentId = null,
    loop = false,
    wrap = false,
    ...sealed
  } = useSealedState(initialState);
  const [state, dispatch] = React.useReducer(reducer, {
    unstable_focusStrategy,
    orientation,
    items: [],
    rows: [],
    currentId,
    spanIndex: 0,
    loop,
    wrap,
    unstable_moves: 0,
    unstable_pastId: null
  });
  const compositeRef = React.useRef<HTMLElement>();
  const idState = unstable_useIdState(sealed);

  return {
    ...idState,
    ...state,
    compositeRef,
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
    unstable_resetFocus: React.useCallback(
      () => dispatch({ type: "resetFocus" }),
      []
    ),
    unstable_setFocusStrategy: React.useCallback(
      a =>
        dispatch({
          type: "unstable_setFocusStrategy",
          unstable_focusStrategy: a
        }),
      []
    ),
    setOrientation: React.useCallback(
      o => dispatch({ type: "setOrientation", orientation: o }),
      []
    ),
    setCurrentId: React.useCallback(
      c => dispatch({ type: "setCurrentId", currentId: c }),
      []
    ),
    setLoop: React.useCallback(l => dispatch({ type: "setLoop", loop: l }), []),
    setWrap: React.useCallback(w => dispatch({ type: "setWrap", wrap: w }), [])
  };
}

const keys: Array<keyof unstable_CompositeStateReturn> = [
  ...unstable_useIdState.__keys,
  "unstable_focusStrategy",
  "orientation",
  "compositeRef",
  "items",
  "rows",
  "currentId",
  "spanIndex",
  "loop",
  "wrap",
  "unstable_moves",
  "unstable_pastId",
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
  "unstable_resetFocus",
  "unstable_setFocusStrategy",
  "setOrientation",
  "setCurrentId",
  "setLoop",
  "setWrap"
];

unstable_useCompositeState.__keys = keys;
