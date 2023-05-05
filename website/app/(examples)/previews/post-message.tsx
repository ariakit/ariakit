"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation.js";

export default function PostMessage() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.parent) {
      window.parent.postMessage({ type: "pathname", pathname }, "/");
    }
  }, [pathname]);

  return null;
}
