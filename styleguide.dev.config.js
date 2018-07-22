const omit = require("lodash/omit");
const config = require("./styleguide.config");

module.exports = Object.assign(omit(config, ["styleguideComponents"]), {
  styles: {
    StyleGuide: {
      "@global": {
        "p, h1, h2, h3, h4, *[class*=lang], *[class*=rsg--sidebar], *[class^=Sidebar], *[class^=Overlay], *[name=rsg-code-editor], *[class*=rsg--toolbar]": {
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
});
