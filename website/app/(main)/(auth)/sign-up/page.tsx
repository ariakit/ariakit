"use client";
import { SignUp } from "@clerk/clerk-react";

export default function Page() {
  return (
    <SignUp
      routing="hash"
      appearance={{ layout: { showOptionalFields: false } }}
    />
  );
}
