"use client";
import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation.js";

export default function Page() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  return <SignIn routing="hash" redirectUrl={redirectUrl} />;
}
