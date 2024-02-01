"use client";
import { Suspense } from "react";
import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation.js";

function ClientPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  return <SignIn routing="hash" redirectUrl={redirectUrl} />;
}

export default function Page() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
