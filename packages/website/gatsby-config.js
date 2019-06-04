module.exports = {
  siteMetadata: {
    title: "Reakit",
    author: "@reakitjs",
    siteUrl: process.env.URL || "https://reakit.io",
    description:
      "Low level component library for building accessible high level UI libraries, design systems and applications with React."
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`
      }
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Reakit",
        short_name: "Reakit",
        start_url: "/",
        background_color: "#5640dd",
        theme_color: "#5640dd",
        display: "minimal-ui",
        icon: "src/images/icon.png" // This path is relative to the root of the site.
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "guide",
        path: `${__dirname}/../../docs`
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "components",
        path: `${__dirname}/../reakit/src`
      }
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "nofollow"
            }
          },
          "gatsby-remark-code-modifiers",
          "gatsby-remark-title",
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              offsetY: 80,
              icon: "<span>#</span>"
            }
          }
        ]
      }
    },
    "gatsby-plugin-typescript",
    "gatsby-plugin-emotion",
    "gatsby-transformer-yaml",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: `${__dirname}/src/data/`
      }
    },
    "gatsby-plugin-meta-redirect",
    "gatsby-plugin-netlify",
    {
      resolve: "gatsby-plugin-google-tagmanager",
      options: {
        id: "GTM-NWWM5K3"
      }
    }
  ]
};
