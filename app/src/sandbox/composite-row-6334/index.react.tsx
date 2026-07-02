import * as Ariakit from "@ariakit/react";

// A partially rendered (windowed) two-column grid: only the rows showing
// cells 21-24 out of a 100-cell collection are mounted. The row-level
// aria-posinset prop gives each row's starting position and aria-setsize the
// full set size so every cell can compute its own position.
// See https://github.com/ariakit/ariakit/issues/6334
export default function Example() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="grid" aria-label="Inbox" aria-rowcount={50}>
        <Ariakit.CompositeRow role="row" aria-setsize={100} aria-posinset={21}>
          <Ariakit.CompositeItem role="gridcell">Cell 21</Ariakit.CompositeItem>
          <Ariakit.CompositeItem role="gridcell">Cell 22</Ariakit.CompositeItem>
        </Ariakit.CompositeRow>
        <Ariakit.CompositeRow role="row" aria-setsize={100} aria-posinset={23}>
          <Ariakit.CompositeItem role="gridcell">Cell 23</Ariakit.CompositeItem>
          <Ariakit.CompositeItem role="gridcell">Cell 24</Ariakit.CompositeItem>
        </Ariakit.CompositeRow>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}
