"use client";

import { useSelectedLayoutSegments } from "next/navigation.js";
import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";

const RootPathnameContext = createContext("/");

export function RootPathnameProvider(props: PropsWithChildren) {
  const segments = useSelectedLayoutSegments();
  const pathname = `/${segments
    .filter((segment) => !segment.startsWith("("))
    .join("/")}`;
  return (
    <RootPathnameContext.Provider value={pathname}>
      {props.children}
    </RootPathnameContext.Provider>
  );
}

export function useRootPathname() {
  return useContext(RootPathnameContext);
}
