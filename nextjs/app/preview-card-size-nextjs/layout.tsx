import Link from "next/link";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Margins outside the main element are part of the page height too. */}
      <main className="m-8 grid max-w-xs gap-4">
        <nav className="flex gap-4">
          <Link href="/preview-card-size-nextjs">Short route</Link>
          <Link href="/preview-card-size-nextjs/long">Long route</Link>
        </nav>
        <p>
          This paragraph fits on a few lines in a wide card and wraps onto more
          lines in the narrowest card, so the height of the page follows the
          width of the card. Each route below it adds its own content, which
          changes the height of the page as the routes change.
        </p>
        {children}
      </main>
      {/* Only the margin changes at the breakpoint. Neither the footer nor the
          main element changes size. */}
      <footer className="mx-8 mb-4 w-fit sm:mb-16">Footer</footer>
    </>
  );
}
