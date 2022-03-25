import { RefObject, useCallback, useMemo, useRef } from "react";
import { flatten2DArray, reverseArray } from "ariakit-utils/array";
import {
  useControlledState,
  useInitialValue,
  useLiveRef,
} from "ariakit-utils/hooks";
import { useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CollectionState,
  CollectionStateProps,
  useCollectionState,
} from "../collection/collection-state";
import {
  Item,
  Orientation,
  findFirstEnabledItem,
  flipItems,
  getActiveId,
  getEnabledItems,
  getItemsInRow,
  getOppositeOrientation,
  groupItemsByRows,
  normalizeRows,
  verticalizeItems,
} from "./__utils";

/**
 * Provides state for the `Composite` component.
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 *   <CompositeItem>Item 3</CompositeItem>
 * </Composite>
 * ```
 */
export function useCompositeState<T extends Item = Item>({
  orientation = "both",
  rtl = false,
  virtualFocus = false,
  focusLoop = false,
  focusWrap = false,
  focusShift = false,
  ...props
}: CompositeStateProps<T> = {}): CompositeState<T> {
  const collection = useCollectionState(props);
  const baseRef = useRef<HTMLDivElement>(null);
  const [moves, setMoves] = useControlledState(0, props.moves, props.setMoves);
  const [_activeId, setActiveId] = useControlledState(
    props.defaultActiveId,
    props.activeId,
    props.setActiveId
  );
  const activeId = useMemo(
    () => getActiveId(collection.items, _activeId),
    [collection.items, _activeId]
  );
  const initialActiveId = useInitialValue(activeId);
  const includesBaseElement =
    props.includesBaseElement ?? initialActiveId === null;
  const activeIdRef = useLiveRef(activeId);

  const move = useCallback((id?: Item["id"]) => {
    // move() does nothing
    if (id === undefined) return;
    setMoves((prevMoves) => prevMoves + 1);
    setActiveId(id);
  }, []);

  const first = useCallback(() => {
    const firstItem = findFirstEnabledItem(collection.items);
    return firstItem?.id;
  }, [collection.items]);

  const last = useCallback(() => {
    const firstItem = findFirstEnabledItem(reverseArray(collection.items));
    return firstItem?.id;
  }, [collection.items]);

  const getNextId = useCallback(
    (
      items: Item[],
      orientation: Orientation,
      hasNullItem: boolean,
      skip?: number
    ): string | null | undefined => {
      // RTL doesn't make sense on vertical navigation
      const isHorizontal = orientation !== "vertical";
      const isRTL = rtl && isHorizontal;
      const allItems = isRTL ? reverseArray(items) : items;
      // If there's no item focused, we just move the first one.
      if (activeIdRef.current == null) {
        return findFirstEnabledItem(allItems)?.id;
      }
      const activeItem = allItems.find(
        (item) => item.id === activeIdRef.current
      );
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
        const nextEnabledItemsInRow = getEnabledItems(
          nextItemsInRow,
          activeIdRef.current
        );
        const nextItem =
          nextEnabledItemsInRow.slice(skip)[0] ||
          // If we can't find an item, just return the last one.
          nextEnabledItemsInRow[nextEnabledItemsInRow.length - 1];
        return nextItem?.id;
      }
      const oppositeOrientation = getOppositeOrientation(
        // If it's a grid and orientation is not set, it's a next/previous
        // call, which is inherently horizontal. up/down will call next with
        // orientation set to vertical by default (see below on up/down
        // methods).
        isGrid ? orientation || "horizontal" : orientation
      );
      const canLoop = focusLoop && focusLoop !== oppositeOrientation;
      const canWrap = isGrid && focusWrap && focusWrap !== oppositeOrientation;
      // previous and up methods will set hasNullItem, but when calling next
      // directly, hasNullItem will only be true if if it's not a grid and
      // focusLoop is set to true, which means that pressing right or down keys
      // on grids will never focus the composite container element. On
      // one-dimensional composites that don't loop, pressing right or down
      // keys also doesn't focus on the composite container element.
      hasNullItem = hasNullItem || (!isGrid && canLoop && includesBaseElement);

      if (canLoop) {
        const loopItems =
          canWrap && !hasNullItem
            ? allItems
            : getItemsInRow(allItems, activeItem.rowId);
        const sortedItems = flipItems(
          loopItems,
          activeIdRef.current,
          hasNullItem
        );
        const nextItem = findFirstEnabledItem(sortedItems, activeIdRef.current);
        return nextItem?.id;
      }

      if (canWrap) {
        const nextItem = findFirstEnabledItem(
          // We can use nextItems, which contains all the next items, including
          // items from other rows, to wrap between rows. However, if there is
          // a null item (the composite container), we'll only use the next
          // items in the row. So moving next from the last item will focus on
          // the composite container. On grid composites, horizontal navigation
          // never focuses on the composite container, only vertical.
          hasNullItem ? nextItemsInRow : nextItems,
          activeIdRef.current
        );
        const nextId = hasNullItem ? nextItem?.id || null : nextItem?.id;
        return nextId;
      }

      const nextItem = findFirstEnabledItem(
        nextItemsInRow,
        activeIdRef.current
      );
      if (!nextItem && hasNullItem) {
        return null;
      }
      return nextItem?.id;
    },
    [focusLoop, focusWrap, includesBaseElement]
  );

  const next = useCallback(
    (skip?: number) => {
      return getNextId(collection.items, orientation, false, skip);
    },
    [getNextId, collection.items, orientation]
  );

  const previous = useCallback(
    (skip?: number) => {
      // If activeId is initially set to null or if includesBaseElement is set
      // to true, then the composite container will be focusable while
      // navigating with arrow keys. But, if it's a grid, we don't want to
      // focus on the composite container with horizontal navigation.
      const isGrid = !!findFirstEnabledItem(collection.items)?.rowId;
      const hasNullItem = !isGrid && includesBaseElement;
      return getNextId(
        reverseArray(collection.items),
        orientation,
        hasNullItem,
        skip
      );
    },
    [collection.items, getNextId, orientation, includesBaseElement]
  );

  const down = useCallback(
    (skip?: number) => {
      const shouldShift = focusShift && !skip;
      // First, we make sure rows have the same number of items by filling it
      // with disabled fake items. Then, we reorganize the items.
      const verticalItems = verticalizeItems(
        flatten2DArray(
          normalizeRows(
            groupItemsByRows(collection.items),
            activeIdRef.current,
            shouldShift
          )
        )
      );
      const canLoop = focusLoop && focusLoop !== "horizontal";
      // Pressing down arrow key will only focus on the composite container if
      // loop is true, both, or vertical.
      const hasNullItem = canLoop && includesBaseElement;
      return getNextId(verticalItems, "vertical", hasNullItem, skip);
    },
    [collection.items, getNextId, focusShift, focusLoop]
  );

  const up = useCallback(
    (skip?: number) => {
      const shouldShift = focusShift && !skip;
      const verticalItems = verticalizeItems(
        reverseArray(
          flatten2DArray(
            normalizeRows(
              groupItemsByRows(collection.items),
              activeIdRef.current,
              shouldShift
            )
          )
        )
      );
      // If activeId is initially set to null, we'll always focus on the
      // composite container when the up arrow key is pressed in the first row.
      const hasNullItem = includesBaseElement;
      return getNextId(verticalItems, "vertical", hasNullItem, skip);
    },
    [collection.items, getNextId, focusShift]
  );

  const state = useMemo(
    () => ({
      ...collection,
      baseRef,
      orientation,
      rtl,
      virtualFocus,
      focusLoop,
      focusWrap,
      focusShift,
      moves,
      setMoves,
      includesBaseElement,
      activeId,
      setActiveId,
      move,
      next,
      previous,
      up,
      down,
      first,
      last,
    }),
    [
      collection,
      baseRef,
      orientation,
      rtl,
      virtualFocus,
      focusLoop,
      focusWrap,
      focusShift,
      moves,
      setMoves,
      includesBaseElement,
      activeId,
      setActiveId,
      move,
      next,
      previous,
      up,
      down,
      first,
      last,
    ]
  );

  return useStorePublisher(state);
}

