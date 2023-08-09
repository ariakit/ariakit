import { UpdateLink } from "components/update-link.jsx";
import { twJoin } from "tailwind-merge";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getUpdates } from "utils/get-updates.js";
import { PageContainer } from "../page-container.jsx";
import { SeeNow } from "./see-now.jsx";

export function generateMetadata() {
  return getNextPageMetadata({ title: `Updates - Ariakit` });
}

export default function Page() {
  const updates = getUpdates();
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
                  <UpdateLink {...item} connected={index !== 0} />
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
