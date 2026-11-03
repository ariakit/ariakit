import type { ReactNode } from "react";
import { MailTabs } from "./tabs.tsx";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main>
      <MailTabs>{children}</MailTabs>
    </main>
  );
}
