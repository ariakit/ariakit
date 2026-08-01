import * as Ariakit from "@ariakit/react";
import { CollectionItem as OffscreenCollectionItem } from "@ariakit/react-components/collection/collection-item-offscreen";
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

interface CollectionItemProps {
  item: string;
  variant: ItemVariant;
  offscreenRoot: RefObject<HTMLDivElement | null>;
}

function CollectionItem({ item, variant, offscreenRoot }: CollectionItemProps) {
  const props = {
    className: "item",
    "data-item": item,
    role: "listitem",
    children: item,
  } as const;
  if (variant === "base") {
    return <Ariakit.CollectionItem {...props} />;
  }
  return (
    <OffscreenCollectionItem
      {...props}
      offscreenMode={variant}
      offscreenRoot={offscreenRoot}
    />
  );
}

interface CollectionFixtureProps {
  mounted: boolean;
  variant: ItemVariant;
}

function CollectionFixture({ mounted, variant }: CollectionFixtureProps) {
  const offscreenRoot = useRef<HTMLDivElement>(null);
  return (
    <Ariakit.Collection
      aria-label="Collection items"
      className="scroller"
      ref={offscreenRoot}
      role="list"
    >
      {mounted
        ? items.map((item) => (
            <CollectionItem
              key={item}
              item={item}
              variant={variant}
              offscreenRoot={offscreenRoot}
            />
          ))
        : null}
    </Ariakit.Collection>
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
        {mounted ? "Unmount collection" : "Mount collection"}
      </Ariakit.Button>
      <CollectionFixture mounted={mounted} variant={variant} />
    </main>
  );
}
