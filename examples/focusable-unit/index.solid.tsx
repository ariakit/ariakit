import { As, Button, Focusable } from "@ariakit/solid";

export default function Example() {
  return (
    <>
      <div id="inherited">
        <Focusable
          accessibleWhenDisabled
          render={<As component={Button} disabled />}
        >
          Inherited
        </Focusable>
      </div>

      <div id="plain">
        <Button disabled>Plain</Button>
      </div>
    </>
  );
}
