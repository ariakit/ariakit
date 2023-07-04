import pagesConfig from "build-pages/config.js";
import index from "build-pages/index.js";
import { PageItem } from "components/page-item.jsx";
import { groupBy } from "lodash";
import { notFound } from "next/navigation.js";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getPageIcon } from "utils/get-page-icon.js";
import { ListPageSection } from "./list-page-section.js";
import { ListPage } from "./list-page.js";

interface Props {
  params: { category: string };
}

const meta = {
  guide: { size: "md" },
  blog: { size: "lg" },
  components: { size: "lg" },
  examples: { size: "md" },
  reference: { size: "md" },
} as const;

export function generateMetadata({ params }: Props) {
  const { category } = params;
  const page = pagesConfig.pages.find((page) => page.slug === category);
  if (!page) return notFound();
  return getNextPageMetadata({ title: `${page.title} - Ariakit` });
}

export function generateStaticParams() {
  return pagesConfig.pages.map((page) => ({ category: page.slug }));
}

export default function Page({ params }: Props) {
  const { category } = params;
  if (!(category in index)) return notFound();
  const key = category as keyof typeof meta;
  const pages = index[key]?.filter((page) => !page.unlisted);
  if (!pages?.length) return notFound();
  const page = pagesConfig.pages.find((page) => page.slug === category);
  if (!page) return notFound();

  const { size } = meta[key];

  const groups = groupBy(pages, "group");
  const grouplessPages = groups.null || [];
  delete groups.null;

  return (
    <ListPage title={page.title}>
      {!!grouplessPages.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {grouplessPages.map((page) => (
            <PageItem
              key={page.slug}
              href={`/${category}/${page.slug}`}
              title={page.title}
              description={page.content}
              size={size}
              thumbnail={getPageIcon(page.category, page.slug) || <span />}
            />
          ))}
        </div>
      )}
      {Object.entries(groups).map(([group, pages]) => (
        <ListPageSection key={group} title={group}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pages?.map((page) => (
              <PageItem
                key={page.slug}
                href={`/${category}/${page.slug}`}
                title={page.title}
                description={page.content}
                size={size}
                thumbnail={getPageIcon(page.category, page.slug) || <span />}
              />
            ))}
          </div>
        </ListPageSection>
      ))}
    </ListPage>
  );
}
