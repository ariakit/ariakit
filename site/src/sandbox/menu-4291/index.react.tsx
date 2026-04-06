import * as Ariakit from "@ariakit/react";

function Menu(props: Ariakit.MenuProps) {
  const store = Ariakit.useMenuContext();
  return (
    <Ariakit.Menu
      modal
      getPersistentElements={() => {
        const disclosureElement = store?.getState().disclosureElement;
        if (!disclosureElement) return [];
        return [disclosureElement];
      }}
      {...props}
    />
  );
}

export default function Example() {
  const store = Ariakit.useMenuStore();

  return (
    <Ariakit.MenuProvider store={store}>
      <Ariakit.MenuButton
        onFocus={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          const isArrowDown = event.key === "ArrowDown";
          const isArrowUp = event.key === "ArrowUp";
          if (!isArrowDown && !isArrowUp) return;
          const { activeId } = store.getState();
          store.move(activeId || (isArrowDown ? store.first() : store.last()));
        }}
      >
        Actions
      </Ariakit.MenuButton>
      <Menu>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
        <Ariakit.MenuSeparator />
        <Ariakit.MenuItem>Report</Ariakit.MenuItem>
      </Menu>
    </Ariakit.MenuProvider>
  );
}
