import * as Ariakit from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
} from "@ariakit/ui/components/dialog.ariakit.react.tsx";
import { AnimatePresence, motion } from "motion/react";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const mounted = Ariakit.useStoreState(dialog, "mounted");
  return (
    <>
      <Button onClick={dialog.show} $kind="bevel">
        Show modal
      </Button>
      <AnimatePresence>
        {mounted && (
          <Dialog
            store={dialog}
            alwaysVisible
            // Motion drives the enter and leave animations, so the cv's own
            // transitions are switched off on the dialog and, through
            // ui-backdrop, on the backdrop element.
            className="flex flex-col items-start gap-4 transition-none ui-backdrop:transition-none"
            backdrop={
              <motion.div
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
            <DialogHeading>Success</DialogHeading>
            <p>
              Your payment has been successfully processed. We have emailed your
              receipt.
            </p>
            <DialogDismiss $kind="bevel">OK</DialogDismiss>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
