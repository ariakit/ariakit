import groupBy from "lodash/groupBy";
import index from "../../../pages.index";
import Components from "../../icons/components";
import ListPage from "../list-page";
import ListPageItem from "../list-page-item";
import ListPageSection from "../list-page-section";

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
