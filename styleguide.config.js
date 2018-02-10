const path = require('path')
const {
  createConfig,
  babel,
  resolve,
  match,
  url,
  file,
  css,
  sourceMaps,
} = require('webpack-blocks')

module.exports = {
  title: 'reas - React as Anything',
  webpackConfig: createConfig([
    sourceMaps(),
    babel(),
    css(),
    match(['*.eot', '*.ttf', '*.woff', '*.woff2'], [file()]),
    match(
      ['*.gif', '*.jpg', '*.jpeg', '*.png', '*.svg', '*.webp'],
      [url({ limit: 10000 })],
    ),
    resolve({ alias: { reas: path.join(__dirname, 'src') } }),
  ]),
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, '.js')
    return `import { ${name} } from 'reas'`
  },
  styleguideDir: 'docs',
  template: 'docs/template.html',
  styleguideComponents: {
    StyleGuideRenderer: path.join(
      __dirname,
      'docs/components/StyleGuideRenderer.js',
    ),
    ToolbarButton: path.join(__dirname, 'docs/components/ToolbarButton.js'),
    Editor: path.join(__dirname, 'docs/components/Editor.js'),
  },
  skipComponentsWithoutExample: true,
  compilerConfig: {
    transforms: {
      dangerousTaggedTemplateString: true,
    },
    objectAssign: 'Object.assign',
  },
  sections: [
    {
      name: 'Introduction',
      content: 'docs/contents/intro.md',
    },
    {
      name: 'Guide',
      sections: [
        {
          name: 'Installation',
          content: 'docs/contents/installation.md',
        },
        {
          name: 'Create React App',
          content: 'docs/contents/create-react-app.md',
        },
        {
          name: 'as',
          content: 'docs/contents/as.md',
        },
        {
          name: 'Styling',
          content: 'docs/contents/styling.md',
        },
        {
          name: 'State',
          content: 'docs/contents/state.md',
        },
        {
          name: 'Behaviors',
          content: 'docs/contents/behaviors.md',
        },
      ],
    },
    {
      name: 'Components',
      components: 'src/components/**/[A-Z]*.js',
    },
  ],
}
