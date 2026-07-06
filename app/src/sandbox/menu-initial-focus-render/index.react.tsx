import * as Ariakit from "@ariakit/react";
import { useMenu } from "@ariakit/react-components/menu/menu";
import { useRef } from "react";

interface MenuProps {
  store: Ariakit.MenuStore;
}

function InstrumentedMenu({ store }: MenuProps) {
  const renderCount = useRef(0);
  // oxlint-disable-next-line react/react-compiler -- Render counter sandbox.
  renderCount.current += 1;

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
      {/* oxlint-disable-next-line react/react-compiler -- Render counter sandbox. */}
      <output aria-label="Menu renders">{renderCount.current}</output>
    </>
  );
}

function RenderedItemsRenders({ store }: MenuProps) {
  const renderCount = useRef(0);
  Ariakit.useStoreState(store, "renderedItems");
  // oxlint-disable-next-line react/react-compiler -- Render counter sandbox.
  renderCount.current += 1;
  return (
    // oxlint-disable-next-line react/react-compiler -- Render counter sandbox.
    <output aria-label="Rendered items renders">{renderCount.current}</output>
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
