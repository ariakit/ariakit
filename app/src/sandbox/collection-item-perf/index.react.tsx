import * as Ariakit from "@ariakit/react";
import { CollectionItem as OffscreenCollectionItem } from "@ariakit/react-components/collection/collection-item-offscreen";
// The version comparison renders the ordinary items published in 0.4.14, the
// release that introduced the offscreen feature. Both copies end up in this
// fixture's bundle, which costs page load rather than any measured interaction.
import * as AriakitLegacy from "@ariakit/react-v0.4.14";
import type { RefObject } from "react";
import { useRef, useState } from "react";
import type { CurrentItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import { useItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import "./style.css";

const itemCount = 1000;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
);

interface CollectionItemProps {
  item: string;
  variant: CurrentItemVariant;
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
  variant: CurrentItemVariant;
}

function CollectionFixture({ mounted, variant }: CollectionFixtureProps) {
  const offscreenRoot = useRef<HTMLDivElement>(null);
  return (
    // Without a provider a collection has no store, so items register into
    // nothing and the fixture would not measure the registration that offscreen
    // items skip, which is most of what a collection item costs.
    <Ariakit.CollectionProvider>
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
    </Ariakit.CollectionProvider>
  );
}

// Mirrors the wrapper the current tree renders around every item, so both
// sides of the version comparison mount the same number of React components
// and the delta reflects the Ariakit version alone.
function LegacyCollectionItem({ item }: { item: string }) {
  return (
    <AriakitLegacy.CollectionItem
      className="item"
      data-item={item}
      role="listitem"
    >
      {item}
    </AriakitLegacy.CollectionItem>
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
          ? items.map((item) => <LegacyCollectionItem key={item} item={item} />)
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
        <CollectionFixture mounted={mounted} variant={variant} />
      )}
    </main>
  );
}
