"use client";
import { Heading, HeadingLevel } from "@ariakit/react";
import type { ReactNode } from "react";

export interface PageContainerProps {
  title?: string;
  children?: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  if (!title) return children;
  return (
    <HeadingLevel>
      <Heading className="scroll-mt-[120px] text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl md:text-5xl dark:font-bold dark:tracking-[-0.015em]">
        {title}
      </Heading>
      {children}
    </HeadingLevel>
  );
}
