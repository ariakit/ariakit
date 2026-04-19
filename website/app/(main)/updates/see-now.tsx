"use client";

import { useEffect } from "react";
import { useUpdates } from "@/lib/use-updates.ts";
import type { UpdateItem } from "@/updates.ts";

export interface SeeNowProps {
  updates?: UpdateItem[];
}

export function SeeNow({ updates }: SeeNowProps) {
  const { seeNow } = useUpdates({ updates });
  useEffect(seeNow, [seeNow]);
  return null;
}
