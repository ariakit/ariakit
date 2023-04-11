"use client";

import { usePathname } from "next/navigation.js";
import { GlobalNotification } from "./global-notification.js";

export function HeaderGlobalNotification() {
  const isHome = usePathname() === "/";
  if (!isHome) {
    return <GlobalNotification size="sm" />;
  }
  return null;
}
