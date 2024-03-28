"use client";

import { useSelectedLayoutSegments } from "next/navigation.js";
import { Logo } from "./logo.tsx";

export function HeaderLogo() {
  const isHome = useSelectedLayoutSegments().length === 0;
  return <Logo iconOnly={!isHome} responsive />;
}
