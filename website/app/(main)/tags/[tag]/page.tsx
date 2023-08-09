import { PageContainer } from "app/(main)/page-container.jsx";
import { PageSection } from "app/(main)/page-section.jsx";
import { getPageTitle } from "build-pages/get-page-title.js";
import pageIndex from "build-pages/index.js";
import { PageItem } from "components/page-item.jsx";
import { groupBy, kebabCase } from "lodash-es";
import { notFound } from "next/navigation.js";
import { twJoin } from "tailwind-merge";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getPageIcon } from "utils/get-page-icon.jsx";

const tags: string[] = [];
const pages = Object.values(pageIndex).flat();

for (const page of pages) {
  for (const tag of page.tags) {
    if (tags.some((item) => item.toLowerCase() === tag.toLowerCase())) continue;
    tags.push(tag);
  }
}

function getTagTitle(tag: string) {
  return tags.find((item) => kebabCase(item) === tag);
}

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
  return tags.map((tag) => ({ tag: kebabCase(tag) }));
}

export default function Page({ params }: Props) {
  const tagTitle = getTagTitle(params.tag);
  if (!tagTitle) return notFound();
  const pagesWithTag = pages.filter((page) =>
    page.tags.some((item) => kebabCase(item) === params.tag),
  );
  const pagesByCategory = groupBy(pagesWithTag, (page) => page.category);
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
