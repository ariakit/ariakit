"use client";
import { createContext } from "react";
import type { PropsWithChildren } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { useRouter } from "next/navigation.js";

const AuthContext = createContext(false);

const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  if (!key) return children;
  return (
    <AuthContext.Provider value={true}>
      <ClerkProvider
        publishableKey={key}
        navigate={(to) => router.push(to)}
        afterSignInUrl={globalThis.location?.href}
        afterSignUpUrl={globalThis.location?.href}
      >
        {children}
      </ClerkProvider>
    </AuthContext.Provider>
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
