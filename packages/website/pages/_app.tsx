import "../styles/globals.css";
import { createStore } from "@ariakit/core/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import Footer from "../components/footer";
import Header from "../components/header";
import SEO from "../components/seo";

createStore({});

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
      <div className="flex min-h-screen flex-col">
        <Header />
        <Component {...pageProps} />
        <div className="mt-auto flex">
          <Footer />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default MyApp;
