"use client";
import { SignIn } from "@clerk/clerk-react";

export default function Page() {
  return <SignIn routing="hash" />;
}
