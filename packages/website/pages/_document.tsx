import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

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
        <Head />
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
