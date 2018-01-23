const path = require('path')
const { createConfig, babel, resolve } = require('webpack-blocks')

module.exports = {
  title: 'reas',
  webpackConfig: createConfig([
    babel(),
    resolve({ alias: { reas: path.join(__dirname, 'src') } }),
  ]),
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, '.js')
    return `import { ${name} } from 'reas'`
  },
  styleguideDir: 'docs',
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
      content: 'docs/introduction.md',
    },
    {
      name: 'Documentation',
      sections: [
        {
          name: 'Installation',
          content: 'docs/installation.md',
          description: 'The description for the installation section',
        },
        {
          name: 'as',
          content: 'docs/as.md',
          description: 'The description for the installation section',
        },
        {
          name: 'Styling',
          content: 'docs/styling.md',
          description: 'The description for the installation section',
        },
        {
          name: 'State',
          content: 'docs/state.md',
          description: 'The description for the installation section',
        },
        {
          name: 'Behaviors',
          content: 'docs/behaviors.md',
          description: 'The description for the installation section',
        },
      ],
    },
    {
      name: 'Components',
      components: 'src/components/**/[A-Z]*.js',
    },
  ],
}
