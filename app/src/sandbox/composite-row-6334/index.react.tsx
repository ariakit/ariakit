import * as Ariakit from "@ariakit/react";

// A partially rendered (windowed) two-column grid: only the rows showing
// cells 21-24 out of a 100-cell collection are mounted, and
// aria-posinset/aria-setsize expose each cell's position within the full set.
// See https://github.com/ariakit/ariakit/issues/6334
export default function Example() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="grid" aria-label="Inbox" aria-rowcount={50}>
        {/* TODO: Row-level aria-posinset crashes the tree, so each cell's
        position is computed in userland and passed as aria-posinset directly
        to every CompositeItem. Restore the row-level prop once
        https://github.com/ariakit/ariakit/issues/6334 is fixed. */}
        <Ariakit.CompositeRow role="row" aria-setsize={100}>
          <Ariakit.CompositeItem role="gridcell" aria-posinset={21}>
            Cell 21
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem role="gridcell" aria-posinset={22}>
            Cell 22
          </Ariakit.CompositeItem>
        </Ariakit.CompositeRow>
        <Ariakit.CompositeRow role="row" aria-setsize={100}>
          <Ariakit.CompositeItem role="gridcell" aria-posinset={23}>
            Cell 23
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem role="gridcell" aria-posinset={24}>
            Cell 24
          </Ariakit.CompositeItem>
        </Ariakit.CompositeRow>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}
