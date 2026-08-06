import * as Ariakit from "@ariakit/react";
import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
} from "@ariakit/ui/ariakit/dialog.react.tsx";
import { dialogBackdrop } from "@ariakit/ui/styles/dialog.ts";
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
            // open/close transitions are turned off.
            $state="none"
            className="flex flex-col items-start gap-4 max-w-100 transition-none"
            backdrop={
              <motion.div
                {...dialogBackdrop.jsx({})}
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
