"use client";

import { usePathname } from "next/navigation";
import GlobalNotification from "./global-notification";

export default function HeaderGlobalNotification() {
  const isHome = usePathname() === "/";
  if (!isHome) {
    return <GlobalNotification size="sm" />;
  }
  return null;
}
