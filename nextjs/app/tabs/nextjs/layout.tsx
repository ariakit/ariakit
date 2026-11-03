import type { ReactNode } from "react";
import { MailTabs } from "./tabs.tsx";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    // The preview embed script fits the preview card frame to the content of
    // this element, which centers the tabs in a taller frame.
    <main
      data-preview-content=""
      className="flex min-h-dvh items-center justify-center p-8"
    >
      <MailTabs>{children}</MailTabs>
    </main>
  );
}
