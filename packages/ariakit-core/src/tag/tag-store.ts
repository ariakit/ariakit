import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { createCompositeStore } from "../composite/composite-store.ts";
import { applyState, defaultValue } from "../utils/misc.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import { createStore, setup, sync } from "../utils/store.ts";
import type { SetState } from "../utils/types.ts";
import { UndoManager } from "../utils/undo.ts";

/**
 * Creates a tag store.
 */
export function createTagStore(props: TagStoreProps = {}): TagStore {
  const syncState = props.store?.getState();
  const composite = createCompositeStore(props);

  const initialState: TagStoreState = {
    ...composite.getState(),
    inputElement: defaultValue(syncState?.inputElement, null),
    labelElement: defaultValue(syncState?.labelElement, null),
    value: defaultValue(props.value, syncState?.value, props.defaultValue, ""),
    values: defaultValue(
      props.values,
      syncState?.values,
      props.defaultValues,
      [],
    ),
  };

  const tag = createStore(initialState, composite, props.store);

  // Set the input element as the default active element, that is, the element
  // that will receive focus when the composite widget is focused.
  setup(tag, () =>
    sync(tag, ["inputElement", "activeId"], (state) => {
      if (!state.inputElement) return;
      if (state.activeId !== undefined) return;
      tag.setState("activeId", state.inputElement.id);
    }),
  );

  const setValues: TagStore["setValues"] = (values) => {
    const { values: previousValues } = tag.getState();
    UndoManager.execute(() => {
      let changed = true;
      tag.setState("values", (prev) => {
        const next = applyState(values, prev);
        if (next === prev) {
          changed = false;
        }
        return next;
      });
      if (!changed) return;
      return () => {
        tag.setState("values", previousValues);
        composite.move(tag.getState().inputElement?.id);
      };
    });
  };

  return {
    ...composite,
    ...tag,
    setInputElement: (inputElement) =>
      tag.setState("inputElement", inputElement),

    setLabelElement: (labelElement) =>
      tag.setState("labelElement", labelElement),

    setValue: (value) => tag.setState("value", value),

    resetValue: () => tag.setState("value", initialState.value),

    setValues,

    addValue: (value) => {
      setValues((values) => {
        if (values.includes(value)) return values;
        return [...values, value];
      });
    },

    removeValue: (value) =>
      setValues((values) => values.filter((v) => v !== value)),
  };
}

export interface TagStoreItem extends CompositeStoreItem {
  value?: string;
}

export interface TagStoreState extends CompositeStoreState<TagStoreItem> {
  /**
   * The input element.
   */
  inputElement: HTMLElement | null;
  /**
   * The label element.
   */
  labelElement: HTMLElement | null;
  /**
   * The value of the tag input.
   * @default ""
   */
  value: string;
  /**
   * The values of the selected tags.
   * @default []
   */
  values: string[];
}

export interface TagStoreFunctions
  extends CompositeStoreFunctions<TagStoreItem> {
  /**
   * Sets the `inputElement` state.
   */
  setInputElement: SetState<TagStoreState["inputElement"]>;
  /**
   * Sets the `labelElement` state.
   */
  setLabelElement: SetState<TagStoreState["labelElement"]>;
  /**
   * Sets the [`value`](https://ariakit.org/reference/tag-provider#value) state.
   */
  setValue: SetState<TagStoreState["value"]>;
  /**
   * Resets the [`value`](https://ariakit.org/reference/tag-provider#value)
   * state to its initial value.
   */
  resetValue: () => void;
  /**
   * Sets the [`values`](https://ariakit.org/reference/tag-provider#values) state.
   */
  setValues: SetState<TagStoreState["values"]>;
  /**
   * Add a new value to the
   * [`values`](https://ariakit.org/reference/tag-provider#values) state if it
   * doesn't already exist.
   */
  addValue: (value: string) => void;
  /**
   * Remove a value from the
   * [`values`](https://ariakit.org/reference/tag-provider#values) state.
   */
  removeValue: (value: string) => void;
}

export interface TagStoreOptions
  extends StoreOptions<TagStoreState, "value" | "values">,
    CompositeStoreOptions<TagStoreItem> {
  /**
   * The initial value of the tag input.
   * @default ""
   */
  defaultValue?: TagStoreState["value"];
  /**
   * The initial selected tag values.
   * @default []
   */
  defaultValues?: TagStoreState["values"];
}

export interface TagStoreProps
  extends TagStoreOptions,
    StoreProps<TagStoreState> {}

export interface TagStore extends TagStoreFunctions, Store<TagStoreState> {}
