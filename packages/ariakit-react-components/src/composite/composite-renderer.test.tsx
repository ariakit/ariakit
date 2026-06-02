import { render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { CompositeRenderer } from "./composite-renderer.tsx";
import type { CompositeRendererItem } from "./composite-renderer.tsx";
import { useCompositeStore } from "./composite-store.ts";

const items = [{}, {}, {}] satisfies readonly CompositeRendererItem[];
const itemsWithNestedItems = [
  {},
  { items: [{ id: "other" }] },
  {},
] satisfies readonly CompositeRendererItem[];
const itemsWithPrefixAndExactIds = [
  { id: "composite/1" },
  { id: "composite/1/nested" },
  {},
] satisfies readonly CompositeRendererItem[];

function getRenderedIndices(root: ParentNode) {
  return Array.from(root.querySelectorAll("[data-index]"), (element) => {
    return element.getAttribute("data-index");
  });
}

interface FixtureProps {
  activeId: string;
  items: readonly CompositeRendererItem[];
}

function Fixture({ activeId, items }: FixtureProps) {
  const store = useCompositeStore({ activeId });

  return (
    <CompositeRenderer
      id="composite"
      store={store}
      items={items}
      initialItems={1}
      itemSize={10}
    >
      {(item) => (
        <div
          data-index={item.index}
          id={item.id}
          key={item.id}
          ref={item.ref}
          style={item.style}
        />
      )}
    </CompositeRenderer>
  );
}

test.each([
  {
    activeId: "composite/1/nested",
    name: "without nested item metadata",
    items,
  },
  {
    activeId: "composite/1/nested",
    name: "with partial nested item metadata",
    items: itemsWithNestedItems,
  },
  {
    activeId: "other",
    name: "with explicit nested item metadata",
    items: itemsWithNestedItems,
  },
  {
    activeId: "composite/1/nested",
    name: "with exact item after matching ancestor prefix",
    items: itemsWithPrefixAndExactIds,
  },
  {
    activeId: "composite/1/nested/deeper",
    name: "with closest ancestor after shallower prefix",
    items: itemsWithPrefixAndExactIds,
  },
])("renders active item ancestors $name", async ({ activeId, items }) => {
  const root = document.createElement("div");
  document.body.append(root);
  const { unmount } = await render(
    <Fixture activeId={activeId} items={items} />,
    {
      container: root,
      strictMode: true,
    },
  );

  try {
    expect(getRenderedIndices(root)).toEqual(["0", "1", "2"]);
  } finally {
    unmount();
    root.remove();
  }
});
