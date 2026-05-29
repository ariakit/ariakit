import { groupBy } from "lodash-es";
import { notFound } from "next/navigation.js";
import { twJoin } from "tailwind-merge";
import { PageContainer } from "@/app/(main)/page-container.tsx";
import { PageSection } from "@/app/(main)/page-section.tsx";
import { getPageTitle } from "@/build-pages/get-page-title.js";
import { PageItem } from "@/components/page-item.tsx";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";
import { getPageIcon } from "@/lib/get-page-icon.tsx";
import { getPagesByTag, getTagSlug, getTags, getTagTitle } from "@/lib/tag.ts";

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
                    plus={page.tags.includes("Plus")}
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
