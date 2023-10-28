import type { PropsWithChildren } from "react";
import { AuthEnabled } from "components/auth.jsx";

export default function Layout({ children }: PropsWithChildren) {
  return <AuthEnabled>{children}</AuthEnabled>;
}
