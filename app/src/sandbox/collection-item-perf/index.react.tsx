import * as Ariakit from "@ariakit/react";
// The baseline renders the ordinary items published in 0.4.14, the release that
// introduced the offscreen feature. Both copies end up in this fixture's bundle,
// which costs page load rather than any measured interaction.
import * as AriakitLegacy from "@ariakit/react-v0.4.14";
import { useState } from "react";
import { useItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import "./style.css";

const itemCount = 1000;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
);

function CollectionFixture({ mounted }: { mounted: boolean }) {
  return (
    // Without a provider a collection has no store, so items would register into
    // nothing and the fixture would measure per-item hooks without the
    // registration that is most of what a collection item costs.
    <Ariakit.CollectionProvider>
      <Ariakit.Collection
        aria-label="Collection items"
        className="scroller"
        role="list"
      >
        {mounted
          ? items.map((item) => (
              <Ariakit.CollectionItem
                key={item}
                className="item"
                data-item={item}
                role="listitem"
              >
                {item}
              </Ariakit.CollectionItem>
            ))
          : null}
      </Ariakit.Collection>
    </Ariakit.CollectionProvider>
  );
}

function LegacyCollectionFixture({ mounted }: { mounted: boolean }) {
  return (
    <AriakitLegacy.CollectionProvider>
      <AriakitLegacy.Collection
        aria-label="Collection items"
        className="scroller"
        role="list"
      >
        {mounted
          ? items.map((item) => (
              <AriakitLegacy.CollectionItem
                key={item}
                className="item"
                data-item={item}
                role="listitem"
              >
                {item}
              </AriakitLegacy.CollectionItem>
            ))
          : null}
      </AriakitLegacy.Collection>
    </AriakitLegacy.CollectionProvider>
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
      {variant === "legacy" ? (
        <LegacyCollectionFixture mounted={mounted} />
      ) : (
        <CollectionFixture mounted={mounted} />
      )}
    </main>
  );
}
