"use client";
import { SignUp } from "@clerk/clerk-react";

export default function Page() {
  return <SignUp path="/sign-up" routing="hash" />;
}
