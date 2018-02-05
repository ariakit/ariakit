import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import requiredIf from 'react-required-if'
import as from '../../enhancers/as'
import Base from '../Base'

class Component extends React.Component {
  componentDidMount() {
    const { visible, hideOnEsc } = this.props
    if (visible && hideOnEsc) {
      document.body.addEventListener('keydown', this.handleKeyDown)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { visible, hideOnEsc } = this.props
    if (visible !== nextProps.visible && hideOnEsc) {
      const addOrRemove = nextProps.visible
        ? 'addEventListener'
        : 'removeEventListener'
      document.body[addOrRemove]('keydown', this.handleKeyDown)
    }
  }

  handleKeyDown = e => e.key === 'Escape' && this.props.hide()

  render() {
    const { visible, destroy } = this.props

    if (destroy) {
      return visible ? <Base {...this.props} /> : null
    }

    return <Base aria-hidden={!visible} hidden={!visible} {...this.props} />
  }
}

const Hidden = styled(Component)`
  ${props =>
    !props.visible &&
    css`
      display: none !important;
    `};
`

const enhance = compose(
  as('div'),
  setDisplayName('Hidden'),
  setPropTypes({
    ...Base.propTypes,
    hide: requiredIf(PropTypes.func, props => props.hideOnEsc),
    hideOnEsc: PropTypes.bool,
    visible: PropTypes.bool,
    destroy: PropTypes.bool,
  }),
)

export default enhance(Hidden)
