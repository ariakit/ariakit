import { ReactNode } from "react";
import { cx } from "@ariakit/core/utils/misc";
import SEODescription from "../components/seo-description";
import SEOTitle from "../components/seo-title";
import ListPageContainer from "./list-page-container";

interface Props {
  title?: string;
  description?: ReactNode;
  descriptionText?: string;
  sidebar?: ReactNode;
  children?: ReactNode;
}

export default function ListPage({
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
          // @ts-expect-error
          <ListPageContainer title={title}>
            <SEOTitle value={`${title} - Ariakit`} />
            {descriptionText && <SEODescription value={descriptionText} />}
            {description && (
              <p className="-translate-y-4 text-lg tracking-tight text-black/70 dark:text-white/60">
                {description}
              </p>
            )}
            {children}
          </ListPageContainer>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
