import React from 'react'
import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import InlineFlex from '../InlineFlex'
import Box from '../Box'

const InlineFlexBox = InlineFlex.as(Box)

const handleKeyPress = (evt) => {
  if (evt.charCode === 32 || evt.charCode === 13) {
    evt.preventDefault()
    evt.target.click()
  }
}

const Component = (props) => {
  const otherProps = {
    role: 'button',
    tabIndex: 0,
    onKeyPress: handleKeyPress,
  }
  return (
    <InlineFlexBox {...otherProps} {...props} />
  )
}

const Button = styled(Component)`
  position: relative;
  flex: none;
  appearance: none;
  user-select: none;
  outline: none;
  align-items: center;
  white-space: nowrap;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.03);
  height: 2.5em;
  min-width: 2.5em;
  padding: 0 0.5em;
  &:hover, &:focus {
    box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.1);
  }
  &:active, &.active {
    box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.2);
  }
  &:after {
    display: none;
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
    background-color: rgba(255, 255, 255, 0.35);
  }
  &[disabled] {
    pointer-events: none;
    &:after {
      display: block;
    }
  }
`

const enhance = compose(
  as('button'),
  setDisplayName('Button'),
  setPropTypes(InlineFlexBox.propTypes),
)

export default enhance(Button)
