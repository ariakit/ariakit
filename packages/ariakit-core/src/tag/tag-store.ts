import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, setup, sync } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

/**
 * Creates a tag store.
 */
export function createTagStore(props: TagStoreProps = {}): TagStore {
  const syncState = props.store?.getState();

  const composite = createCompositeStore({
    ...props,
  });

  const initialState: TagStoreState = {
    ...composite.getState(),
    inputElement: defaultValue(syncState?.inputElement, null),
    value: defaultValue(props.value, syncState?.value, ""),
    values: defaultValue(props.values, syncState?.values, []),
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

  return {
    ...composite,
    ...tag,
    setInputElement: (inputElement) =>
      tag.setState("inputElement", inputElement),

    setValue: (value) => tag.setState("value", value),
    setValues: (values) => tag.setState("values", values),

    addValue: (value) => {
      tag.setState("values", (values) => {
        if (values.includes(value)) return values;
        return [...values, value];
      });
    },

    removeValue: (value) =>
      tag.setState("values", (values) => values.filter((v) => v !== value)),

    toggleValue: (value) =>
      tag.setState("values", (values) =>
        values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value],
      ),
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
   * The value of the tag input.
   */
  value: string;
  /**
   * The values of the selected tags.
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
   * Sets the `value` state.
   */
  setValue: SetState<TagStoreState["value"]>;
  /**
   * Sets the `values` state.
   */
  setValues: SetState<TagStoreState["values"]>;
  /**
   * TODO: Docs
   */
  addValue: (value: string) => void;
  /**
   * TODO: Docs
   */
  removeValue: (value: string) => void;
  /**
   * TODO: Docs
   */
  toggleValue: (value: string) => void;
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
   * The initial values.
   * @default []
   */
  defaultValues?: TagStoreState["values"];
}

export interface TagStoreProps
  extends TagStoreOptions,
    StoreProps<TagStoreState> {}

export interface TagStore extends TagStoreFunctions, Store<TagStoreState> {}
