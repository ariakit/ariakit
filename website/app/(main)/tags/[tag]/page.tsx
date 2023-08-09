import { PageContainer } from "app/(main)/page-container.jsx";
import { PageSection } from "app/(main)/page-section.jsx";
import { getPageTitle } from "build-pages/get-page-title.js";
import { PageItem } from "components/page-item.jsx";
import { groupBy } from "lodash-es";
import { notFound } from "next/navigation.js";
import { twJoin } from "tailwind-merge";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { getPagesByTag, getTagSlug, getTagTitle, getTags } from "utils/tag.js";

const tags = getTags();

interface Props {
  params: { tag: string };
}

export function generateMetadata({ params }: Props) {
  const { tag } = params;
  const tagTitle = getTagTitle(tag);
  if (!tagTitle) return notFound();
  return getNextPageMetadata({ title: `All things ${tagTitle} - Ariakit` });
}

export function generateStaticParams() {
  return tags.map((tag) => ({ tag: getTagSlug(tag) }));
}

export default function Page({ params }: Props) {
  const tagTitle = getTagTitle(params.tag);
  if (!tagTitle) return notFound();
  const pages = getPagesByTag(params.tag);
  const pagesByCategory = groupBy(pages, (page) => page.category);
  return (
    <div className="flex items-start justify-center">
      <main
        className={twJoin(
          "relative mt-8 flex w-full min-w-[1px] flex-col items-center gap-8 px-3 sm:mt-12 sm:px-4 lg:px-8 [&>*]:w-full",
          "max-w-7xl [&>*]:max-w-[1040px]",
        )}
      >
        <PageContainer title={`All things ${tagTitle}`}>
          {Object.entries(pagesByCategory).map(([category, pages]) => (
            <PageSection key={category} title={getPageTitle(category)}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pages?.map((page) => (
                  <PageItem
                    key={page.slug}
                    href={`/${category}/${page.slug}`}
                    title={page.title}
                    description={page.content}
                    size="md"
                    thumbnail={
                      getPageIcon(page.category, page.slug) || <span />
                    }
                  />
                ))}
              </div>
            </PageSection>
          ))}
        </PageContainer>
      </main>
    </div>
  );
}
