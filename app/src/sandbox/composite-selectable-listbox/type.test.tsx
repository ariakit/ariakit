import { Composite } from "@ariakit/react-components/composite/composite";
import { CompositeItem } from "@ariakit/react-components/composite/composite-item";
import { useCompositeSelectableStore } from "@ariakit/react-components/composite/composite-selectable-store";
import type { CompositeStoreItem } from "@ariakit/react-components/composite/composite-store";
import type { ReactNode } from "react";
import { expectTypeOf, test } from "vitest";

function DefaultStore() {
  const store = useCompositeSelectableStore();
  expectTypeOf(store.unstable_selection.getMode()).toEqualTypeOf<
    "none" | "single" | "multiple"
  >();
  // @ts-expect-error Private typed seams use the unstable_ prefix.
  expectTypeOf(store.selection).toBeUndefined();
  return (
    <Composite store={store}>
      <CompositeItem store={store}>Item</CompositeItem>
    </Composite>
  );
}

interface Item extends CompositeStoreItem {
  value: string;
}

function GenericStore() {
  const store = useCompositeSelectableStore<Item>({
    defaultItems: [{ id: "item", value: "value" }],
  });
  expectTypeOf(store.item("item")).toEqualTypeOf<Item | null>();
  return (
    <Composite store={store}>
      <CompositeItem store={store}>Item</CompositeItem>
    </Composite>
  );
}

test("passes a composite selectable store to Composite components", () => {
  expectTypeOf(DefaultStore).returns.toMatchTypeOf<ReactNode>();
  expectTypeOf(GenericStore).returns.toMatchTypeOf<ReactNode>();
});
