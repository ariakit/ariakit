import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { previewEmbedScript } from "../../app/src/lib/preview-embed.ts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ariakit Next.js previews",
  description: "Accessible Ariakit component previews for Next.js apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The preview embed script sets root attributes before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before hydration, so focus calls on mount already respect an
            inactive preview card. */}
        <script dangerouslySetInnerHTML={{ __html: previewEmbedScript }} />
      </head>
      <body className={inter.variable}>
        {/* Centers the page in the viewport, like the Astro preview page, so
            the examples don't center themselves. The preview embed script fits
            the preview card frame to the content of this element. The padding
            and centering live here because the Ariakit scroll lock sets the
            padding and position of the body. The maximum width of the children
            has no specificity, so an example can set its own. A fullscreen
            preview would need to skip this, but the root layout can't tell
            which preview it renders. In a preview card, the bottom padding
            also leaves room for a horizontal scrollbar. */}
        <div
          data-preview-content=""
          className="flex min-h-dvh flex-col items-center-safe justify-center-safe p-8 pb-[calc(--spacing(8)+var(--preview-scrollbar-height,0px))] [:where(&>*)]:max-w-full"
        >
          {children}
        </div>
      </body>
    </html>
  );
}
