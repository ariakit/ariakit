import type {
  CollectionStoreFunctions,
  CollectionStoreItem,
  CollectionStoreOptions,
  CollectionStoreState,
} from "../collection/collection-store.ts";
import { createCollectionStore } from "../collection/collection-store.ts";
import { flatten2DArray, reverseArray } from "../utils/array.ts";
import { defaultValue } from "../utils/misc.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import { createStore, setup, sync } from "../utils/store.ts";
import type { SetState } from "../utils/types.ts";

type Orientation = "horizontal" | "vertical" | "both";

interface NextOptions
  extends Pick<
    Partial<CompositeStoreState>,
    | "activeId"
    | "focusShift"
    | "focusLoop"
    | "focusWrap"
    | "includesBaseElement"
    | "renderedItems"
    | "rtl"
  > {
  /**
   * The number of items to skip.
   */
  skip?: number;
}

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
    id: defaultValue(
      props.id,
      syncState?.id,
      `id-${Math.random().toString(36).slice(2, 8)}`,
    ),
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
    direction: "next" | "previous" | "up" | "down" = "next",
    options: NextOptions = {},
  ): string | null | undefined => {
    const defaultState = composite.getState();
    const {
      skip = 0,
      activeId = defaultState.activeId,
      focusShift = defaultState.focusShift,
      focusLoop = defaultState.focusLoop,
      focusWrap = defaultState.focusWrap,
      includesBaseElement = defaultState.includesBaseElement,
      renderedItems = defaultState.renderedItems,
      rtl = defaultState.rtl,
    } = options;

    const isVerticalDirection = direction === "up" || direction === "down";
    const isNextDirection = direction === "next" || direction === "down";

    const canReverse = isNextDirection
      ? rtl && !isVerticalDirection
      : !rtl || isVerticalDirection;

    const canShift = focusShift && !skip;

    let items = !isVerticalDirection
      ? renderedItems
      : flatten2DArray(
          normalizeRows(groupItemsByRows(renderedItems), activeId, canShift),
        );

    items = canReverse ? reverseArray(items) : items;
    items = isVerticalDirection ? verticalizeItems(items) : items;

    if (activeId == null) {
      // If there's no item focused, we just move the first one.
      return findFirstEnabledItem(items)?.id;
    }

    const activeItem = items.find((item) => item.id === activeId);
    if (!activeItem) {
      // If there's no item focused, we just move to the first one.
      return findFirstEnabledItem(items)?.id;
    }

    const isGrid = items.some((item) => item.rowId);
    const activeIndex = items.indexOf(activeItem);
    const nextItems = items.slice(activeIndex + 1);
    const nextItemsInRow = getItemsInRow(nextItems, activeItem.rowId);

    if (skip) {
      // Home, End, PageUp, PageDown
      const nextEnabledItemsInRow = getEnabledItems(nextItemsInRow, activeId);
      const nextItem =
        nextEnabledItemsInRow.slice(skip)[0] ||
        // If we can't find an item, just return the last one.
        nextEnabledItemsInRow[nextEnabledItemsInRow.length - 1];
      return nextItem?.id;
    }

    const canLoop =
      focusLoop &&
      (isVerticalDirection
        ? focusLoop !== "horizontal"
        : focusLoop !== "vertical");

    const canWrap =
      isGrid &&
      focusWrap &&
      (isVerticalDirection
        ? focusWrap !== "horizontal"
        : focusWrap !== "vertical");

    // When calling next directly, hasNullItem will only be true if if it's not
    // a grid and focusLoop is set to true, which means that pressing right or
    // down keys on grids will never focus the composite container element. On
    // one-dimensional composites that don't loop, pressing right or down keys
    // also doesn't focus on the composite container element.
    const hasNullItem = isNextDirection
      ? (!isGrid || isVerticalDirection) && canLoop && includesBaseElement
      : isVerticalDirection
        ? includesBaseElement
        : false;

    if (canLoop) {
      const loopItems =
        canWrap && !hasNullItem
          ? items
          : getItemsInRow(items, activeItem.rowId);
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

    next: (options) => {
      if (options !== undefined && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("next", options);
    },

    previous: (options) => {
      if (options !== undefined && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("previous", options);
    },

    down: (options) => {
      if (options !== undefined && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("down", options);
    },

    up: (options) => {
      if (options !== undefined && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("up", options);
    },
  };
}

export type CompositeStoreOrientation = Orientation;

export interface CompositeStoreItem extends CollectionStoreItem {
  /**
   * The row id of the item. This is only used on two-dimensional composite
   * widgets (when using
   * [`CompositeRow`](https://ariakit.org/reference/composite-row)).
   */
  rowId?: string;
  /**
   * If enabled, the item will be disabled and users won't be able to focus on
   * it using arrow keys.
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
   * The ID of the composite store is used to reference elements within the
   * composite widget before hydration. If not provided, a random ID will be
   * generated.
   */
  id: string;
  /**
   * The composite element itself. Typically, it's the wrapper element that
   * contains composite items. However, in a combobox, it's the input element.
   *
   * Live examples:
   * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
   */
  baseElement: HTMLElement | null;
  /**
   * If enabled, the composite element will act as an
   * [aria-activedescendant](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_focus_activedescendant)
   * container instead of [roving
   * tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex).
   * DOM focus will remain on the composite element while its items receive
   * virtual focus.
   *
   * In both scenarios, the item in focus will carry the
   * [`data-active-item`](https://ariakit.org/guide/styling#data-active-item)
   * attribute.
   *
   * Live examples:
   * - [Select with Combobox and
   *   Tabs](https://ariakit.org/examples/select-combobox-tab)
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
   * Determines how the
   * [`next`](https://ariakit.org/reference/use-composite-store#next) and
   * [`previous`](https://ariakit.org/reference/use-composite-store#previous)
   * functions will behave. If `rtl` is set to `true`, they will be inverted.
   *
   * This only affects the composite widget behavior. You still need to set
   * `dir="rtl"` on HTML/CSS.
   * @default false
   */
  rtl: boolean;
  /**
   * Determines how the focus behaves when the user reaches the end of the
   * composite widget.
   *
   * On one-dimensional composite widgets:
   * - `true` loops from the last item to the first item and vice-versa.
   * - `horizontal` loops only if
   *   [`orientation`](https://ariakit.org/reference/composite-provider#orientation)
   *   is `horizontal` or not set.
   * - `vertical` loops only if
   *   [`orientation`](https://ariakit.org/reference/composite-provider#orientation)
   *   is `vertical` or not set.
   * - If
   *   [`includesBaseElement`](https://ariakit.org/reference/composite-provider#includesbaseelement)
   *   is set to `true` (or
   *   [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   *   is initially set to `null`), the composite element will be focused in
   *   between the last and first items.
   *
   * On two-dimensional composite widgets (when using
   * [`CompositeRow`](https://ariakit.org/reference/composite-row) or explicitly
   * passing a [`rowId`](https://ariakit.org/reference/composite-item#rowid)
   * prop to composite items):
   * - `true` loops from the last row/column item to the first item in the same
   *   row/column and vice-versa. If it's the last item in the last row, it
   *   moves to the first item in the first row and vice-versa.
   * - `horizontal` loops only from the last row item to the first item in the
   *   same row.
   * - `vertical` loops only from the last column item to the first item in the
   *   column row.
   * - If
   *   [`includesBaseElement`](https://ariakit.org/reference/composite-provider#includesbaseelement)
   *   is set to `true` (or
   *   [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   *   is initially set to `null`), vertical loop will have no effect as moving
   *   down from the last row or up from the first row will focus on the
   *   composite element.
   * - If
   *   [`focusWrap`](https://ariakit.org/reference/composite-provider#focuswrap)
   *   matches the value of `focusLoop`, it'll wrap between the last item in the
   *   last row or column and the first item in the first row or column and
   *   vice-versa.
   *
   * Live examples:
   * - [Command Menu](https://ariakit.org/examples/dialog-combobox-command-menu)
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   * @default false
   */
  focusLoop: boolean | Orientation;
  /**
   * **Works only on two-dimensional composite widgets**.
   *
   * If enabled, moving to the next item from the last one in a row or column
   * will focus on the first item in the next row or column and vice-versa.
   * - `true` wraps between rows and columns.
   * - `horizontal` wraps only between rows.
   * - `vertical` wraps only between columns.
   * - If
   *   [`focusLoop`](https://ariakit.org/reference/composite-provider#focusloop)
   *   matches the value of `focusWrap`, it'll wrap between the last item in the
   *   last row or column and the first item in the first row or column and
   *   vice-versa.
   *
   * Live examples:
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   * @default false
   */
  focusWrap: boolean | Orientation;
  /**
   * **Works only on two-dimensional composite widgets**.
   *
   * If enabled, moving up or down when there's no next item or when the next
   * item is disabled will shift to the item right before it.
   *
   * Live examples:
   * - [Command Menu with
   *   Tabs](https://ariakit.org/examples/dialog-combobox-tab-command-menu)
   * @default false
   */
  focusShift: boolean;
  /**
   * The number of times the
   * [`move`](https://ariakit.org/reference/use-composite-store#move) function
   * has been called.
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
   * - [Command Menu](https://ariakit.org/examples/dialog-combobox-command-menu)
   * @default false
   */
  includesBaseElement: boolean;
  /**
   * The current active item `id`. The active item is the element within the
   * composite widget that has either DOM or virtual focus (in case
   * [`virtualFocus`](https://ariakit.org/reference/composite-provider#virtualfocus)
   * is enabled).
   * - `null` represents the base composite element (the one with a [composite
   *   role](https://w3c.github.io/aria/#composite)). Users will be able to
   *   navigate out of it using arrow keys.
   * - If `activeId` is initially set to `null`, the
   *   [`includesBaseElement`](https://ariakit.org/reference/composite-provider#includesbaseelement)
   *   prop will also default to `true`, which means the base composite element
   *   itself will have focus and users will be able to navigate to it using
   *   arrow keys.
   *
   * Live examples:
   * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
   */
  activeId: string | null | undefined;
}

export interface CompositeStoreFunctions<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CollectionStoreFunctions<T> {
  /**
   * Sets the `baseElement` state.
   */
  setBaseElement: SetState<CompositeStoreState<T>["baseElement"]>;
  /**
   * Sets the
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state _without moving focus_. If you want to move focus, use the
   * [`move`](https://ariakit.org/reference/use-composite-store#move) function
   * instead.
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
   * Moves focus to a given item id and sets it as the active item.
   * - Passing `null` will focus on the composite element itself (the one with a
   *   [composite role](https://w3c.github.io/aria/#composite)). Users will be
   *   able to navigate out of it using arrow keys.
   * - If you want to set the active item id _without moving focus_, use the
   *   [`setActiveId`](https://ariakit.org/reference/use-composite-store#setactiveid)
   *   function instead.
   *
   * Live examples:
   * - [Select Grid](https://ariakit.org/examples/select-grid)
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
   * Returns the id of the next enabled item based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state. You can pass additional options to override the current state.
   * @example
   * const nextId = store.next();
   */
  next(options?: NextOptions): string | null | undefined;
  /**
   * @deprecated Use the object syntax instead: `next({ skip: 2 })`.
   */
  next(skip?: number): string | null | undefined;
  /**
   * Returns the id of the previous enabled item based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state. You can pass additional options to override the current state.
   * @example
   * const previousId = store.previous();
   */
  previous(options?: NextOptions): string | null | undefined;
  /**
   * @deprecated Use the object syntax instead: `previous({ skip: 2 })`.
   */
  previous(skip?: number): string | null | undefined;
  /**
   * Returns the id of the enabled item above based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state. You can pass additional options to override the current state.
   * @example
   * const upId = store.up();
   */
  up(options?: NextOptions): string | null | undefined;
  /**
   * @deprecated Use the object syntax instead: `up({ skip: 2 })`.
   */
  up(skip?: number): string | null | undefined;
  /**
   * Returns the id of the enabled item below based on the current
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state. You can pass additional options to override the current state.
   * @example
   * const downId = store.down();
   */
  down(options?: NextOptions): string | null | undefined;
  /**
   * @deprecated Use the object syntax instead: `down({ skip: 2 })`.
   */
  down(skip?: number): string | null | undefined;
  /**
   * Returns the id of the first enabled item.
   */
  first: () => string | null | undefined;
  /**
   * Returns the id of the last enabled item.
   */
  last: () => string | null | undefined;
}

export interface CompositeStoreOptions<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CollectionStoreOptions<T>,
    StoreOptions<
      CompositeStoreState<T>,
      | "id"
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
