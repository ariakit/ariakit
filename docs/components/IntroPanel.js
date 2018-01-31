import React from 'react'
import { compose, withState } from 'recompose'
import { prop } from 'styled-tools'
import Preview from 'react-styleguidist/lib/rsg-components/Preview'
import Markdown from 'react-styleguidist/lib/rsg-components/Markdown'
import Editor from './Editor'
import as, { Block } from '../../src'

const Wrapper = Block.extend`
  &&& a {
    code {
      color: #4dbcfc;
    }
  }

  > div:nth-child(2) {
    padding: 16px 0;
    min-height: ${prop('size', 'auto')};

    [role=button]:not(input) {
      color: white;
    }
  }

  [class*="rsg--spacing"] *,
  [class*="rsg--para"] {
    color: white;
    a {
      color: #4dbcfc;
    }
  }

  code {
    background-color: rgba(255, 255, 255, 0.07);
  }
`

const IntroPanel = ({ code, setCode, content, evalInContext, ...props }) => (
  <Wrapper {...props}>
    <Markdown text={content} />
    <Preview code={code} evalInContext={evalInContext} />
    <Editor code={code} onChange={setCode} />
  </Wrapper>
)

const enhance = compose(
  as('div'),
  withState('code', 'setCode', ({ code }) => code),
)

export default enhance(IntroPanel)
