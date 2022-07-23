import "../styles/globals.css";
import { cx } from "ariakit-utils/misc";
import { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import Header from "../components/header";
import SEO from "../components/seo";

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
    <>
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
      <div>
        <Header />
        <div className="flex flex-col items-center">
          <div
            className={cx(
              "mx-3 sm:mx-4 p-4 px-8 max-w-[1366px]",
              "rounded-lg",
              "bg-warn-1 dark:bg-warn-1-dark"
            )}
          >
            The Ariakit docs are still under construction. You can{" "}
            <a
              href="https://newsletter.ariakit.org"
              className="rounded-lg text-link dark:text-link-dark underline hover:decoration-[3px] [text-decoration-skip-ink:none]"
            >
              subscribe to our newsletter
            </a>{" "}
            to get major updates.
          </div>
        </div>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
