"use client";
import { RedirectToSignIn, Show, UserProfile } from "@clerk/nextjs";
import { usePathname } from "next/navigation.js";

export default function Page() {
  const pathname = usePathname();
  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn
          signInFallbackRedirectUrl={pathname}
          signUpFallbackRedirectUrl={pathname}
        />
      </Show>
      <UserProfile routing="hash" />
    </>
  );
}
