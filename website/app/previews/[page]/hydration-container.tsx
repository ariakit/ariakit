"use client";

import { type ComponentProps, useEffect, useState } from "react";

export function HydrationContainer(props: ComponentProps<"div">) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <div data-hydrated={isHydrated || undefined} {...props} />;
}