export type CompositeState<T extends Item = Item> = CollectionState<T> & {
  /**
   * The ref to the `Composite` element.
   */
  baseRef: RefObject<HTMLElement>;
  /**
   * If enabled, the composite element will act as an
   * [aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant)
   * container instead of [roving
   * tabindex](https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex).
   * DOM focus will remain on the composite while its items receive virtual
   * focus.
   * @default false
   */
  virtualFocus: boolean;
  /**
   * Defines the orientation of the composite widget. If the composite has a
   * single row or column (one-dimensional), the `orientation` value determines
   * which arrow keys can be used to move focus:
   *   - `both`: all arrow keys work.
   *   - `horizontal`: only left and right arrow keys work.
   *   - `vertical`: only up and down arrow keys work.
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
   * On one-dimensional composites:
   *   - `true` loops from the last item to the first item and vice-versa.
   *   - `horizontal` loops only if `orientation` is `horizontal` or not set.
   *   - `vertical` loops only if `orientation` is `vertical` or not set.
   *   - If `activeId` is initially set to `null`, the composite element will be
   *     focused in between the last and first items.
   *
   * On two-dimensional composites:
   *   - `true` loops from the last row/column item to the first item in the
   *     same row/column and vice-versa. If it's the last item in the last row,
   *     it moves to the first item in the first row and vice-versa.
   *   - `horizontal` loops only from the last row item to the first item in the
   *     same row.
   *   - `vertical` loops only from the last column item to the first item in
   *     the column row.
   *   - If `activeId` is initially set to `null`, vertical loop will have no
   *     effect as moving down from the last row or up from the first row will
   *     focus the composite element.
   *   - If `focusWrap` matches the value of `focusLoop`, it'll wrap between the
   *     last item in the last row or column and the first item in the first row
   *     or column and vice-versa.
   * @default false
   */
  focusLoop: boolean | Orientation;
  /**
   * **Has effect only on two-dimensional composites**. If enabled, moving to
   * the next item from the last one in a row or column will focus the first
   * item in the next row or column and vice-versa.
   *   - `true` wraps between rows and columns.
   *   - `horizontal` wraps only between rows.
   *   - `vertical` wraps only between columns.
   *   - If `focusLoop` matches the value of `focusWrap`, it'll wrap between the last
   * item in the last row or column and the first item in the first row or
   * column and vice-versa.
   * @default false
   */
  focusWrap: boolean | Orientation;
  /**
   * **Has effect only on two-dimensional composites**. If enabled, moving up
   * or down when there's no next item or the next item is disabled will shift
   * to the item right before it.
   * @default false
   */
  focusShift: boolean;
  /**
   * The number of times the `move` function has been called.
   * @default 0
   * @example
   * const composite = useCompositeState();
   * composite.moves; // 0
   * composite.move(null);
   * // On the next render
   * composite.moves; // 1
   */
  moves: number;
  /**
   * Sets the `moves` state.
   */
  setMoves: SetState<CompositeState["moves"]>;
  /**
   * Indicates whether the `Composite` element should be included in the focus
   * order.
   * @default false
   */
  includesBaseElement: boolean;
  /**
   * The current focused item `id`.
   *   - `undefined` will automatically focus the first enabled composite item.
   *   - `null` will focus the base composite element and users will be able to
   *     navigate out of it using arrow keys.
   *   - If `activeId` is initially set to `null`, the base composite element
   *     itself will have focus and users will be able to navigate to it using
   *     arrow keys.
   * @default undefined
   */
  activeId?: Item["id"];
  /**
   * Sets the `activeId` state without moving focus.
   */
  setActiveId: SetState<CompositeState["activeId"]>;
  /**
   * Moves focus to a given item id.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move("item-2"); // focus item 2
   * };
   */
  move: (id?: Item["id"]) => void;
  /**
   * Returns the id of the next item.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move(composite.next()); // focus next item
   * };
   */
  next: (skip?: number) => Item["id"] | undefined;
  /**
   * Returns the id of the previous item.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move(composite.previous()); // focus previous item
   * };
   */
  previous: (skip?: number) => Item["id"] | undefined;
  /**
   * Returns the id of the item above.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move(composite.up()); // focus the item above
   * };
   */
  up: (skip?: number) => Item["id"] | undefined;
  /**
   * Returns the id of the item below.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move(composite.down()); // focus the item below
   * };
   */
  down: (skip?: number) => Item["id"] | undefined;
  /**
   * Returns the id of the first item.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move(composite.first()); // focus the first item
   * };
   */
  first: () => Item["id"] | undefined;
  /**
   * Returns the id of the last item.
   * @example
   * const composite = useCompositeState();
   * const onClick = () => {
   *   composite.move(composite.last()); // focus the last item
   * };
   */
  last: () => Item["id"] | undefined;
};

