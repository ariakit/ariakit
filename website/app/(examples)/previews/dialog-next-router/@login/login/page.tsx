"use client";
import * as Ariakit from "@ariakit/react";
import { usePathname, useRouter } from "next/navigation.js";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  const close = () => router.push("/previews/dialog-next-router");

  const dialog = Ariakit.useDialogStore({
    open: true,
    setOpen: (open) => !open && close(),
  });

  return (
    <Ariakit.Dialog
      store={dialog}
      // React portal is not rendered on the server, so we disable it.
      portal={false}
      backdrop={<div className="backdrop" />}
      className="dialog"
      autoFocusOnHide={(element) => {
        if (!element) {
          const selector = `[href="${pathname}"]`;
          const finalFocus = document.querySelector<HTMLElement>(selector);
          finalFocus?.focus();
        }
        return true;
      }}
    >
      <Ariakit.DialogHeading className="heading">Login</Ariakit.DialogHeading>
      <form
        // This is using client actions, which is still an experimental feature
        // on React. You can change it to an onSubmit handler.
        action={close}
        className="form"
      >
        <label>
          Email <input type="email" className="input" />
        </label>
        <label>
          Password <input type="password" className="input" />
        </label>
        <button type="submit" className="button">
          Log in
        </button>
      </form>
    </Ariakit.Dialog>
  );
}
