import type { PropsWithChildren } from "react";
import { AuthProvider } from "components/auth.jsx";
import { Footer } from "components/footer.js";
import { Header } from "components/header.js";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { QueryProvider } from "./query-provider.jsx";

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <QueryProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div>{children}</div>
          <div className="mt-auto flex">
            <Footer />
          </div>
        </div>
      </QueryProvider>
    </AuthProvider>
  );
}
