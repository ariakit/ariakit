"use client";

import { PropsWithChildren } from "react";
import { Heading, HeadingLevel } from "@ariakit/react/heading";
import tw from "../../utils/tw";

interface Props {
  title: string;
}

export default function ListPageSection({
  title,
  children,
}: PropsWithChildren<Props>) {
  return (
    <HeadingLevel>
      <Heading
        className={tw`
        mt-6 scroll-mt-24 text-2xl font-semibold tracking-[-0.035em]
        text-black/70 dark:font-medium dark:tracking-[-0.015em]
        dark:text-white/60 sm:text-3xl`}
      >
        {title}
      </Heading>
      {children}
    </HeadingLevel>
  );
}
