import * as Ariakit from "@ariakit/react";
import { CollectionItem as OffscreenCollectionItem } from "@ariakit/react-components/collection/collection-item-offscreen";
import { useEffect, useState } from "react";
import "./style.css";

const itemCount = 1000;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
);

interface CollectionItemProps {
  item: string;
  offscreen: boolean;
}

function getOffscreenRoot(element: HTMLElement) {
  return element.parentElement;
}

function CollectionItem({ item, offscreen }: CollectionItemProps) {
  const props = {
    className: "item",
    "data-item": item,
    role: "listitem",
    children: item,
  } as const;
  if (offscreen) {
    return (
      <OffscreenCollectionItem
        {...props}
        offscreenMode="passive"
        offscreenRoot={getOffscreenRoot}
      />
    );
  }
  return <Ariakit.CollectionItem {...props} />;
}

function CollectionFixture({ offscreen }: { offscreen: boolean }) {
  return (
    <Ariakit.Collection
      aria-label="Collection items"
      className="scroller"
      role="list"
    >
      {items.map((item) => (
        <CollectionItem key={item} item={item} offscreen={offscreen} />
      ))}
    </Ariakit.Collection>
  );
}

export default function Example() {
  const [mounted, setMounted] = useState(false);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOffscreen(params.get("item") === "offscreen");
  }, []);

  return (
    <main className="root">
      <output aria-label="Item variant">
        {offscreen ? "offscreen" : "base"}
      </output>
      <Ariakit.Button
        className="button"
        onClick={() => setMounted((value) => !value)}
      >
        {mounted ? "Unmount collection" : "Mount collection"}
      </Ariakit.Button>
      {mounted ? <CollectionFixture offscreen={offscreen} /> : null}
    </main>
  );
}
