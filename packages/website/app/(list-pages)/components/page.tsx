import groupBy from "lodash/groupBy.js";
import index from "../../../pages.index.js";
import Components from "../../icons/components.jsx";
import ListPageItem from "../list-page-item.jsx";
import ListPageSection from "../list-page-section.jsx";
import ListPage from "../list-page.jsx";

const pages = index.components;
const groups = groupBy(pages, "group");
const items = groups.null || [];
delete groups.null;

export default function Page() {
  return (
    <ListPage title="Components">
      {!!items.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((page) => (
            <ListPageItem
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
        <ListPageSection key={group} title={group}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items?.map((page) => (
              <ListPageItem
                key={page.slug}
                href={`/components/${page.slug}`}
                title={page.title}
                description={page.content}
                size="lg"
                thumbnail={<Components size="lg" />}
              />
            ))}
          </div>
        </ListPageSection>
      ))}
    </ListPage>
  );
}
