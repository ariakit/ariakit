import "../styles/globals.scss";
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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
