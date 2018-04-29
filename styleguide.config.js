const path = require("path");
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
  title: "reas - React as Anything",
  webpackConfig: createConfig([
    sourceMaps(),
    babel(),
    css(),
    match(["*.eot", "*.ttf", "*.woff", "*.woff2"], [file()]),
    match(
      ["*.gif", "*.jpg", "*.jpeg", "*.png", "*.svg", "*.webp"],
      [url({ limit: 10000 })]
    ),
    resolve({ alias: { reas: path.join(__dirname, "src") } }),
    env("development", [
      devServer({
        historyApiFallback: { index: "/" }
      })
    ])
  ]),
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, ".js");
    return `import { ${name} } from 'reas'`;
  },
  template: {
    head: {
      raw: '<base href="/">'
    }
  },
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
  pagePerSection: true,
  sections: [
    {
      name: "Guide",
      sections: [
        {
          name: "Install",
          content: "docs/install.md"
        }
      ]
    },
    {
      name: "Components",
      components: "src/components/**/[A-Z]*.js"
    }
  ]
};
