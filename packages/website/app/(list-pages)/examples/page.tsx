import groupBy from "lodash/groupBy";
import index from "../../../pages.index";
import Examples from "../../icons/examples";
import ListPage from "../list-page";
import ListPageItem from "../list-page-item";
import ListPageSection from "../list-page-section";

const pages = index.examples;
const groups = groupBy(pages, "group");
const items = groups.null || [];
delete groups.null;

export default function Page() {
  return (
    <ListPage
      title="Examples"
      descriptionText="MIT licensed examples using Ariakit components in several real-world use cases. Copy and paste the code or use it as a reference to learn more about Ariakit, accessibility, or to build your components from scratch."
    >
      {!!items.length && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((page) => (
            <ListPageItem
              key={page.slug}
              href={`/examples/${page.slug}`}
              title={page.title}
              description={page.content}
              thumbnail={<Examples />}
            />
          ))}
        </div>
      )}
      {Object.entries(groups).map(([group, items]) => (
        <ListPageSection key={group} title={group}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items?.map((page) => (
              <ListPageItem
                key={page.slug}
                href={`/examples/${page.slug}`}
                title={page.title}
                description={page.content}
                thumbnail={<Examples />}
              />
            ))}
          </div>
        </ListPageSection>
      ))}
    </ListPage>
  );
}
