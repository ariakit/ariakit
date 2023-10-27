"use client";
import { SignUp } from "@clerk/clerk-react";

export interface SignUpClientProps {
  emailAddress?: string;
}

export default function SignUpClient({ emailAddress }: SignUpClientProps) {
  return (
    <SignUp
      routing="hash"
      initialValues={{ emailAddress }}
      appearance={{ layout: { showOptionalFields: false } }}
    />
  );
}
