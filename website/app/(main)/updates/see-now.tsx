"use client";

import { useEffect } from "react";
import { useUpdates } from "utils/use-updates.js";

export function SeeNow() {
  const { seeNow } = useUpdates();
  useEffect(seeNow, [seeNow]);
  return null;
}
