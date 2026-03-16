import type { ReactNode } from "react";
import { twJoin } from "tailwind-merge";
import { PageContainer } from "../page-container.tsx";

interface Props {
  title?: string;
  description?: ReactNode;
  descriptionText?: string;
  sidebar?: ReactNode;
  children?: ReactNode;
}

export function ListPage({
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
        <div className="flex w-60 flex-col gap-4 p-4 md:sticky md:top-24 md:mt-[100px]">
          {sidebar}
        </div>
      )}
      <main
        className={twJoin(
          "relative mt-12 flex w-full min-w-[1px] flex-col items-center gap-8 px-3 *:w-full sm:px-4 md:mt-20 lg:px-8",
          hasSidebar ? "max-w-5xl *:max-w-3xl" : "max-w-7xl *:max-w-[1040px]",
        )}
      >
        {title ? (
          <PageContainer title={title}>
            {description && (
              <p className="-translate-y-4 text-lg tracking-tight text-black/70 dark:text-white/60">
                {description}
              </p>
            )}
            {children}
          </PageContainer>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
