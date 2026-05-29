"use client";
import { RedirectToSignIn, SignedOut, UserProfile } from "@clerk/clerk-react";
import { usePathname } from "next/navigation.js";

export default function Page() {
  const pathname = usePathname();
  return (
    <>
      <SignedOut>
        <RedirectToSignIn afterSignInUrl={pathname} afterSignUpUrl={pathname} />
      </SignedOut>
      <UserProfile routing="hash" />
    </>
  );
}
