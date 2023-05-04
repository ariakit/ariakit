"use client";
import { useEffect, useRef } from "react";
import * as Ariakit from "@ariakit/react";
import { usePathname, useRouter } from "next/navigation.js";

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = Ariakit.useDialogStore({
    open: true,
    setOpen: (open) => {
      if (!open) {
        router.back();
      }
    },
  });
  const finalFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(`[href="${pathname}"]`);
    if (!element) return;
    finalFocusRef.current = element;
  }, []);
  return (
    <Ariakit.Dialog
      store={dialog}
      finalFocus={finalFocusRef}
      portal={false}
      className="dialog"
    >
      Cart
    </Ariakit.Dialog>
  );
}
