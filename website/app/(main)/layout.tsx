import type { PropsWithChildren, ReactNode } from "react";
import { AuthProvider } from "components/auth.jsx";
import { Footer } from "components/footer.js";
import { Header } from "components/header.js";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout({
  modal,
  children,
}: PropsWithChildren<{ modal: ReactNode }>) {
  return (
    <AuthProvider>
      {modal}
      <div className="flex min-h-screen flex-col">
        <Header />
        <div>{children}</div>
        <div className="mt-auto flex">
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
}
