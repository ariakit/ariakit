import { heading } from "@ariakit/ui/styles/heading";
import { link } from "@ariakit/ui/styles/link";
import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { PostTabs } from "./tabs.tsx";

export default function Layout(props: { tabs: ReactNode }) {
  return (
    <main className="mx-auto grid w-full max-w-xl gap-6 px-4 py-10">
      <header>
        <h1 {...heading.jsx({ $level: 2 })}>Posts</h1>
        <p className="ak-ink-70">
          Check out the{" "}
          <Link href="/tab-nextjs" {...link.jsx()}>
            trending posts
          </Link>{" "}
          or stay up to date with the{" "}
          <Link href="/tab-nextjs/new" {...link.jsx()}>
            latest posts
          </Link>
          .
        </p>
      </header>
      {/* The tab store generates a random id, which Cache Components rejects
          during prerender outside a Suspense boundary. */}
      <Suspense fallback={null}>
        <PostTabs>{props.tabs}</PostTabs>
      </Suspense>
    </main>
  );
}
