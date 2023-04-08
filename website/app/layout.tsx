import "./style.css";

import type { PropsWithChildren } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";

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

const inter = Inter({ subsets: ["latin"] });

export function generateMetadata() {
  return getNextPageMetadata();
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
