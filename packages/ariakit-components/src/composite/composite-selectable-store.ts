import { createStore, sync } from "@ariakit/store";
import type { Store, StoreOptions, StoreProps } from "@ariakit/store";
import { defaultValue } from "@ariakit/utils";
import type { SetState } from "@ariakit/utils";
import type {
  SelectableBehavior,
  SelectableController,
  SelectableMode,
  SelectableRangeDelegate,
} from "../collection/__selectable-controller.ts";
import { createSelectableController } from "../collection/__selectable-controller.ts";
import type {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "./composite-store.ts";
import { createCompositeStore } from "./composite-store.ts";

export type {
  SelectableBehavior,
  SelectableController,
  SelectableEvent,
  SelectableMode,
  SelectableRangeDelegate,
} from "../collection/__selectable-controller.ts";

/**
 * Adds range-anchor and range-extension options to a Composite move function.
 * The source ID is read before the underlying move commits so a selection can
 * extend from the previous cursor.
 */
export function createSelectableMove<
  T extends CompositeStoreItem = CompositeStoreItem,
>(
  composite: Pick<CompositeStore<T>, "getState" | "move">,
  selection: SelectableController,
): CompositeStore<T>["move"] {
  return (id, options) => {
    if (id === undefined) return;
    const fromId = composite.getState().activeId;
    composite.move(id);
    if (id === null) return;
    if (options?.extend) {
      selection.extendFrom(fromId, id);
      return;
    }
    if (options?.anchor) {
      selection.seat(id);
    }
  };
}

/**
 * Creates a Composite store with reusable single and multiple selection.
 */
export function createCompositeSelectableStore<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>(props: CompositeSelectableStoreProps<T> = {}): CompositeSelectableStore<T> {
  const syncState = props.store?.getState();
  const composite = createCompositeStore(props);

  const initialState: CompositeSelectableStoreState<T> = {
    ...composite.getState(),
    selectedIds: defaultValue(
      props.selectedIds,
      syncState?.selectedIds,
      props.defaultSelectedIds,
      [],
    ),
    selectableMode: defaultValue(
      props.selectableMode,
      syncState?.selectableMode,
      "multiple" as const,
    ),
    selectableBehavior: defaultValue(
      props.selectableBehavior,
      syncState?.selectableBehavior,
      "toggle" as const,
    ),
  };

  const selectable = createStore(initialState, composite, props.store);

  let selection: SelectableController;

  const resolveSelectionTarget = (id: string) => {
    if (selection.isSelectable(id)) return id;
    const rowId = composite.item(id)?.rowId;
    if (rowId == null) return id;
    if (rowId === id) return id;
    if (!selection.isSelectable(rowId)) return id;
    return rowId;
  };

  selection = createSelectableController({
    collection: composite,
    getBehavior: () => selectable.getState().selectableBehavior,
    getCursorId: () => composite.getState().activeId,
    getKeys: () => selectable.getState().selectedIds,
    getMode: () => selectable.getState().selectableMode,
    getSelectionKey: (id) => id,
    rangeDelegate: props.rangeDelegate,
    requireOptIn: true,
    resolveTarget: resolveSelectionTarget,
    setKeys: (keys) => selectable.setState("selectedIds", keys),
    subscribeKeys: (listener) =>
      sync(selectable, ["selectedIds"], (state) => {
        listener(state.selectedIds);
      }),
  });

  return {
    ...composite,
    ...selectable,
    setSelectedIds: (selectedIds) =>
      selectable.setState("selectedIds", selectedIds),
    isSelected: (id) => selection.isSelected(id),
    isSelectable: (id) => selection.isSelectable(id),
    select: (id) => selection.select(id),
    deselect: (id) => selection.deselect(id),
    toggle: (id) => selection.toggle(id),
    extend: (id, options) => {
      const fromId = composite.getState().activeId;
      selection.extendFrom(fromId, id, options);
    },
    selectAll: () => selection.selectAll(),
    deselectAll: () => selection.deselectAll(),
    unstable_selection: selection,
    move: createSelectableMove(composite, selection),
  };
}

export interface CompositeSelectableStoreItem extends CompositeStoreItem {}

export interface CompositeSelectableStoreState<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
> extends CompositeStoreState<T> {
  /**
   * The ids of the selected items, in selection order.
   *
   * Each entry must be a stable item `id` supplied by the author. Selecting
   * appends ids. Deselecting removes them. Ranges append new ids in collection
   * order, regardless of the gesture direction.
   * @default []
   */
  selectedIds: readonly string[];
  /**
   * Whether users can select no items, one item, or several. `none` freezes the
   * selection without clearing it.
   * @default "multiple"
   */
  selectableMode: SelectableMode;
  /**
   * What an unmodified activation does when several items can be selected.
   * `toggle` changes one item and preserves the other selected items. `replace`
   * selects only the activated item unless the platform modifier is pressed.
   * @default "toggle"
   */
  selectableBehavior: SelectableBehavior;
}

export interface CompositeSelectableStoreFunctions<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
> extends CompositeStoreFunctions<T> {
  setSelectedIds: SetState<CompositeSelectableStoreState<T>["selectedIds"]>;
  /** Returns whether an item is currently selected. */
  isSelected(id: string): boolean;
  /** Returns whether an item is eligible for selection. */
  isSelectable(id: string): boolean;
  select(id: string): void;
  deselect(id: string): void;
  toggle(id: string): void;
  extend(id: string, options?: { additive?: boolean }): void;
  selectAll(): void;
  deselectAll(): void;
  /** @private The shared selection engine. */
  unstable_selection: SelectableController;
}

export interface CompositeSelectableStoreOptions<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends
    CompositeStoreOptions<T>,
    StoreOptions<
      CompositeSelectableStoreState<T>,
      "selectedIds" | "selectableMode" | "selectableBehavior"
    > {
  /**
   * The default selected item ids.
   * @default []
   */
  defaultSelectedIds?: readonly string[];
  /**
   * Range geometry and complete item order for items that may not be mounted.
   * Both delegate methods are required, and the object must be referentially
   * stable.
   */
  rangeDelegate?: SelectableRangeDelegate | null;
}

export interface CompositeSelectableStoreProps<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends
    CompositeSelectableStoreOptions<T>,
    StoreProps<CompositeSelectableStoreState<T>> {}

export interface CompositeSelectableStore<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends
    CompositeSelectableStoreFunctions<T>,
    Store<CompositeSelectableStoreState<T>> {}
