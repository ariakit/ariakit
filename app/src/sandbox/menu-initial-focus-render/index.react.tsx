import * as Ariakit from "@ariakit/react";
import { useMenu } from "@ariakit/react-components/menu/menu";
import { useRef } from "react";

interface MenuProps {
  store: Ariakit.MenuStore;
}

function InstrumentedMenu({ store }: MenuProps) {
  const renderCount = useRef(0);
  // oxlint-disable-next-line react/refs -- render-count instrumentation
  const currentRenderCount = ++renderCount.current;

  const props = useMenu({
    store,
    hideOnInteractOutside: false,
  });

  return (
    <>
      <Ariakit.Role {...props}>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        <Ariakit.MenuItem>Delete</Ariakit.MenuItem>
      </Ariakit.Role>
      <output aria-label="Menu renders">{currentRenderCount}</output>
    </>
  );
}

function RenderedItemsRenders({ store }: MenuProps) {
  const renderCount = useRef(0);
  Ariakit.useStoreState(store, "renderedItems");
  // oxlint-disable-next-line react/refs -- render-count instrumentation
  const currentRenderCount = ++renderCount.current;
  return (
    <output aria-label="Rendered items renders">{currentRenderCount}</output>
  );
}

export default function Example() {
  const menu = Ariakit.useMenuStore();

  return (
    <div>
      <Ariakit.MenuButton store={menu}>Actions</Ariakit.MenuButton>
      <InstrumentedMenu store={menu} />
      <RenderedItemsRenders store={menu} />
      <Ariakit.Button
        onClick={() => {
          menu.setState("renderedItems", (items) => [...items]);
        }}
      >
        Refresh rendered items
      </Ariakit.Button>
    </div>
  );
}
