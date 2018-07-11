const path = require("path");
const fs = require("fs");
const {
  createConfig,
  babel,
  resolve,
  match,
  url,
  file,
  css,
  env,
  devServer,
  sourceMaps
} = require("webpack-blocks");
const importToRequire = require("./website/src/utils/importToRequire");

const description =
  "Toolkit for building composable, accessible and reliable UIs with React.";

module.exports = {
  title: "ReaKit",
  webpackConfig: createConfig([
    sourceMaps(),
    babel(),
    css(),
    match(["*.eot", "*.ttf", "*.woff", "*.woff2"], [file()]),
    match(
      ["*.gif", "*.jpg", "*.jpeg", "*.png", "*.svg", "*.webp"],
      [url({ limit: 10000 })]
    ),
    resolve({ alias: { reakit: path.join(__dirname, "src") } }),
    env("development", [
      devServer({
        historyApiFallback: { index: "/" }
      })
    ])
  ]),
  updateDocs(docs, filePath) {
    const contents = fs.readFileSync(filePath, "utf8");
    const regex = /import ([a-z0-9]+) from "\.\.\/[^."]+"/gim;
    const uses = (contents.match(regex) || []).map(x => x.replace(regex, "$1"));
    return {
      ...docs,
      uses
    };
  },
  updateExample(props) {
    return {
      ...props,
      content: importToRequire(props.content)
    };
  },
  logger: {
    warn: () => {}
  },
  template: {
    head: {
      raw: '<base href="/">',
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: "ReaKit" },
        { property: "og:description", content: description },
        { property: "og:site_name", content: "ReaKit" },
        { property: "og:url", content: "https://reakit.io" },
        { property: "og:image", content: "https://reakit.io/thumbnail.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "twitter:card", content: "summary_large_image" },
        {
          property: "twitter:image:src",
          content: "https://reakit.io/thumbnail.png"
        },
        { property: "twitter:description", content: description },
        { property: "twitter:creator", content: "@diegohaz" }
      ],
      links: [
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,600,700"
        }
      ]
    },
    favicon: "/icon.png"
  },
  assetsDir: "website/public",
  styleguideDir: "website/dist",
  styleguideComponents: {
    StyleGuide: path.join(__dirname, "website/src")
  },
  compilerConfig: {
    transforms: {
      dangerousTaggedTemplateString: true
    },
    objectAssign: "Object.assign"
  },
  skipComponentsWithoutExample: true,
  sections: [
    {
      name: "Guide",
      sections: [
        {
          name: "Get Started",
          content: "docs/get-started.md"
        },
        {
          name: "Principles",
          sections: [
            {
              name: "Composability",
              content: "docs/composability.md"
            },
            {
              name: "Accessibility",
              content: "docs/accessibility.md"
            },
            {
              name: "Reliability",
              content: "docs/reliability.md"
            }
          ]
        },
        {
          name: "as",
          content: "docs/as.md"
        },
        {
          name: "Styling",
          content: "docs/styling.md"
        },
        {
          name: "State Containers",
          content: "docs/state-containers.md"
        }
      ]
    },
    {
      name: "Components",
      components: "src/components/**/*.js"
    }
  ]
};
