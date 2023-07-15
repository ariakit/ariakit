"use client";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function DateFromNow({ dateTime }: { dateTime: string }) {
  const date = new Date(dateTime);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return date.toLocaleString("en-US", { dateStyle: "long" });
  }

  return formatDistanceToNow(new Date(dateTime), { addSuffix: true });
}
