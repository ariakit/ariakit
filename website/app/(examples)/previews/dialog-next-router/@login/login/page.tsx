"use client";
import * as Ariakit from "@ariakit/react";
import { usePathname, useRouter } from "next/navigation.js";

export function lol() {
  return "lol";
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  const dialog = Ariakit.useDialogStore({
    open: true,
    setOpen: (open) => !open && router.push("/previews/dialog-next-router"),
  });

  return (
    <Ariakit.Dialog
      store={dialog}
      portal={false}
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
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          dialog.hide();
        }}
      >
        <label>
          Email
          <input type="email" className="input" />
        </label>
        <label>
          Password
          <input type="password" className="input" />
        </label>
        <button type="submit" className="button">
          Log in
        </button>
      </form>
    </Ariakit.Dialog>
  );
}
