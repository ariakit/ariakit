import type {
  CollectionStoreFunctions,
  CollectionStoreItem,
  CollectionStoreOptions,
  CollectionStoreState,
} from "../collection/collection-store.js";
import { createCollectionStore } from "../collection/collection-store.js";
import { flatten2DArray, reverseArray } from "../utils/array.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, setup, sync } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

type Orientation = "horizontal" | "vertical" | "both";

const NULL_ITEM = { id: null as unknown as string };

function findFirstEnabledItem(items: CompositeStoreItem[], excludeId?: string) {
  return items.find((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}

function getEnabledItems(items: CompositeStoreItem[], excludeId?: string) {
  return items.filter((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}

function getOppositeOrientation(orientation: Orientation) {
  if (orientation === "vertical") return "horizontal" as const;
  if (orientation === "horizontal") return "vertical" as const;
  return;
}

function getItemsInRow(items: CompositeStoreItem[], rowId?: string) {
  return items.filter((item) => item.rowId === rowId);
}

function flipItems(
  items: CompositeStoreItem[],
  activeId: string,
  shouldInsertNullItem = false,
): CompositeStoreItem[] {
  const index = items.findIndex((item) => item.id === activeId);
  return [
    ...items.slice(index + 1),
    ...(shouldInsertNullItem ? [NULL_ITEM] : []),
    ...items.slice(0, index),
  ];
}

function groupItemsByRows(items: CompositeStoreItem[]) {
  const rows: CompositeStoreItem[][] = [];
  for (const item of items) {
    const row = rows.find((currentRow) => currentRow[0]?.rowId === item.rowId);
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }
  return rows;
}

function getMaxRowLength(array: CompositeStoreItem[][]) {
  let maxLength = 0;
  for (const { length } of array) {
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}

function createEmptyItem(rowId?: string) {
  return {
    id: "__EMPTY_ITEM__",
    disabled: true,
    rowId,
  };
}

function normalizeRows(
  rows: CompositeStoreItem[][],
  activeId?: string | null,
  focusShift?: boolean,
) {
  const maxLength = getMaxRowLength(rows);
  for (const row of rows) {
    for (let i = 0; i < maxLength; i += 1) {
      const item = row[i];
      if (!item || (focusShift && item.disabled)) {
        const isFirst = i === 0;
        const previousItem =
          isFirst && focusShift ? findFirstEnabledItem(row) : row[i - 1];
        row[i] =
          previousItem && activeId !== previousItem.id && focusShift
            ? previousItem
            : createEmptyItem(previousItem?.rowId);
      }
    }
  }
  return rows;
}

function verticalizeItems(items: CompositeStoreItem[]) {
  const rows = groupItemsByRows(items);
  const maxLength = getMaxRowLength(rows);
  const verticalized: CompositeStoreItem[] = [];
  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      const item = row[i];
      if (item) {
        verticalized.push({
          ...item,
          // If there's no rowId, it means that it's not a grid composite, but
          // a single row instead. So, instead of verticalizing it, that is,
          // assigning a different rowId based on the column index, we keep it
          // undefined so they will be part of the same row. This is useful
          // when using up/down on one-dimensional composites.
          rowId: item.rowId ? `${i}` : undefined,
        });
      }
    }
  }
  return verticalized;
}

/**
 * Creates a composite store.
 */
export function createCompositeStore<
  T extends CompositeStoreItem = CompositeStoreItem,
>(props: CompositeStoreProps<T> = {}): CompositeStore<T> {
  const syncState = props.store?.getState();

  const collection = createCollectionStore(props);

  const activeId = defaultValue(
    props.activeId,
    syncState?.activeId,
    props.defaultActiveId,
  );

  const initialState: CompositeStoreState<T> = {
    ...collection.getState(),
    activeId,
    baseElement: defaultValue(syncState?.baseElement, null),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState?.includesBaseElement,
      activeId === null,
    ),
    moves: defaultValue(syncState?.moves, 0),
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "both" as const,
    ),
    rtl: defaultValue(props.rtl, syncState?.rtl, false),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState?.virtualFocus,
      false,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, false),
    focusWrap: defaultValue(props.focusWrap, syncState?.focusWrap, false),
    focusShift: defaultValue(props.focusShift, syncState?.focusShift, false),
  };

  const composite = createStore(initialState, collection, props.store);

  // When the activeId is undefined, we need to find the first enabled item and
  // set it as the activeId.
  setup(composite, () =>
    sync(composite, ["renderedItems", "activeId"], (state) => {
      composite.setState("activeId", (activeId) => {
        if (activeId !== undefined) return activeId;
        return findFirstEnabledItem(state.renderedItems)?.id;
      });
    }),
  );

  const getNextId = (
    items: CompositeStoreItem[],
    orientation: Orientation,
    hasNullItem: boolean,
    skip?: number,
  ): string | null | undefined => {
    const { activeId, rtl, focusLoop, focusWrap, includesBaseElement } =
      composite.getState();
    // RTL doesn't make sense on vertical navigation
    const isHorizontal = orientation !== "vertical";
    const isRTL = rtl && isHorizontal;
    const allItems = isRTL ? reverseArray(items) : items;
    // If there's no item focused, we just move the first one.
    if (activeId == null) {
      return findFirstEnabledItem(allItems)?.id;
    }
    const activeItem = allItems.find((item) => item.id === activeId);
    // If there's no item focused, we just move to the first one.
    if (!activeItem) {
      return findFirstEnabledItem(allItems)?.id;
    }
    const isGrid = !!activeItem.rowId;
    const activeIndex = allItems.indexOf(activeItem);
    const nextItems = allItems.slice(activeIndex + 1);
    const nextItemsInRow = getItemsInRow(nextItems, activeItem.rowId);
    // Home, End, PageUp, PageDown
    if (skip !== undefined) {
      const nextEnabledItemsInRow = getEnabledItems(nextItemsInRow, activeId);
      const nextItem =
        nextEnabledItemsInRow.slice(skip)[0] ||
        // If we can't find an item, just return the last one.
        nextEnabledItemsInRow[nextEnabledItemsInRow.length - 1];
      return nextItem?.id;
    }
    const oppositeOrientation = getOppositeOrientation(
      // If it's a grid and orientation is not set, it's a next/previous call,
      // which is inherently horizontal. up/down will call next with orientation
      // set to vertical by default (see below on up/down methods).
      isGrid ? orientation || "horizontal" : orientation,
    );
    const canLoop = focusLoop && focusLoop !== oppositeOrientation;
    const canWrap = isGrid && focusWrap && focusWrap !== oppositeOrientation;
    // previous and up methods will set hasNullItem, but when calling next
    // directly, hasNullItem will only be true if if it's not a grid and
    // focusLoop is set to true, which means that pressing right or down keys on
    // grids will never focus the composite container element. On
    // one-dimensional composites that don't loop, pressing right or down keys
    // also doesn't focus on the composite container element.
    hasNullItem = hasNullItem || (!isGrid && canLoop && includesBaseElement);

    if (canLoop) {
      const loopItems =
        canWrap && !hasNullItem
          ? allItems
          : getItemsInRow(allItems, activeItem.rowId);
      const sortedItems = flipItems(loopItems, activeId, hasNullItem);
      const nextItem = findFirstEnabledItem(sortedItems, activeId);
      return nextItem?.id;
    }

    if (canWrap) {
      const nextItem = findFirstEnabledItem(
        // We can use nextItems, which contains all the next items, including
        // items from other rows, to wrap between rows. However, if there is a
        // null item (the composite container), we'll only use the next items in
        // the row. So moving next from the last item will focus on the
        // composite container. On grid composites, horizontal navigation never
        // focuses on the composite container, only vertical.
        hasNullItem ? nextItemsInRow : nextItems,
        activeId,
      );
      const nextId = hasNullItem ? nextItem?.id || null : nextItem?.id;
      return nextId;
    }

    const nextItem = findFirstEnabledItem(nextItemsInRow, activeId);
    if (!nextItem && hasNullItem) {
      return null;
    }
    return nextItem?.id;
  };

  return {
    ...collection,
    ...composite,

    setBaseElement: (element) => composite.setState("baseElement", element),
    setActiveId: (id) => composite.setState("activeId", id),

    move: (id) => {
      // move() does nothing
      if (id === undefined) return;
      composite.setState("activeId", id);
      composite.setState("moves", (moves) => moves + 1);
    },

    first: () => findFirstEnabledItem(composite.getState().renderedItems)?.id,
    last: () =>
      findFirstEnabledItem(reverseArray(composite.getState().renderedItems))
        ?.id,

    next: (skip) => {
      const { renderedItems, orientation } = composite.getState();
      return getNextId(renderedItems, orientation, false, skip);
    },

    previous: (skip) => {
      const { renderedItems, orientation, includesBaseElement } =
        composite.getState();
      // If activeId is initially set to null or if includesBaseElement is set
      // to true, then the composite container will be focusable while
      // navigating with arrow keys. But, if it's a grid, we don't want to
      // focus on the composite container with horizontal navigation.
      const isGrid = !!findFirstEnabledItem(renderedItems)?.rowId;
      const hasNullItem = !isGrid && includesBaseElement;
      return getNextId(
        reverseArray(renderedItems),
        orientation,
        hasNullItem,
        skip,
      );
    },

    down: (skip) => {
      const {
        activeId,
        renderedItems,
        focusShift,
        focusLoop,
        includesBaseElement,
      } = composite.getState();
      const shouldShift = focusShift && !skip;
      // First, we make sure rows have the same number of items by filling it
      // with disabled fake items. Then, we reorganize the items.
      const verticalItems = verticalizeItems(
        flatten2DArray(
          normalizeRows(groupItemsByRows(renderedItems), activeId, shouldShift),
        ),
      );
      const canLoop = focusLoop && focusLoop !== "horizontal";
      // Pressing down arrow key will only focus on the composite container if
      // loop is true, both, or vertical.
      const hasNullItem = canLoop && includesBaseElement;
      return getNextId(verticalItems, "vertical", hasNullItem, skip);
    },

    up: (skip) => {
      const { activeId, renderedItems, focusShift, includesBaseElement } =
        composite.getState();
      const shouldShift = focusShift && !skip;
      const verticalItems = verticalizeItems(
        reverseArray(
          flatten2DArray(
            normalizeRows(
              groupItemsByRows(renderedItems),
              activeId,
              shouldShift,
            ),
          ),
        ),
      );
      // If activeId is initially set to null, we'll always focus on the
      // composite container when the up arrow key is pressed in the first row.
      const hasNullItem = includesBaseElement;
      return getNextId(verticalItems, "vertical", hasNullItem, skip);
    },
  };
}

