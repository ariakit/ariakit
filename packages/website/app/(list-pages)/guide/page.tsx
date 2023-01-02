import groupBy from "lodash/groupBy";
import index from "../../../pages.index";
import Guide from "../../icons/guide";
import ListPage from "../list-page";
import ListPageItem from "../list-page-item";
import ListPageSection from "../list-page-section";

const pages = index.guide;
const groups = groupBy(pages, "group");
const items = groups.null || [];
delete groups.null;

export default function Page() {
  return (
    <ListPage title="Guide">
      {!!items.length && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((page) => (
            <ListPageItem
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
        <ListPageSection key={group} title={group}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items?.map((page) => (
              <ListPageItem
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
        </ListPageSection>
      ))}
    </ListPage>
  );
}
