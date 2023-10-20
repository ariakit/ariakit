"use client";
import { useEffect, useState } from "react";
import { Button, Dialog } from "@ariakit/react";
import {
  SignIn,
  SignOutButton,
  SignedIn,
  SignedOut,
  useSignUp,
} from "@clerk/clerk-react";
import type { CheckoutStatus } from "app/api/checkout-status/route.js";
import { AriakitPlus } from "icons/ariakit-plus.jsx";
import Link from "next/link.js";
import { Command } from "./command.jsx";

export function HeaderAriakitPlus() {
  const [open, setOpen] = useState(false);
  const { isLoaded, signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");

  useEffect(() => {
    const process = async () => {
      const url = new URL(globalThis.location.href);
      const sessionId = url.searchParams.get("session-id");
      if (!sessionId) return;
      const res = await fetch(`/api/checkout-status?session-id=${sessionId}`);
      if (!res.ok) return;
      const status = (await res.json()) as CheckoutStatus;
      if (status.status === "complete") {
        setEmailAddress(status.emailAdress);
      }
    };
    process();
  }, []);

  if (!isLoaded) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="text-sm max-sm:w-10 max-sm:p-0"
        aria-label="Unlock Ariakit Plus"
        render={<Command variant="plus" render={<Link href="/plus" />} />}
      >
        <AriakitPlus className="-translate-y-px" />
        <span className="hidden sm:inline">
          Unlock <span className="font-semibold">Ariakit Plus</span>
        </span>
      </Button>
      <SignedOut>
        <Dialog
          unmountOnHide
          open={open}
          onClose={() => setOpen(false)}
          className="fixed inset-3 z-50 m-auto flex h-fit max-h-[calc(100vh-2*theme(spacing.3))]"
        >
          <SignIn
            afterSignInUrl={globalThis.location?.href}
            afterSignUpUrl={globalThis.location?.href}
          />
        </Dialog>
      </SignedOut>
      <SignedIn>
        <SignOutButton />
        {/* <UserButton afterSignOutUrl={globalThis.location?.href} /> */}
      </SignedIn>
      {/* {emailAddress && <SignUp initialValues={{ emailAddress }} />} */}
    </>
  );
}
