"use client";

import { usePathname } from "next/navigation.js";
import Logo from "./logo.jsx";

export default function HeaderLogo() {
  const isHome = usePathname() === "/";
  return <Logo iconOnly={!isHome} />;
}
