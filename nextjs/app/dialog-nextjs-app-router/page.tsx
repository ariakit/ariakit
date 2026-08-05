"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const href = "/dialog-nextjs-app-router/login";

export default function Page() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = pathname;
    if (previous !== href) return;
    if (pathname !== "/dialog-nextjs-app-router") return;
    linkRef.current?.focus();
  }, [pathname]);

  return (
    <Link ref={linkRef} href={href}>
      Login
    </Link>
  );
}
