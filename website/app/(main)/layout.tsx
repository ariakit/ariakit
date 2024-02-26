import type { PropsWithChildren, ReactNode } from "react";
import { AuthProvider } from "components/auth.jsx";
import { Footer } from "components/footer.js";
import { Header } from "components/header.js";
import { NewsletterSection } from "components/newsletter-section.jsx";
import { QueryProvider } from "components/query-provider.jsx";
import { RootPathnameProvider } from "components/root-pathname.jsx";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout(props: PropsWithChildren<{ modal: ReactNode }>) {
  return (
    <AuthProvider>
      <QueryProvider>
        <RootPathnameProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div>{props.children}</div>
            <NewsletterSection />
            <Footer />
          </div>
          {props.modal}
        </RootPathnameProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
