import "../styles/globals.css";

import { PropsWithChildren } from "react";
import localFont from "@next/font/local";
import Footer from "./components/footer";
import Header from "./components/header";
import QueryProvider from "./query-provider";

const darkModeScript = `
function classList(action) {
  document.documentElement.classList[action]("dark");
}
classList(localStorage.theme === "dark" ? "add" : "remove");
if (!("theme" in localStorage)) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  classList(query.matches ? "add" : "remove");
  if ("addEventListener" in query) {
    query.addEventListener("change", (event) => {
      classList(event.matches ? "add" : "remove");
    })
  }
}`;

const inter = localFont({
  src: [
    {
      path: "./assets/Inter-roman.var.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "./assets/Inter-italic.var.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            {/* @ts-expect-error Server Component */}
            <Header />
            {children}
            <div className="mt-auto flex">
              <Footer />
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
