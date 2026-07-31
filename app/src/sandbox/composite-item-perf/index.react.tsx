import * as Ariakit from "@ariakit/react";
import { CompositeItem as OffscreenCompositeItem } from "@ariakit/react-components/composite/composite-item-offscreen";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import "./style.css";

const itemCount = 1000;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
);

interface CompositeItemProps {
  item: string;
  offscreen: boolean;
  offscreenRoot: RefObject<HTMLDivElement | null>;
}

function CompositeItem({ item, offscreen, offscreenRoot }: CompositeItemProps) {
  const props = {
    className: "item",
    "data-item": item,
    id: `item-${item.slice(5)}`,
    value: item,
    children: item,
  } as const;
  if (offscreen) {
    return (
      <OffscreenCompositeItem
        {...props}
        offscreenMode="passive"
        offscreenRoot={offscreenRoot}
      />
    );
  }
  return <Ariakit.CompositeItem {...props} />;
}

interface CompositeFixtureProps {
  mounted: boolean;
  offscreen: boolean;
}

function CompositeFixture({ mounted, offscreen }: CompositeFixtureProps) {
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
                offscreen={offscreen}
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
        {mounted ? "Unmount composite" : "Mount composite"}
      </Ariakit.Button>
      <CompositeFixture mounted={mounted} offscreen={offscreen} />
    </main>
  );
}
