import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />
      <Ariakit.ComboboxProvider defaultSelectedValue="Student">
        <Ariakit.ComboboxSelectLabel>Role</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect name="role" />
        <Ariakit.ComboboxPopover sameWidth>
          <Ariakit.ComboboxItem value="Student" />
          <Ariakit.ComboboxItem value="Tutor" />
          <Ariakit.ComboboxItem value="Parent" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </form>
  );
}
