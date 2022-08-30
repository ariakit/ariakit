import { ReactNode } from "react";
import { cx } from "ariakit-utils/misc";
import { Heading, HeadingLevel } from "ariakit/heading";
import SEO from "../seo";

type Props = {
  title?: string;
  description?: ReactNode;
  descriptionText?: string;
  sidebar?: ReactNode;
  children?: ReactNode;
};

export default function Page({
  title,
  descriptionText,
  description = descriptionText,
  sidebar,
  children,
}: Props) {
  const hasSidebar = sidebar != null;
  return (
    <div className="flex items-start justify-center md:flex-row-reverse">
      {hasSidebar && (
        <div className="flex w-64 flex-col gap-4 p-4 md:sticky md:top-24 md:mt-[100px]">
          {sidebar}
        </div>
      )}
      <div
        className={cx(
          "relative mt-8 flex w-full min-w-[1px] flex-col items-center gap-8 px-3 sm:mt-12 sm:px-4 lg:px-8 [&>*]:w-full",
          hasSidebar ? "max-w-5xl [&>*]:max-w-3xl" : "max-w-7xl [&>*]:max-w-5xl"
        )}
      >
        {title ? (
          <HeadingLevel>
            <SEO title={`${title} - Ariakit`} description={descriptionText} />
            <Heading className="scroll-mt-[120px] text-4xl font-extrabold tracking-[-0.035em] dark:font-bold dark:tracking-[-0.015em] sm:text-5xl">
              {title}
            </Heading>
            {description && (
              <p className="-translate-y-4 text-lg tracking-tight text-black/70 dark:text-white/60">
                {description}
              </p>
            )}
            {children}
          </HeadingLevel>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
