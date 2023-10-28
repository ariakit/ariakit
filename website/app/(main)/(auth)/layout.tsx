import type { PropsWithChildren } from "react";
import { AuthEnabled } from "components/auth.jsx";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-[70vh] place-items-center pt-10 md:pt-20">
      <AuthEnabled>{children}</AuthEnabled>
    </div>
  );
}
