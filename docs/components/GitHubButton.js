import React from 'react'
import GoMarkGithub from 'react-icons/lib/go/mark-github'
import as, { Button, Inline } from '../../src'

const Wrapper = Button.extend`
  background-color: white;
  color: #333 !important;
  &&&:hover {
    text-decoration: none !important;
  }
`

const GitHubButton = props => (
  <Wrapper {...props} href="https://github.com/diegohaz/reas">
    <GoMarkGithub />
    <Inline marginLeft={5}>View on GitHub</Inline>
  </Wrapper>
)

export default as('a')(GitHubButton)
