import * as Ariakit from "@ariakit/react";

function CallbackTrueMenu() {
  const menu = Ariakit.useMenuStore();

  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.Button onClick={() => menu.toggle()}>
        Toggle Callback True
      </Ariakit.Button>
      <Ariakit.Menu
        autoFocusOnShow={() => true}
        gutter={8}
        aria-label="Callback True"
      >
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
        <Ariakit.MenuSeparator />
        <Ariakit.MenuItem>Report</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

function CallbackSideEffectMenu() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Callback Side Effect</Ariakit.MenuButton>
      <Ariakit.Menu
        autoFocusOnShow={(element) => {
          element?.setAttribute("data-callback-side-effect", "true");
          element?.focus({ preventScroll: true });
          return false;
        }}
        gutter={8}
      >
        <Ariakit.MenuItem>Side Effect Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Side Effect Share</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Boolean</Ariakit.MenuButton>
        <Ariakit.Menu autoFocusOnShow={false} gutter={8}>
          <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
          <Ariakit.MenuItem>Share</Ariakit.MenuItem>
          <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
          <Ariakit.MenuSeparator />
          <Ariakit.MenuItem>Report</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Callback</Ariakit.MenuButton>
        <Ariakit.Menu autoFocusOnShow={() => false} gutter={8}>
          <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
          <Ariakit.MenuItem>Share</Ariakit.MenuItem>
          <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
          <Ariakit.MenuSeparator />
          <Ariakit.MenuItem>Report</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <CallbackTrueMenu />
      <CallbackSideEffectMenu />
    </>
  );
}
