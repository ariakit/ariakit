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

function CompositeFixture({ mounted }: { mounted: boolean }) {
  return (
    <Ariakit.CompositeProvider orientation="vertical">
      <Ariakit.Composite
        aria-label="Composite items"
        className="scroller"
        role="toolbar"
      >
        {mounted
          ? items.map((item) => (
              <Ariakit.CompositeItem
                key={item}
                className="item"
                data-item={item}
                id={`item-${item.slice(5)}`}
                value={item}
              >
                {item}
              </Ariakit.CompositeItem>
            ))
          : null}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
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
          ? items.map((item) => (
              <AriakitLegacy.CompositeItem
                key={item}
                className="item"
                data-item={item}
                id={`item-${item.slice(5)}`}
                value={item}
              >
                {item}
              </AriakitLegacy.CompositeItem>
            ))
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
        <CompositeFixture mounted={mounted} />
      )}
    </main>
  );
}
