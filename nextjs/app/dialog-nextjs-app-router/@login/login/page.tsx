"use client";

import * as Ariakit from "@ariakit/react";
import { usePathname, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const close = () => router.push("/dialog-nextjs-app-router");

  return (
    <Ariakit.Dialog
      open
      onClose={close}
      portal={false}
      backdrop={
        <div
          style={{
            background: "rgb(0 0 0 / 0.2)",
            inset: 0,
            position: "fixed",
          }}
        />
      }
      autoFocusOnHide={(element) => {
        if (!element) {
          const selector = `[href="${pathname}"]`;
          document.querySelector<HTMLElement>(selector)?.focus();
        }
        return true;
      }}
      style={{
        inset: "50% auto auto 50%",
        padding: 24,
        position: "fixed",
        translate: "-50% -50%",
      }}
    >
      <Ariakit.DialogHeading>Login</Ariakit.DialogHeading>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <label>
          Email <input type="email" />
        </label>
        <label>
          Password <input type="password" />
        </label>
        <button type="submit">Log in</button>
      </form>
    </Ariakit.Dialog>
  );
}
