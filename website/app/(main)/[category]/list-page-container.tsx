"use client";

import { PropsWithChildren } from "react";
import { Heading, HeadingLevel } from "@ariakit/react";
import tw from "website/utils/tw.js";

interface Props {
  title?: string;
}

export default function ListPageContainer({
  title,
  children,
}: PropsWithChildren<Props>) {
  if (!title) return children;
  return (
    <HeadingLevel>
      <Heading
        className={tw`
        scroll-mt-[120px] text-4xl font-extrabold
        tracking-[-0.035em] dark:font-bold dark:tracking-[-0.015em]
        sm:text-5xl`}
      >
        {title}
      </Heading>
      {children}
    </HeadingLevel>
  );
}
