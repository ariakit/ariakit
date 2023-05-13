import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion } from "framer-motion";
import "./style.css";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const mounted = dialog.useState("mounted");
  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="button">
        Show modal
      </Ariakit.Button>
      <AnimatePresence>
        {mounted && (
          <Ariakit.Dialog
            className="dialog"
            store={dialog}
            hidden={false}
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            backdrop={
              <motion.div
                className="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            }
          >
            <Ariakit.DialogHeading className="heading">
              Success
            </Ariakit.DialogHeading>
            <p className="description">
              Your payment has been successfully processed. We have emailed your
              receipt.
            </p>
            <Ariakit.DialogDismiss className="button">OK</Ariakit.DialogDismiss>
          </Ariakit.Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
