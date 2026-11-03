import Link from "next/link";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    // Margins outside the main element are part of the page height too.
    <main className="m-8 grid gap-4">
      <nav className="flex gap-4">
        <Link href="/preview-card-size-nextjs">Short route</Link>
        <Link href="/preview-card-size-nextjs/long">Long route</Link>
      </nav>
      {children}
    </main>
  );
}
