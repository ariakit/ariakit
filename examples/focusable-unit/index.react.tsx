import { Button, Focusable } from "@ariakit/react";

export default function Example() {
  return (
    <>
      <div id="inherited">
        <Focusable accessibleWhenDisabled render={<Button disabled />}>
          Inherited
        </Focusable>
      </div>

      <div id="plain">
        <Button disabled>Plain</Button>
      </div>
    </>
  );
}
