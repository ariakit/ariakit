import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />
      <Ariakit.SelectProvider defaultValue="Student">
        <Ariakit.SelectLabel>Role</Ariakit.SelectLabel>
        <Ariakit.Select name="role" />
        <Ariakit.SelectPopover sameWidth>
          <Ariakit.SelectItem value="Student" />
          <Ariakit.SelectItem value="Tutor" />
          <Ariakit.SelectItem value="Parent" />
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </form>
  );
}
