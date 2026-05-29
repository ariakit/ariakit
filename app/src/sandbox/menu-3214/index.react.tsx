import * as Ariakit from "@ariakit/react";

const rows = Array.from({ length: 80 }, (_, index) => index);

function RowMenu({ index }: { index: number }) {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Row {index} actions</Ariakit.MenuButton>
      {/* TODO: Remove unmountOnHide once the library fix for
          https://github.com/ariakit/ariakit/issues/3214 lands. */}
      <Ariakit.Menu gutter={4} unmountOnHide>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
        <Ariakit.MenuItem>Delete</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <div>
      {rows.map((index) => (
        <RowMenu key={index} index={index} />
      ))}
    </div>
  );
}
