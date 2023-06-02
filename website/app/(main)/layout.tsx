import type { PropsWithChildren } from "react";
import { Footer } from "components/footer.js";
import { Header } from "components/header.js";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import QueryProvider from "./query-provider.js";

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        {children}
        <div className="mt-auto flex">
          <Footer />
        </div>
      </div>
    </QueryProvider>
  );
}
