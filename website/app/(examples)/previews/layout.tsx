import { Suspense } from "react";
import type { PropsWithChildren } from "react";
import PostMessage from "./post-message.tsx";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-[100vh] flex-col items-center bg-gray-150 p-4 dark:bg-gray-850">
      <div className="m-auto xl:mt-[min(20vh,200px)]">{children}</div>
      <Suspense>
        <PostMessage />
      </Suspense>
    </div>
  );
}
