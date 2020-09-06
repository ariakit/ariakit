require("dotenv").config();

module.exports = (config) => {
  const TEST_FILES = [
    "./scripts/karma-setup.js",
    "packages/reakit/**/__examples__/**/__tests__/**/*.tsx",
  ];

  config.set({
    plugins: ["karma-webpack", "karma-jasmine", "karma-browserstack-launcher"],
    frameworks: ["jasmine"],
    files: TEST_FILES,

    preprocessors: Object.fromEntries(
      TEST_FILES.map((glob) => [glob, ["webpack"]])
    ),

    webpack: {
      mode: "development",
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".css"],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: "babel-loader",
              options: require("./babel.config"),
            },
          },
          {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
          },
        ],
      },
    },

    // global config of your BrowserStack account
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      apiClientEndpoint: "https://api.browserstack.com",
    },

    // define browsers
    customLaunchers: {
      bs_firefox_mac: {
        base: "BrowserStack",
        browser: "firefox",
        browser_version: "21.0",
        os: "OS X",
        os_version: "Mountain Lion",
      },
      bs_iphone5: {
        base: "BrowserStack",
        device: "iPhone 5",
        os: "ios",
        os_version: "6.0",
      },
    },

    browsers: ["bs_firefox_mac", "bs_iphone5"],

    reporters: ["dots", "BrowserStack"],
  });
};
