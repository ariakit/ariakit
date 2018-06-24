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
  logger: {
    warn: () => {}
  },
  template: {
    head: {
      raw: '<base href="/">',
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
  styleguideDir: "website/public",
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
          name: "Install",
          content: "docs/install.md",
          sections: [
            {
              name: "Fuck",
              content: "docs/create-react-app.md"
            }
          ]
        },
        {
          name: "Create React App",
          content: "docs/create-react-app.md"
        },
        {
          name: "{as}",
          content: "docs/as.md"
        },
        {
          name: "Styling",
          content: "docs/styling.md"
        },
        {
          name: "State Containers",
          content: "docs/state-containers.md"
        },
        {
          name: "Behaviors",
          content: "docs/behaviors.md"
        }
      ]
    },
    {
      name: "Components",
      components: "src/components/**/*.js"
    }
  ]
};
