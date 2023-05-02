"use client";

import type { PropsWithChildren } from "react";
import { Heading, HeadingLevel } from "@ariakit/react";
import { tw } from "utils/tw.js";

interface Props {
  title?: string;
}

export function ListPageContainer({
  title,
  children,
}: PropsWithChildren<Props>) {
  if (!title) return children;
  return (
    <HeadingLevel>
      <Heading
        className={tw`
        scroll-mt-[120px] text-3xl font-extrabold
        tracking-[-0.035em] dark:font-bold dark:tracking-[-0.015em]
        sm:text-4xl md:text-5xl`}
      >
        {title}
      </Heading>
      {children}
    </HeadingLevel>
  );
}
