"use client";
import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation.js";

export default function PostMessage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    if (!window.parent) return;
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    window.parent.postMessage(
      { type: "pathname", pathname: `${pathname}${queryString}` },
      "/",
    );
  }, [pathname, searchParams]);

  return null;
}
