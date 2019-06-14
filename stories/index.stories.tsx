import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Dialog, useDialogState, DialogDisclosure } from "reakit";

storiesOf("Dialog", module).add("Conditionally rendering", () => {
  function Example() {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
        <Dialog {...dialog} aria-label="Welcome">
          {dialogProps =>
            dialog.visible && <div {...dialogProps}>Welcome to Reakit!</div>
          }
        </Dialog>
      </>
    );
  }
  return <Example />;
});
