"use client";
import { createContext } from "react";

export const PageHeroContext = createContext(false);

export function PageHeroProvider({ children }: { children: React.ReactNode }) {
  return (
    <PageHeroContext.Provider value={true}>{children}</PageHeroContext.Provider>
  );
}
