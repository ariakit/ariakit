import { Heading, HeadingLevel } from "@ariakit/react/heading";
import groupBy from "lodash/groupBy";
import Guide from "../components/icons/guide";
import Page from "../components/page";
import PageItem from "../components/page-item";
import index from "../pages.index";

const pages = index.guide;
const groups = groupBy(pages, "group");
const items = groups.null || [];
delete groups.null;

export default function GuidePage() {
  return (
    <Page title="Guide">
      {!!items.length && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((page) => (
            <PageItem
              key={page.slug}
              href={`/guide/${page.slug}`}
              title={page.title}
              description={page.content}
              thumbnail={
                <Guide className="h-7 w-7 fill-blue-700 dark:fill-blue-500" />
              }
            />
          ))}
        </div>
      )}
      {Object.entries(groups).map(([group, items]) => (
        <HeadingLevel key={group}>
          <Heading className="mt-6 scroll-mt-24 text-2xl font-semibold tracking-[-0.035em] text-black/70 dark:font-medium dark:tracking-[-0.015em] dark:text-white/60 sm:text-3xl">
            {group}
          </Heading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items?.map((page) => (
              <PageItem
                key={page.slug}
                href={`/guide/${page.slug}`}
                title={page.title}
                description={page.content}
                thumbnail={
                  <Guide className="h-7 w-7 fill-blue-700 dark:fill-blue-500" />
                }
              />
            ))}
          </div>
        </HeadingLevel>
      ))}
    </Page>
  );
}
