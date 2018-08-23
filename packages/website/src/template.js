const {
  generateCSSReferences,
  generateJSReferences
} = require("mini-html-webpack-plugin");

const description =
  "Toolkit for building composable, accessible and reliable UIs with React.";

module.exports = ({ title, css, js, publicPath }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>${title}</title>
      <link rel="icon" type="image/x-icon" href="/icon.png">
      <base href="/">
      <meta name="description" content="${description}">
      <meta property="og:title" content="ReaKit">
      <meta property="og:description" content="${description}">
      <meta property="og:site_name" content="ReaKit">
      <meta property="og:url" content="https://reakit.io">
      <meta property="og:image" content="https://reakit.io/thumbnail.png">
      <meta property="og:image:type" content="image/png">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:image:src" content="https://reakit.io/thumbnail.png">
      <meta property="twitter:description" content="${description}">
      <meta property="twitter:creator" content="@diegohaz">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,600,700">
      ${generateCSSReferences(css, publicPath)}
      <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-NWWM5K3');</script>
      <!-- End Google Tag Manager -->
    </head>
    <body>
      <div id="rsg-root"></div>
      ${generateJSReferences(js, publicPath)}
    </body>
  </html>`;
