import { Heading, HeadingLevel } from "ariakit/heading";
import groupBy from "lodash/groupBy";
import Examples from "../components/icons/examples";
import Page from "../components/page";
import PageItem from "../components/page-item";
import index from "../pages.index";

const pages = index.examples;
const groups = groupBy(pages, "group");
const items = groups.null || [];
delete groups.null;

export default function ExamplesPage() {
  return (
    <Page
      title="Examples"
      descriptionText="MIT licensed examples using Ariakit components in several real-world use cases. Copy and paste the code or use it as a reference to learn more about Ariakit, accessibility, or to build your components from scratch."
    >
      {!!items.length && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((page) => (
            <PageItem
              key={page.slug}
              href={`/examples/${page.slug}`}
              title={page.title}
              description={page.content}
              thumbnail={
                <Examples className="h-7 w-7 fill-primary-2-foreground dark:fill-primary-2-dark-foreground" />
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
                href={`/examples/${page.slug}`}
                title={page.title}
                description={page.content}
                thumbnail={
                  <Examples className="h-7 w-7 fill-primary-2-foreground dark:fill-primary-2-dark-foreground" />
                }
              />
            ))}
          </div>
        </HeadingLevel>
      ))}
    </Page>
  );
}
