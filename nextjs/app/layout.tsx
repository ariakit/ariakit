import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { previewEmbedScript } from "../../app/src/lib/preview-embed.ts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ariakit Next.js examples",
  description: "Accessible Ariakit component examples for Next.js apps.",
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
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
