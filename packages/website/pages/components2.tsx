import { Heading, HeadingLevel } from "@ariakit/react/heading";
import groupBy from "lodash/groupBy";
import Components from "../components/icons/components";
import Page from "../components/page";
import PageItem from "../components/page-item";
import index from "../pages.index";

const pages = index.components;
const groups = groupBy(pages, "group");
const items = groups.null || [];
delete groups.null;

export default function ComponentsPage() {
  return (
    <Page title="Components">
      {!!items.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((page) => (
            <PageItem
              key={page.slug}
              href={`/components/${page.slug}`}
              title={page.title}
              description={page.content}
              size="lg"
              thumbnail={<Components size="lg" />}
            />
          ))}
        </div>
      )}
      {Object.entries(groups).map(([group, items]) => (
        <HeadingLevel key={group}>
          <Heading className="mt-6 scroll-mt-24 text-2xl font-semibold tracking-[-0.035em] text-black/70 dark:font-medium dark:tracking-[-0.015em] dark:text-white/60 sm:text-3xl">
            {group}
          </Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items?.map((page) => (
              <PageItem
                key={page.slug}
                href={`/components/${page.slug}`}
                title={page.title}
                description={page.content}
                size="lg"
                thumbnail={<Components size="lg" />}
              />
            ))}
          </div>
        </HeadingLevel>
      ))}
    </Page>
  );
}
