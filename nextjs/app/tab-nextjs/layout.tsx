import Link from "next/link";
import {
  RouterTab,
  RouterTabPanel,
  RouterTabs,
  TabList,
} from "#app/components/router-tabs.tsx";

export default function Layout(props: LayoutProps<"/tab-nextjs">) {
  return (
    <main className="ak-prose">
      <h1 className="heading">Posts</h1>

      <p>
        Check out the{" "}
        <Link href="/tab-nextjs" className="link">
          trending posts
        </Link>{" "}
        or stay up to date with the{" "}
        <Link href="/tab-nextjs/new" className="link">
          latest posts
        </Link>
      </p>
      <div className="p-10">
        <Link href="/">Hot</Link>
        <RouterTabs>
          <TabList>
            <RouterTab href="/tab-nextjs">Hot</RouterTab>
            <RouterTab href="/tab-nextjs/new">New</RouterTab>
          </TabList>
          <RouterTabPanel>{props.tabs}</RouterTabPanel>
        </RouterTabs>
      </div>
    </main>
  );
}
