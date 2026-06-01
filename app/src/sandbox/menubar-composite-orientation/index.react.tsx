import * as Ariakit from "@ariakit/react";

function MenubarContents() {
  return <button type="button">Action</button>;
}

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Ariakit.Menubar aria-label="Default menubar">
        <MenubarContents />
      </Ariakit.Menubar>
      <Ariakit.Menubar aria-label="Vertical menubar" orientation="vertical">
        <MenubarContents />
      </Ariakit.Menubar>
      <Ariakit.Menubar aria-label="Both menubar" orientation="both">
        <MenubarContents />
      </Ariakit.Menubar>
      <Ariakit.Menubar
        aria-label="Composite false menubar"
        composite={false}
        orientation="vertical"
      >
        <MenubarContents />
      </Ariakit.Menubar>
    </div>
  );
}
