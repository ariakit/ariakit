import { useCompositeStore } from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItem } from "@ariakit/react-components/composite/composite-renderer";

const items = [{}, {}, {}] satisfies readonly CompositeRendererItem[];

const itemsWithNestedItems = [
  {},
  { items: [{ id: "other" }] },
  {},
] satisfies readonly CompositeRendererItem[];

function getItemsWithPrefixAndExactIds(baseId: string) {
  return [
    { id: `${baseId}/1` },
    { id: `${baseId}/1/nested` },
    {},
  ] satisfies readonly CompositeRendererItem[];
}

interface FixtureProps {
  activeId: string;
  baseId: string;
  items: readonly CompositeRendererItem[];
  label: string;
}

function Fixture({ activeId, baseId, items, label }: FixtureProps) {
  const store = useCompositeStore({ activeId });

  return (
    <section aria-label={label}>
      <CompositeRenderer
        id={baseId}
        store={store}
        items={items}
        initialItems={1}
        itemSize={10}
      >
        {(item) => (
          <button
            data-index={item.index}
            id={item.id}
            key={item.id}
            ref={item.ref}
            style={item.style}
            type="button"
          >
            {label} item {item.index}
          </button>
        )}
      </CompositeRenderer>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <Fixture
        activeId="composite-generated/1/nested"
        baseId="composite-generated"
        items={items}
        label="generated"
      />
      <Fixture
        activeId="composite-partial-nested/1/nested"
        baseId="composite-partial-nested"
        items={itemsWithNestedItems}
        label="partial-nested"
      />
      <Fixture
        activeId="other"
        baseId="composite-explicit-nested"
        items={itemsWithNestedItems}
        label="explicit-nested"
      />
      <Fixture
        activeId="composite-exact-over-prefix/1/nested"
        baseId="composite-exact-over-prefix"
        items={getItemsWithPrefixAndExactIds("composite-exact-over-prefix")}
        label="exact-over-prefix"
      />
      <Fixture
        activeId="composite-longest-prefix/1/nested/deeper"
        baseId="composite-longest-prefix"
        items={getItemsWithPrefixAndExactIds("composite-longest-prefix")}
        label="longest-prefix"
      />
    </>
  );
}
