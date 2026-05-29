import * as Ariakit from "@ariakit/react";

const rows = Array.from({ length: 80 }, (_, index) => index);

function RowMenu({ index }: { index: number }) {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Row {index} actions</Ariakit.MenuButton>
      <Ariakit.Menu gutter={4}>
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
