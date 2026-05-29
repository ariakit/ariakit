import { twJoin } from "tailwind-merge";
import { UpdateLink } from "@/components/update-link.tsx";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";
import { getUpdates } from "@/lib/get-updates.ts";
import { getPagesByTag } from "@/lib/tag.ts";
import { PageContainer } from "../page-container.tsx";
import { SeeNow } from "./see-now.tsx";

export function generateMetadata() {
  return getNextPageMetadata({ title: `Updates - Ariakit` });
}

export default async function Page() {
  const updates = await getUpdates();
  const plusPages = getPagesByTag("Plus").map(
    (page) => `/${page.category}/${page.slug}`,
  );
  return (
    <div className="flex items-start justify-center">
      <SeeNow updates={updates} />
      <main
        className={twJoin(
          "relative mt-8 flex w-full min-w-[1px] flex-col items-center gap-8 px-3 sm:mt-12 sm:px-4 lg:px-8 [&>*]:w-full",
          "max-w-7xl [&>*]:max-w-[1040px]",
        )}
      >
        <PageContainer title="Updates">
          <div className="!max-w-[1066px]">
            <ul className="flex max-w-2xl flex-col">
              {updates.map((item, index) => (
                <li key={index}>
                  <UpdateLink
                    {...item}
                    connected={index !== 0}
                    plus={plusPages.some((page) => item.href.startsWith(page))}
                  />
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
