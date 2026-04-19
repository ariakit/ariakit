"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation.js";
import { Suspense, useEffect, useRef } from "react";

function ClientDefault() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const checkoutRef = useRef("");

  useEffect(() => {
    if (checkoutRef.current) {
      const checkout = checkoutRef.current;
      checkoutRef.current = "";
      router.push(`/plus?checkout=${checkout}`, { scroll: false });
    }
    const checkout = searchParams.get("checkout");
    if (!checkout) return;
    if (pathname === "/plus") return;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("checkout");
    checkoutRef.current = checkout;
    router.replace(`${pathname}?${nextSearchParams}`, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}

export default function Default() {
  return (
    <Suspense>
      <ClientDefault />
    </Suspense>
  );
}
