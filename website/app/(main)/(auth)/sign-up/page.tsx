"use client";
import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation.js";

export default function Page() {
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
