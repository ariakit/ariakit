"use client";
import { UserProfile } from "@clerk/clerk-react";

export default function Page() {
  return <UserProfile routing="hash" />;
}
