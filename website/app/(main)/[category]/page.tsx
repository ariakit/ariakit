import { groupBy } from "lodash";
import { notFound } from "next/navigation.js";
import pagesConfig from "website/build-pages/config.js";
import index from "website/build-pages/index.js";
import Blog from "website/icons/blog.js";
import Components from "website/icons/components.js";
import Examples from "website/icons/examples.js";
import Guide from "website/icons/guide.js";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";
import ListPageItem from "./list-page-item.js";
import ListPageSection from "./list-page-section.js";
import ListPage from "./list-page.js";

interface Props {
  params: { category: string };
}

const meta = {
  guide: {
    title: "Guide",
    size: "md",
    icon: <Guide className="h-7 w-7 fill-blue-700 dark:fill-blue-500" />,
  },
  blog: {
    title: "Blog",
    size: "lg",
    icon: <Blog className="h-7 w-7 fill-blue-700 dark:fill-blue-500" />,
  },
  components: {
    title: "Components",
    size: "lg",
    icon: <Components size="lg" />,
  },
  examples: {
    title: "Examples",
    size: "md",
    icon: <Examples />,
  },
} as const;

export function generateMetadata({ params }: Props) {
  const { category } = params;
  if (!(category in meta)) return notFound();
  const key = category as keyof typeof meta;
  const { title } = meta[key];
  return getNextPageMetadata({ title: `${title} - Ariakit` });
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

  const { title, size, icon } = meta[key];

  const groups = groupBy(pages, "group");
  const grouplessPages = groups.null || [];
  delete groups.null;

  return (
    <ListPage title={title}>
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
