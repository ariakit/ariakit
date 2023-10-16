"use client";
import { useState } from "react";
import { Button, Dialog } from "@ariakit/react";
import { SignIn, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { AriakitPlus } from "icons/ariakit-plus.jsx";
import Link from "next/link.js";
import { Command } from "./command.jsx";

export function HeaderAriakitPlus() {
  const { isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  if (!isLoaded) return null;
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="text-sm max-sm:w-10 max-sm:p-0"
        aria-label="Unlock Ariakit Plus"
        render={<Command variant="plus" flat render={<Link href="/plus" />} />}
      >
        <AriakitPlus className="-translate-y-px" />
        <span className="hidden sm:inline">
          Unlock <span className="font-bold">Ariakit Plus</span>
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
        {/* <SignOutButton /> */}
        {/* <UserButton afterSignOutUrl={globalThis.location?.href} /> */}
      </SignedIn>
    </>
  );
}
