"use client";

import { usePathname } from "next/navigation.js";
import { Logo } from "./logo.js";

export function HeaderLogo() {
  const isHome = usePathname() === "/";
  return <Logo iconOnly={!isHome} />;
}
