import type { ReactNode } from "react";
import { MailTabs } from "./tabs.tsx";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-8">
      <MailTabs>{children}</MailTabs>
    </main>
  );
}
