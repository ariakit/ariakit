import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        window.alert(data.get("select"));
      }}
    >
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect name="select" required />
        <Ariakit.ComboboxPopover gutter={4} sameWidth unmountOnHide>
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Banana" />
          <Ariakit.ComboboxItem value="Grape" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <Ariakit.Button type="submit">Submit</Ariakit.Button>
    </form>
  );
}
