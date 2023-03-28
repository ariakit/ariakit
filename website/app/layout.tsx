import "./style.css";

import { PropsWithChildren } from "react";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";

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

// @ts-expect-error
const inter = localFont({
  src: [
    {
      path: "../assets/Inter-roman.var.woff2",
      style: "normal",
      weight: "100 900",
    },
  ],
});

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
