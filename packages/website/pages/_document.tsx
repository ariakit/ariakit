import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

const fontWeights = [300, 400, 500, 600, 700];

function getFontUrl(weight: number, style = "normal", format = "woff2") {
  const suffix = style === "normal" ? "" : `-${style}`;
  return `/fonts/inter/inter-${weight}${suffix}.${format}?v=3.19`;
}

function createFontFace(weight: number, style = "normal") {
  return `
@font-face {
  font-family: Inter;
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src:
    url("${getFontUrl(weight, style, "woff2")}") format("woff2"),
    url("${getFontUrl(weight, style, "woff")}") format("woff");
}`;
}

const fontFaces = fontWeights
  .map(
    (weight) => `${createFontFace(weight)}${createFontFace(weight, "italic")}`
  )
  .join("");

const darkModeScript = `
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

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {[400, 500, 700].map((weight) => (
            <link
              key={weight}
              rel="preload"
              href={getFontUrl(weight)}
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          ))}
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
