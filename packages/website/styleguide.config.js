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
const importToRequire = require("./src/utils/importToRequire");
const template = require("./src/template");

module.exports = {
  title: "ReaKit",
  webpackConfig: createConfig([
    sourceMaps(),
    match(["*.js", "*.jsx", "*.ts", "*.tsx"], [babel()]),
    css(),
    match(["*.eot", "*.ttf", "*.woff", "*.woff2"], [file()]),
    match(
      ["*.gif", "*.jpg", "*.jpeg", "*.png", "*.svg", "*.webp"],
      [url({ limit: 10000 })]
    ),
    resolve({
      extensions: [".ts", ".tsx", ".jsx", ".js"]
    }),
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
  template,
  assetsDir: "public",
  styleguideDir: "dist",
  styleguideComponents: {
    StyleGuide: path.join(__dirname, "src")
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
          content: "../../docs/get-started.md"
        },
        {
          name: "Principles",
          sections: [
            {
              name: "Composability",
              content: "../../docs/composability.md"
            },
            {
              name: "Accessibility",
              content: "../../docs/accessibility.md"
            },
            {
              name: "Reliability",
              content: "../../docs/reliability.md"
            }
          ]
        },
        {
          name: "Bundle size",
          content: "../../docs/bundle-size.md"
        },
        {
          name: "as",
          content: "../../docs/as.md"
        },
        {
          name: "Styling",
          content: "../../docs/styling.md"
        },
        {
          name: "State Containers",
          content: "../../docs/state-containers.md"
        }
      ]
    },
    {
      name: "Components",
      components: "../reakit/src/components/**/*.js"
    }
  ]
};
