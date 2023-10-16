"use client";

import { useSelectedLayoutSegments } from "next/navigation.js";
import { Logo } from "./logo.js";

export function HeaderLogo() {
  const isHome = useSelectedLayoutSegments().length === 0;
  return <Logo iconOnly={!isHome} />;
}
