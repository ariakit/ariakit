"use client";

import { createContext, forwardRef, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";

const PageMarkdownSectionContext = createContext("");

export interface PageMarkdownSectionProviderProps {
  section: string;
  children: React.ReactNode;
}

export function PageMarkdownSectionProvider({
  section,
  children,
}: PageMarkdownSectionProviderProps) {
  return (
    <PageMarkdownSectionContext.Provider value={section}>
      {children}
    </PageMarkdownSectionContext.Provider>
  );
}

export interface PageMarkdownSectionProps
  extends ComponentPropsWithoutRef<"div"> {}

export const PageMarkdownSection = forwardRef<
  HTMLDivElement,
  PageMarkdownSectionProps
>(function PageMarkdownSection(props, ref) {
  const section = useContext(PageMarkdownSectionContext);
  if (section && section !== props.id) return null;
  return <div ref={ref} {...props} />;
});
