"use client";
import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";
import { useSubscription } from "@/lib/use-subscription.ts";

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
        layout: { logoPlacement: "none" },
        variables: {
          colorPrimary: "#007acc",
          colorBackground: "hsl(204 20% 99%)",
        },
        elements: {
          card: {
            boxShadow: "none",
          },
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
  if (!key) return null;
  const sub = useSubscription();
  if (sub.isLoaded && !sub.isLoading) return null;
  return children;
}

export function AuthLoaded({ children }: PropsWithChildren) {
  if (!key) return null;
  const sub = useSubscription();
  if (!sub.isLoaded) return null;
  if (sub.isLoading) return null;
  return children;
}

export function Subscribed({ children }: PropsWithChildren) {
  if (!key) return null;
  const sub = useSubscription();
  if (!sub.data) return null;
  return children;
}

export function NotSubscribed({ children }: PropsWithChildren) {
  if (!key) return children;
  const sub = useSubscription();
  if (!sub.isLoaded) return null;
  if (sub.isLoading) return null;
  if (sub.data) return null;
  return children;
}
