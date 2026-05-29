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
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
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
