import type { PropsWithChildren } from "react";
import { tw } from "utils/tw.js";
import PostMessage from "./post-message.jsx";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div
      className={tw`
      flex min-h-[100vh] w-full flex-col items-center bg-gray-150
      pt-[min(30vh,400px)] dark:bg-gray-850`}
    >
      {children}
      <PostMessage />
    </div>
  );
}