export type CompositeStoreOrientation = Orientation;

export interface CompositeStoreItem extends CollectionStoreItem {
  /**
   * The row id of the item. This is only used on two-dimensional composites
   * (when using `CompositeRow`).
   */
  rowId?: string;
  /**
   * If enabled, the item will be disabled and users won't be able to focus it
   * using arrow keys.
   */
  disabled?: boolean;
  /**
   * The item children. This can be used for typeahead purposes.
   */
  children?: string;
}

export interface CompositeStoreState<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CollectionStoreState<T> {
  /**
   * The composite element.
   */
  baseElement: HTMLElement | null;
  /**
   * If enabled, the composite element will act as an
   * [aria-activedescendant](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_focus_activedescendant)
   * container instead of [roving
   * tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex).
   * DOM focus will remain on the composite element while its items receive
   * virtual focus.
   * @default false
   */
  virtualFocus: boolean;
  /**
   * Defines the orientation of the composite widget. If the composite has a
   * single row or column (one-dimensional), the `orientation` value determines
   * which arrow keys can be used to move focus:
   * - `both`: all arrow keys work.
   * - `horizontal`: only left and right arrow keys work.
   * - `vertical`: only up and down arrow keys work.
   *
   * It doesn't have any effect on two-dimensional composites.
   * @default "both"
   */
  orientation: Orientation;
  /**
   * Determines how the `next` and `previous` functions will behave. If `rtl` is
   * set to `true`, they will be inverted. This only affects the composite
   * widget behavior. You still need to set `dir="rtl"` on HTML/CSS.
   * @default false
   */
  rtl: boolean;
  /**
   * Determines how the focus behaves when the user reaches the end of the
   * composite widget.
   *
   * On one-dimensional composites:
   * - `true` loops from the last item to the first item and vice-versa.
   * - `horizontal` loops only if `orientation` is `horizontal` or not set.
   * - `vertical` loops only if `orientation` is `vertical` or not set.
   * - If `includesBaseElement` is set to `true` (or `activeId` is initially set
   *   to `null`), the composite element will be focused in between the last and
   *   first items.
   *
   * On two-dimensional composites (when using `CompositeRow`):
   * - `true` loops from the last row/column item to the first item in the same
   *   row/column and vice-versa. If it's the last item in the last row, it
   *   moves to the first item in the first row and vice-versa.
   * - `horizontal` loops only from the last row item to the first item in the
   *   same row.
   * - `vertical` loops only from the last column item to the first item in the
   *   column row.
   * - If `includesBaseElement` is set to `true` (or `activeId` is initially set
   *   to `null`), vertical loop will have no effect as moving down from the
   *   last row or up from the first row will focus the composite element.
   * - If `focusWrap` matches the value of `focusLoop`, it'll wrap between the
   *   last item in the last row or column and the first item in the first row
   *   or column and vice-versa.
   * @default false
   */
  focusLoop: boolean | Orientation;
  /**
   * **Works only on two-dimensional composites**. If enabled, moving to the
   * next item from the last one in a row or column will focus the first item in
   * the next row or column and vice-versa.
   * - `true` wraps between rows and columns.
   * - `horizontal` wraps only between rows.
   * - `vertical` wraps only between columns.
   * - If `focusLoop` matches the value of `focusWrap`, it'll wrap between the
   *   last item in the last row or column and the first item in the first row
   *   or column and vice-versa.
   * @default false
   */
  focusWrap: boolean | Orientation;
  /**
   * **Works only on two-dimensional composites**. If enabled, moving up or down
   * when there's no next item or when the next item is disabled will shift to
   * the item right before it.
   * @default false
   */
  focusShift: boolean;
  /**
   * The number of times the `move` function has been called.
   */
  moves: number;
  /**
   * Indicates if the composite base element (the one with a [composite
   * role](https://w3c.github.io/aria/#composite)) should be part of the focus
   * order when navigating with arrow keys. In other words, moving to the
   * previous element when the first item is in focus will focus on the
   * composite element itself. The same applies to the last item when moving to
   * the next element.
   *
   * Live examples:
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * @default false
   */
  includesBaseElement: boolean;
  /**
   * The current active item `id`. The active item is the element within the
   * composite widget that has either DOM or virtual focus (in case
   * [`virtualFocus`](https://ariakit.org/reference/composite-provider#virtualfocus)
   * is enabled).
   * - `null` represents the base composite element. Users will be able to
   *   navigate out of it using arrow keys.
   * - If `activeId` is initially set to `null`, the
   *   [`includesBaseElement`](https://ariakit.org/reference/composite-provider#includesbaseelement)
   *   prop will also default to `true`, which means the base composite element
   *   itself will have focus and users will be able to navigate to it using
   *   arrow keys.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  activeId: string | null | undefined;
}

export interface CompositeStoreFunctions<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CollectionStoreFunctions<T> {
  /**
   * Sets the `baseElement`.
   */
  setBaseElement: SetState<CompositeStoreState<T>["baseElement"]>;
  /**
   * Sets the
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state without moving focus. If you want to move focus, use the
   * [`move`](https://ariakit.org/reference/use-composite-store#move) function
   * instead.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * @example
   * // Sets the composite element as the active item
   * store.setActiveId(null);
   * // Sets the item with id "item-1" as the active item
   * store.setActiveId("item-1");
   * // Sets the next item as the active item
   * store.setActiveId(store.next());
   */
  setActiveId: SetState<CompositeStoreState<T>["activeId"]>;
  /**
   * Moves focus to a given item id and sets it as the active item. Passing
   * `null` will focus the composite element itself.
   * @example
   * // Moves focus to the composite element
   * store.move(null);
   * // Moves focus to the item with id "item-1"
   * store.move("item-1");
   * // Moves focus to the next item
   * store.move(store.next());
   */
  move: (id?: string | null) => void;
  /**
   * Returns the id of the next item based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * @example
   * const nextId = store.next();
   * const nextNextId = store.next(2);
   */
  next: (skip?: number) => string | null | undefined;
  /**
   * Returns the id of the previous item based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * @example
   * const previousId = store.previous();
   * const previousPreviousId = store.previous(2);
   */
  previous: (skip?: number) => string | null | undefined;
  /**
   * Returns the id of the item above based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state.
   * @example
   * const upId = store.up();
   * const upUpId = store.up(2);
   */
  up: (skip?: number) => string | null | undefined;
  /**
   * Returns the id of the item below based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state.
   * @example
   * const downId = store.down();
   * const downDownId = store.down(2);
   */
  down: (skip?: number) => string | null | undefined;
  /**
   * Returns the id of the first item.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  first: () => string | null | undefined;
  /**
   * Returns the id of the last item.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  last: () => string | null | undefined;
}

export interface CompositeStoreOptions<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CollectionStoreOptions<T>,
    StoreOptions<
      CompositeStoreState<T>,
      | "virtualFocus"
      | "orientation"
      | "rtl"
      | "focusLoop"
      | "focusWrap"
      | "focusShift"
      | "includesBaseElement"
      | "activeId"
    > {
  /**
   * The composite item id that should be active by default when the composite
   * widget is rendered. If `null`, the composite element itself will have focus
   * and users will be able to navigate to it using arrow keys. If `undefined`,
   * the first enabled item will be focused.
   */
  defaultActiveId?: CompositeStoreState<T>["activeId"];
}

export interface CompositeStoreProps<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CompositeStoreOptions<T>,
    StoreProps<CompositeStoreState<T>> {}

export interface CompositeStore<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CompositeStoreFunctions<T>,
    Store<CompositeStoreState<T>> {}
