import { AuthEnabled } from "@/components/auth.tsx";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <AuthEnabled>{children}</AuthEnabled>;
}
