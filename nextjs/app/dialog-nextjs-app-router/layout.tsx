"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

const href = "/dialog-nextjs-app-router/login";

interface LayoutProps {
  login: ReactNode;
}

export default function Layout(props: LayoutProps) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Keep route history in the layout because page and default can remount.
  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = pathname;
    if (previous !== href) return;
    if (pathname !== "/dialog-nextjs-app-router") return;
    linkRef.current?.focus();
  }, [pathname]);

  return (
    <main>
      <Link ref={linkRef} href={href}>
        Login
      </Link>
      {props.login}
    </main>
  );
}
