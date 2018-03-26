import React from 'react'
import PropTypes from 'prop-types'
import as, { Paragraph, Block, Tabs } from '../../src'
import IntroPanel from './IntroPanel'
import IntroTabs from './IntroTabs'
import Link from './Link'

const Headline = Paragraph.extend`
  font-family: 'Fira Code', monospace;
  font-size: 20px;
  font-style: italic;
  color: #aaa;
  text-align: center;
  margin: 0;
  @media screen and (max-width: 800px) {
    display: none;
  }
`

const filter = (intro, type) => intro.content.filter(v => v.type === type)

const Intro = ({ intro, ...props }) => {
  const mds = filter(intro, 'markdown')
  const codes = filter(intro, 'code')
  const createItems = tabs =>
    mds.map((md, i) => (
      <IntroPanel
        as={Tabs.Panel}
        key={`tab${i}`}
        tab={`tab${i}`}
        content={md.content}
        code={codes[i].content}
        evalInContext={codes[i].evalInContext}
        {...codes[i].settings}
        {...tabs}
      />
    ))
  return (
    <Block {...props}>
      <Headline>
        A minimalist and highly customizable component system built on top of{' '}
        <Link href="https://reactjs.org" blank>
          React
        </Link>{' '}
        and{' '}
        <Link href="https://styled-components.com" blank>
          styled-components
        </Link>
      </Headline>
      <Tabs.State>
        {tabs => (
          <React.Fragment>
            <IntroTabs items={createItems(tabs)} tabs={tabs} />
            {createItems(tabs)}
          </React.Fragment>
        )}
      </Tabs.State>
    </Block>
  )
}

Intro.propTypes = {
  intro: PropTypes.shape({
    content: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        evalInContext: PropTypes.func,
      }),
    ).isRequired,
  }).isRequired,
}

export default as('div')(Intro)
