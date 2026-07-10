import { expect, test } from "vitest";
import { CollectionProvider } from "./collection/collection-provider.tsx";
import { CollectionRenderer } from "./collection/collection-renderer.tsx";
import { CompositeProvider } from "./composite/composite-provider.tsx";
import { CompositeRenderer } from "./composite/composite-renderer.tsx";
import { SelectProvider } from "./select/select-provider.tsx";
import { SelectValue } from "./select/select-value.tsx";

interface MyItem {
  id: string;
  label: string;
}

const myItems: MyItem[] = [{ id: "a", label: "A" }];

// These JSX expressions are type-level regression coverage: they must keep
// compiling, which `pnpm tsc` enforces. Branding provider components with base
// stores previously poisoned the renderers' item type inference (`item.label`
// errored) and rejected explicit generic arguments when the provider arm of
// the `store` option was parameterized over `T`.
test("store props accept provider components without poisoning generics", () => {
  const cases = [
    // Item type inference must not degrade to the base store item type.
    <CollectionRenderer
      key="collection"
      items={myItems}
      store={CollectionProvider}
    >
      {(item) => <div key={item.id}>{item.label}</div>}
    </CollectionRenderer>,
    <CompositeRenderer
      key="composite"
      items={myItems}
      store={CompositeProvider}
    >
      {(item) => <div key={item.id}>{item.label}</div>}
    </CompositeRenderer>,
    // Explicit generic arguments must accept provider components.
    <CollectionRenderer<MyItem>
      key="collection-explicit"
      items={myItems}
      store={CollectionProvider}
    >
      {(item) => <div key={item.id}>{item.label}</div>}
    </CollectionRenderer>,
    <CompositeRenderer<MyItem>
      key="composite-explicit"
      items={myItems}
      store={CompositeProvider}
    >
      {(item) => <div key={item.id}>{item.label}</div>}
    </CompositeRenderer>,
    <SelectValue<"a" | "b">
      key="select-value"
      store={SelectProvider}
      fallback="a"
    />,
  ];
  expect(cases).toHaveLength(5);
});
