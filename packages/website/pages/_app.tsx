import "../styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";

const script = `
function classList(action) {
  document.documentElement.classList[action]("dark");
}
classList(localStorage.theme === "dark" ? "add" : "remove");
if (!("theme" in localStorage)) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  classList(query.matches ? "add" : "remove");
  query.addEventListener("change", (event) => {
    classList(event.matches ? "add" : "remove");
  })
}`;

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
        <script dangerouslySetInnerHTML={{ __html: script }} />
        {process.env.NODE_ENV !== "production" && (
          <script
            dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
          />
        )}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
