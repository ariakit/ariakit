import React from 'react'
import PropTypes from 'prop-types'
import as, { Flex } from '../../src'
import Menu from './Menu'

const Wrapper = Flex.extend`
  align-items: flex-start;
  width: 100%;
  max-width: 1200px;
  padding: 64px 16px;
  margin: 0 auto;
`

const StyledMenu = Menu.extend`
  position: sticky;
  top: 16px;
  min-width: 214px;
  margin-right: 32px;
  border-right: 1px solid #eee;
  max-height: calc(100vh - 32px);
  overflow: auto;

  @media screen and (max-width: 800px) {
    display: none;
  }
`

const Contents = ({ children, sections, ...props }) => (
  <Wrapper {...props}>
    <StyledMenu sections={sections} />
    {children}
  </Wrapper>
)

Contents.propTypes = {
  children: PropTypes.node.isRequired,
  sections: PropTypes.array.isRequired,
}

export default as('div')(Contents)
