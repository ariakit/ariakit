const path = require("path");
const {
  createConfig,
  babel,
  resolve,
  match,
  url,
  file,
  css,
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
    resolve({ alias: { reas: path.join(__dirname, "src") } })
  ]),
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, ".js");
    return `import { ${name} } from 'reas'`;
  },
  styleguideDir: "website",
  styleguideComponents: {
    StyleGuide: path.join(__dirname, "website/src/components/App.js")
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
