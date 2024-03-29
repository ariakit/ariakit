"use client";

import { useEffect } from "react";
import type { UpdateItem } from "updates.ts";
import { useUpdates } from "utils/use-updates.ts";

export interface SeeNowProps {
  updates?: UpdateItem[];
}

export function SeeNow({ updates }: SeeNowProps) {
  const { seeNow } = useUpdates({ updates });
  useEffect(seeNow, [seeNow]);
  return null;
}
