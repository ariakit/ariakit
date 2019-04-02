const { renderToString } = require("react-dom/server");
const { renderStylesToString } = require("emotion-server");

exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
  const html = renderStylesToString(renderToString(bodyComponent));
  replaceBodyHTMLString(html);
};
