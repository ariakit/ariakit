import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Terms</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Terms</Ariakit.DialogHeading>
          <p>You must accept the terms before continuing.</p>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Receipt</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Receipt</Ariakit.DialogHeading>
          <p>Your payment has been processed.</p>
          <Ariakit.DialogDismiss>Done</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
    </div>
  );
}
