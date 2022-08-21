import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import Header from "../components/header";
import SEO from "../components/seo";

const queryClient = new QueryClient();

// https://github.com/vercel/next.js/discussions/13387#discussioncomment-101564
const noOverlayWorkaroundScript = `
  window.addEventListener('error', event => {
    event.stopImmediatePropagation()
  })
  window.addEventListener('unhandledrejection', event => {
    event.stopImmediatePropagation()
  })
`;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-16x16.png"
          sizes="16x16"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/icon-dark.svg"
          media="(prefers-color-scheme: dark)"
        />
      </Head>
      <SEO />
      {process.env.NODE_ENV !== "production" && (
        <Script
          id="no-overlay-workaround"
          dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
        />
      )}
      <div className="flex flex-col min-h-screen">
        <Header />
        <Component {...pageProps} />
        <div className="flex mt-auto">
          <footer className="flex justify-center w-full mt-32 bg-canvas-1 dark:bg-canvas-1-dark">
            <div className="flex items-center gap-4 p-3 sm:p-4 w-full max-w-[1440px]">
              <div>
                Site licensed under{" "}
                <a
                  rel="license noreferrer"
                  target="_blank"
                  href="http://creativecommons.org/licenses/by/4.0/"
                >
                  CC 4.0
                </a>
                . Library and examples licensed under{" "}
                <a
                  rel="license noreferrer"
                  target="_blank"
                  href="https://opensource.org/licenses/MIT"
                >
                  MIT
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default MyApp;
