const omit = require("lodash/omit");
const config = require("./styleguide.config");

module.exports = Object.assign(
  omit(config, ["styleguideComponents"]),
  { title: "Dev Styleguide" },
  { serverPort: 6061 },
  {
    styles: {
      StyleGuide: {
        "@global": {
          "p, h1, h3, h4, *[class*=lang], *[class*=rsg--sidebar], *[class^=Sidebar], *[class^=Overlay], *[class^=rsg--pathline], *[class*=rsg--toolbar], main > .rsg--root-8 > .rsg--root-9:nth-of-type(1)": {
            display: "none"
          },
          ".rsg--content-3": {
            "max-width": "100%"
          },
          ".rsg--hasSidebar-2": {
            "padding-left": "initial"
          },
          ".rsg--preview-30": {
            border: "none !important"
          }
        }
      }
    }
  }
);
