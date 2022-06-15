import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

const fontFaces = `
@font-face {
  font-family: Inter;
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
  font-named-instance: 'Regular';
  src: url("/fonts/Inter-roman.var.woff2?v=3.19") format("woff2");
}
@font-face {
  font-family: Inter;
  font-weight: 100 900;
  font-display: swap;
  font-style: italic;
  font-named-instance: 'Italic';
  src: url("/fonts/Inter-italic.var.woff2?v=3.19") format("woff2");
}`;

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

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link
            rel="preload"
            crossOrigin="anonymous"
            href="/fonts/Inter-roman.var.woff2?v=3.19"
            type="font/woff2"
            as="font"
          />
          <style dangerouslySetInnerHTML={{ __html: fontFaces }} />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
