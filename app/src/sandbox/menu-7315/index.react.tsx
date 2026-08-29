import * as Ariakit from "@ariakit/react";

export default function Example() {
  const menu = Ariakit.useMenuStore();
  const disclosureElement = Ariakit.useStoreState(menu, "disclosureElement");

  return (
    <>
      <Ariakit.MenuButton
        id="initial-disclosure"
        store={menu}
        className="ak-button"
      >
        Initial disclosure
      </Ariakit.MenuButton>
      <button
        type="button"
        className="ak-button"
        onClick={(event) => menu.setDisclosureElement(event.currentTarget)}
      >
        Replacement disclosure
      </button>
      <Ariakit.Menu
        store={menu}
        hideOnInteractOutside={false}
        className="ak-menu"
      >
        <Ariakit.MenuItem className="ak-menu-item">Edit</Ariakit.MenuItem>
      </Ariakit.Menu>
      <output aria-label="Current disclosure">
        {disclosureElement?.textContent}
      </output>
    </>
  );
}
