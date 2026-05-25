"use client";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation.js";
import { Suspense } from "react";

function ClientPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  return (
    <SignIn
      routing="hash"
      forceRedirectUrl={redirectUrl}
      signUpForceRedirectUrl={redirectUrl}
    />
  );
}

export default function Page() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
