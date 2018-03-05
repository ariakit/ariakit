import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import as from '../../enhancers/as'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'

const Divider = styled.div.attrs({
  className: props=>props.horizontal && 'horizontal' || props.vertical && 'vertical'
})`
  
  &.horizontal {
    margin: 1rem 0;
    height: 0;
    border-top: 1px solid rgba(34, 36, 38, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  &.vertical {
    margin: 0 1rem;
    height: 100%;
    width: 0;
    display: inline-block;
    border-left: 1px solid rgba(34, 36, 38, 0.3);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
`

const enhance = compose(
  setDisplayName('Divider'),
)

export default enhance(Divider)
