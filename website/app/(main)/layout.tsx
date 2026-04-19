import type { PropsWithChildren, ReactNode } from "react";
import { AuthProvider } from "@/components/auth.tsx";
import { Footer } from "@/components/footer.tsx";
import { Header } from "@/components/header.tsx";
import { NewsletterSection } from "@/components/newsletter-section.tsx";
import { RootPathnameProvider } from "@/components/root-pathname.tsx";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout(props: PropsWithChildren<{ modal: ReactNode }>) {
  return (
    <AuthProvider>
      <RootPathnameProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div>{props.children}</div>
          <NewsletterSection />
          <Footer />
        </div>
        {props.modal}
      </RootPathnameProvider>
    </AuthProvider>
  );
}
