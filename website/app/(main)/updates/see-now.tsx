"use client";

import { useEffect } from "react";
import { useUpdatesContext } from "components/updates-context.jsx";

export function SeeNow() {
  const { seeNow } = useUpdatesContext();
  useEffect(seeNow, [seeNow]);
  return null;
}
