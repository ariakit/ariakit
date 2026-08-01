import * as Ariakit from "@ariakit/react";
import { CompositeItem as OffscreenCompositeItem } from "@ariakit/react-components/composite/composite-item-offscreen";
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

interface CompositeItemProps {
  item: string;
  variant: CurrentItemVariant;
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
  variant: CurrentItemVariant;
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

// Mirrors the wrapper the current tree renders around every item, so both
// sides of the version comparison mount the same number of React components
// and the delta reflects the Ariakit version alone.
function LegacyCompositeItem({ item }: { item: string }) {
  return (
    <AriakitLegacy.CompositeItem
      className="item"
      data-item={item}
      id={`item-${item.slice(5)}`}
      value={item}
    >
      {item}
    </AriakitLegacy.CompositeItem>
  );
}

function LegacyCompositeFixture({ mounted }: { mounted: boolean }) {
  return (
    <AriakitLegacy.CompositeProvider orientation="vertical">
      <AriakitLegacy.Composite
        aria-label="Composite items"
        className="scroller"
        role="toolbar"
      >
        {mounted
          ? items.map((item) => <LegacyCompositeItem key={item} item={item} />)
          : null}
      </AriakitLegacy.Composite>
    </AriakitLegacy.CompositeProvider>
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
      {variant === "legacy" ? (
        <LegacyCompositeFixture mounted={mounted} />
      ) : (
        <CompositeFixture mounted={mounted} variant={variant} />
      )}
    </main>
  );
}
