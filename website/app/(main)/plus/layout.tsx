import type { PropsWithChildren } from "react";
import { AuthEnabled } from "@/components/auth.tsx";

export default function Layout({ children }: PropsWithChildren) {
  return <AuthEnabled>{children}</AuthEnabled>;
}
