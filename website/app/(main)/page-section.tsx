"use client";

import type { ReactNode } from "react";
import { Heading, HeadingLevel } from "@ariakit/react/heading";
import { kebabCase } from "lodash-es";

export interface PageSectionProps {
  title: string;
  children?: ReactNode;
}

export function PageSection({ title, children }: PageSectionProps) {
  const slug = kebabCase(title);
  return (
    <HeadingLevel>
      <Heading
        id={slug}
        className="mt-6 scroll-mt-24 text-2xl font-semibold tracking-[-0.035em] text-black/70 dark:font-medium dark:tracking-[-0.015em] dark:text-white/60 sm:text-3xl"
      >
        {title}
      </Heading>
      {children}
    </HeadingLevel>
  );
}
