import * as Ariakit from "@ariakit/react";
import { CompositeItem as OffscreenCompositeItem } from "@ariakit/react-components/composite/composite-item-offscreen";
import type { RefObject } from "react";
import { useRef, useState } from "react";
import type { ItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import { useItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import "./style.css";

const itemCount = 1000;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
);

interface CompositeItemProps {
  item: string;
  variant: ItemVariant;
  offscreenRoot: RefObject<HTMLDivElement | null>;
}

function CompositeItem({ item, variant, offscreenRoot }: CompositeItemProps) {
  const props = {
    className: "item",
    "data-item": item,
    id: `item-${item.slice(5)}`,
    value: item,
    children: item,
  } as const;
  if (variant === "base") {
    return <Ariakit.CompositeItem {...props} />;
  }
  return (
    <OffscreenCompositeItem
      {...props}
      offscreenMode={variant}
      offscreenRoot={offscreenRoot}
    />
  );
}

interface CompositeFixtureProps {
  mounted: boolean;
  variant: ItemVariant;
}

function CompositeFixture({ mounted, variant }: CompositeFixtureProps) {
  const offscreenRoot = useRef<HTMLDivElement>(null);
  return (
    <Ariakit.CompositeProvider orientation="vertical">
      <Ariakit.Composite
        aria-label="Composite items"
        className="scroller"
        ref={offscreenRoot}
        role="toolbar"
      >
        {mounted
          ? items.map((item) => (
              <CompositeItem
                key={item}
                item={item}
                variant={variant}
                offscreenRoot={offscreenRoot}
              />
            ))
          : null}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  const [mounted, setMounted] = useState(false);
  const variant = useItemVariant();

  return (
    <main className="root">
      <output aria-label="Item variant">{variant}</output>
      <Ariakit.Button
        className="button"
        onClick={() => setMounted((value) => !value)}
      >
        {mounted ? "Unmount composite" : "Mount composite"}
      </Ariakit.Button>
      <CompositeFixture mounted={mounted} variant={variant} />
    </main>
  );
}
