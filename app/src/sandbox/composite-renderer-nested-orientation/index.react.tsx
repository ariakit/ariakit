import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItemObject } from "@ariakit/react-components/composite/composite-renderer";

interface RendererItem extends CompositeRendererItemObject {
  label: string;
  items?: RendererItem[];
}

const nestedItems: RendererItem[] = [
  {
    id: "nested-alpha",
    label: "Nested alpha",
    style: { height: 24, width: 140 },
  },
  {
    id: "nested-beta",
    label: "Nested beta",
    style: { height: 32, width: 160 },
  },
];

const items: RendererItem[] = [
  {
    id: "horizontal-group",
    label: "Horizontal group",
    orientation: "horizontal",
    gap: 10,
    items: nestedItems,
  },
  {
    id: "after-group",
    label: "After group",
    style: { height: 40 },
  },
];

export default function Example() {
  return (
    <CompositeRenderer<RendererItem>
      id="mixed-orientation"
      initialItems={items.length}
      items={items}
      orientation="vertical"
      renderOnResize={false}
      renderOnScroll={false}
    >
      {(item) => (
        <div
          id={item.id}
          key={item.id}
          ref={item.ref}
          style={{
            ...item.style,
            boxSizing: "border-box",
            padding: 2,
          }}
        >
          {item.label}
          {!!item.items?.length && (
            <CompositeRenderer<RendererItem>
              id={`${item.id}-items`}
              initialItems={item.items.length}
              items={item.items}
              orientation={item.orientation}
              renderOnResize={false}
              renderOnScroll={false}
            >
              {(nestedItem) => (
                <span
                  id={nestedItem.id}
                  key={nestedItem.id}
                  ref={nestedItem.ref}
                  style={{
                    ...nestedItem.style,
                    boxSizing: "border-box",
                    display: "inline-flex",
                    padding: 2,
                  }}
                >
                  {nestedItem.label}
                </span>
              )}
            </CompositeRenderer>
          )}
        </div>
      )}
    </CompositeRenderer>
  );
}
