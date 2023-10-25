import type { PropsWithChildren, ReactNode } from "react";
import { AuthProvider } from "components/auth.jsx";
import { Footer } from "components/footer.js";
import { Header } from "components/header.js";
import { RootPathnameProvider } from "components/root-pathname.jsx";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { QueryProvider } from "./query-provider.jsx";

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
            <div className="mt-auto flex">
              <Footer />
            </div>
          </div>
          {props.modal}
        </RootPathnameProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
