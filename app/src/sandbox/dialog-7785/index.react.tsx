import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const popupStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 8,
  position: "fixed",
  top: 64,
} as const;

const editorStyle = { ...popupStyle, left: 24 };

// The payment dialog has a backdrop and stays above it, next to the editor.
const paymentStyle = { ...popupStyle, left: 240 };

// An order editor that opens a payment dialog. The editor is a form while the
// order is unpaid and a plain element after that, so React replaces the editor
// element and the "Payment" button in it when the payment dialog marks the
// order as paid. The payment dialog is not a child of the editor, so React
// doesn't mount it again at that time.
export default function Example() {
  const editor = Ariakit.useDialogStore();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paid, setPaid] = useState(false);

  return (
    <>
      <Ariakit.DialogDisclosure store={editor}>
        Edit order
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        store={editor}
        modal={false}
        hideOnInteractOutside={false}
        render={paid ? <div /> : <form />}
        style={editorStyle}
      >
        <Ariakit.DialogHeading>Order</Ariakit.DialogHeading>
        <p>{paid ? "Status: paid" : "Status: unpaid"}</p>
        <Ariakit.Button onClick={() => setPaymentOpen(true)}>
          Payment
        </Ariakit.Button>
      </Ariakit.Dialog>
      <Ariakit.Dialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        style={paymentStyle}
      >
        <Ariakit.DialogHeading>Payment</Ariakit.DialogHeading>
        <Ariakit.Button onClick={() => setPaid(true)}>
          Mark as paid
        </Ariakit.Button>
      </Ariakit.Dialog>
    </>
  );
}