export type CompositeStateProps<T extends Item = Item> =
  CollectionStateProps<T> &
    Partial<
      Pick<
        CompositeState<T>,
        | "virtualFocus"
        | "orientation"
        | "rtl"
        | "focusLoop"
        | "focusWrap"
        | "focusShift"
        | "moves"
        | "includesBaseElement"
        | "activeId"
      >
    > & {
      /**
       * The composite item id that should be focused when the composite is
       * initialized.
       * @example
       * ```jsx
       * const composite = useCompositeState({ defaultActiveId: "item-2" });
       * <Composite state={composite}>
       *   <CompositeItem>Item 1</CompositeItem>
       *   <CompositeItem id="item-2">Item 2</CompositeItem>
       *   <CompositeItem>Item 3</CompositeItem>
       * </Composite>
       * ```
       */
      defaultActiveId?: CompositeState<T>["activeId"];
      /**
       * Function that will be called when setting the composite `moves` state.
       * @example
       * const [moves, setMoves] = useState(0);
       * useCompositeState({ moves, setMoves });
       */
      setMoves?: (moves: CompositeState<T>["moves"]) => void;
      /**
       * Function that will be called when setting the composite `activeId`.
       * @example
       * function MyComposite({ activeId, onActiveIdChange }) {
       *   const composite = useCompositeState({
       *     activeId,
       *     setActiveId: onActiveIdChange,
       *   });
       * }
       */
      setActiveId?: (activeId: CompositeState<T>["activeId"]) => void;
    };
