import pagesConfig from "build-pages/config.js";
import index from "build-pages/index.js";
import { Blog } from "icons/blog.js";
import { Components } from "icons/components.js";
import { Examples } from "icons/examples.js";
import { Guide } from "icons/guide.js";
import { groupBy } from "lodash";
import { notFound } from "next/navigation.js";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { ListPageItem } from "./list-page-item.js";
import { ListPageSection } from "./list-page-section.js";
import { ListPage } from "./list-page.js";

interface Props {
  params: { category: string };
}

const meta = {
  guide: {
    size: "md",
    icon: <Guide className="h-7 w-7 fill-blue-700 dark:fill-blue-500" />,
  },
  blog: {
    size: "lg",
    icon: <Blog className="h-7 w-7 fill-blue-700 dark:fill-blue-500" />,
  },
  components: {
    size: "lg",
    icon: <Components size="lg" />,
  },
  examples: {
    size: "md",
    icon: <Examples />,
  },
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
  const pages = index[key];
  if (!pages?.length) return notFound();
  const page = pagesConfig.pages.find((page) => page.slug === category);
  if (!page) return notFound();

  const { size, icon } = meta[key];

  const groups = groupBy(pages, "group");
  const grouplessPages = groups.null || [];
  delete groups.null;

  return (
    <ListPage title={page.title}>
      {!!grouplessPages.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {grouplessPages.map((page) => (
            <ListPageItem
              key={page.slug}
              href={`/${category}/${page.slug}`}
              title={page.title}
              description={page.content}
              size={size}
              thumbnail={icon}
            />
          ))}
        </div>
      )}
      {Object.entries(groups).map(([group, pages]) => (
        <ListPageSection key={group} title={group}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pages?.map((page) => (
              <ListPageItem
                key={page.slug}
                href={`/${category}/${page.slug}`}
                title={page.title}
                description={page.content}
                size={size}
                thumbnail={icon}
              />
            ))}
          </div>
        </ListPageSection>
      ))}
    </ListPage>
  );
}
