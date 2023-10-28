"use client";

import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import { useSelectedLayoutSegments } from "next/navigation.js";

const RootPathnameContext = createContext("/");

export function RootPathnameProvider(props: PropsWithChildren) {
  const segments = useSelectedLayoutSegments();
  return (
    <RootPathnameContext.Provider value={`/${segments.join("/")}`}>
      {props.children}
    </RootPathnameContext.Provider>
  );
}

export function useRootPathname() {
  return useContext(RootPathnameContext);
}
