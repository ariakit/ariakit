"use client";
import { Suspense } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation.js";

function ClientPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  return (
    <SignUp
      routing="hash"
      redirectUrl={redirectUrl}
      appearance={{ layout: { showOptionalFields: false } }}
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
