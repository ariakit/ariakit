"use client";

import { usePathname } from "next/navigation";
import Logo from "./logo";

export default function HeaderLogo() {
  const isHome = usePathname() === "/";
  return <Logo iconOnly={!isHome} />;
}
