"use client";
import type { PropsWithChildren } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { useSubscription } from "utils/use-subscription.js";

const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }: PropsWithChildren) {
  if (!key) return children;
  return (
    <ClerkProvider
      publishableKey={key}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#007acc",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export function AuthEnabled({ children }: PropsWithChildren) {
  if (!key) return null;
  return children;
}

export function AuthDisabled({ children }: PropsWithChildren) {
  if (key) return null;
  return children;
}

export function AuthLoading({ children }: PropsWithChildren) {
  const sub = useSubscription();
  if (sub.isLoaded && !sub.isLoading) return null;
  return children;
}

export function Subscribed({ children }: PropsWithChildren) {
  const sub = useSubscription();
  if (!sub.data) return null;
  return children;
}

export function NotSubscribed({ children }: PropsWithChildren) {
  const sub = useSubscription();
  if (!sub.isLoaded) return null;
  if (sub.isLoading) return null;
  if (sub.data) return null;
  return children;
}
