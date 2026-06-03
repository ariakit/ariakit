import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItemObject } from "@ariakit/react-components/composite/composite-renderer";
import { useState } from "react";

interface Item extends CompositeRendererItemObject {
  label: string;
}

const items = [
  { id: "first", label: "First item" },
  { id: "second", label: "Second item" },
] satisfies Item[];

export default function Example() {
  const [mounted, setMounted] = useState(true);
  const [version, setVersion] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        Replace first item
      </button>
      <button type="button" onClick={() => setMounted(false)}>
        Hide renderer
      </button>
      {mounted && (
        <CompositeRenderer<Item>
          id="renderer"
          initialItems={items.length}
          items={items}
          renderOnResize={false}
          renderOnScroll={false}
        >
          {(item) => {
            const replaceable = item.id === "first";
            return (
              <div
                id={item.id}
                key={replaceable ? `${item.id}-${version}` : item.id}
                ref={item.ref}
                style={{ ...item.style, height: 24 }}
              >
                {item.label}
              </div>
            );
          }}
        </CompositeRenderer>
      )}
    </>
  );
}
