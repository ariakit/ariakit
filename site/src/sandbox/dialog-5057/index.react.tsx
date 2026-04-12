import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="px-2 py-1">
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog
        backdrop={false}
        open={open}
        onClose={() => setOpen(false)}
        render={(props) => (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 transition-[background] duration-150 has-[[data-enter]]:bg-black/30"
            hidden={!open}
          >
            <div
              className="relative z-50 max-w-96 rounded-lg bg-white p-4"
              {...props}
            />
          </div>
        )}
      >
        <Ariakit.DialogHeading className="text-xl font-semibold">
          Success
        </Ariakit.DialogHeading>
        <p>
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <div>
          <Ariakit.DialogDismiss className="px-2 py-1">
            OK
          </Ariakit.DialogDismiss>
        </div>
      </Ariakit.Dialog>
    </>
  );
}
