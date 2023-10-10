"use client";
import * as Ariakit from "@ariakit/react";
import { usePathname, useRouter } from "next/navigation.js";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  const close = () => router.push("/previews/dialog-next-router");

  return (
    <Ariakit.Dialog
      open
      onClose={close}
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
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <label>
          Email <input type="email" className="input" />
        </label>
        <label>
          Password <input type="password" className="input" />
        </label>
        <button type="submit" className="button primary">
          Log in
        </button>
      </form>
    </Ariakit.Dialog>
  );
}
