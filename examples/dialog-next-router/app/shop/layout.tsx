import "../style.css";
import type { ReactNode } from "react";
import Link from "next/link.js";

interface PageProps {
  modal: ReactNode;
  children: ReactNode;
}

export default function Page({ modal, children }: PageProps) {
  return (
    <div style={{ height: 3000 }}>
      <h1>Cart page</h1>
      {/* @ts-expect-error */}
      <Link href="/">Go back to home</Link>
      {/* @ts-expect-error */}
      <Link href="/shop/tweet">Tweet</Link>
      {children}
      {modal}
    </div>
  );
}
