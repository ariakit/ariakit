import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion } from "framer-motion";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const mounted = Ariakit.useStoreState(dialog, "mounted");
  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="ak-button-classic">
        Show modal
      </Ariakit.Button>
      <AnimatePresence>
        {mounted && (
          <Ariakit.Dialog
            store={dialog}
            alwaysVisible
            className="ak-dialog flex flex-col items-start gap-4 max-w-100 transition-none"
            backdrop={
              <motion.div
                className="ak-dialog-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            }
            render={
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              />
            }
          >
            <Ariakit.DialogHeading className="text-xl">
              Success
            </Ariakit.DialogHeading>
            <p>
              Your payment has been successfully processed. We have emailed your
              receipt.
            </p>
            <Ariakit.DialogDismiss className="ak-button-classic">
              OK
            </Ariakit.DialogDismiss>
          </Ariakit.Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
