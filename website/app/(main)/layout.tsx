import { PropsWithChildren } from "react";
import Footer from "website/components/footer.js";
import Header from "website/components/header.js";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";
import QueryProvider from "./query-provider.js";

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col">
        {/* @ts-expect-error RSC */}
        <Header />
        {children}
        <div className="mt-auto flex">
          <Footer />
        </div>
      </div>
    </QueryProvider>
  );
}
