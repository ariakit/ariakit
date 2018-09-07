const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const importToRequire = require("./src/utils/importToRequire");
const template = require("./src/template");

const webpackCommonConfig = {
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader", options: { cacheDirectory: true } }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        use: "file-loader"
      },
      {
        test: /\.(gif|jpe?g|png|svg|webp)$/,
        use: { loader: "url-loader", options: { limit: 10000 } }
      }
    ]
  },
  resolve: {
    alias: { reakit: path.join(__dirname, "../reakit/src") },
    extensions: [".ts", ".tsx", ".jsx", ".js"]
  }
};

const webpackDevConfig = {
  ...webpackCommonConfig,
  devtool: "cheap-module-source-map",
  devServer: {
    hot: true,
    hotOnly: true,
    historyApiFallback: { index: "/" },
    inline: true,
    clientLogLevel: "error",
    stats: "errors-only"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ]
};

module.exports = {
  title: "ReaKit",
  webpackConfig:
    process.env.NODE_ENV === "development"
      ? webpackDevConfig
      : webpackCommonConfig,
  updateDocs(docs, filePath) {
    const contents = fs.readFileSync(filePath, "utf8");
    const regex = /import ([A-Z][A-Za-z0-9]*) from "\.\.\/[A-Z][^."]*"/gm;
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
  context: {
    defaultTheme: "reakit-theme-default"
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
          name: "As",
          content: "../../docs/as.md"
        },
        {
          name: "Styling",
          content: "../../docs/styling.md"
        },
        {
          name: "Theming",
          content: "../../docs/theming.md"
        },
        {
          name: "State Containers",
          content: "../../docs/state-containers.md"
        }
      ]
    },
    {
      name: "Components",
      components: "../reakit/src/[A-Z]*/*.{js,ts,jsx,tsx}"
    }
  ]
};
