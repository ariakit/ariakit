"use client";
import { UserProfile } from "@clerk/clerk-react";

export default function Page() {
  return <UserProfile path="/profile" routing="hash" />;
}
