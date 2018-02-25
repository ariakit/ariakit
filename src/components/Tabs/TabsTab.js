import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import createElementRef from '../../utils/createElementRef'
import InlineFlex from '../InlineFlex'
import Step from '../Step'

const InlineFlexStep = InlineFlex.as(Step)

class Component extends React.Component {
  componentDidUpdate(prevProps) {
    const { current, isCurrent, tab } = this.props

    if (prevProps.current !== current && isCurrent(tab)) {
      this.element.focus()
    }
  }

  show = () => {
    const { show, tab } = this.props
    show(tab)
  }

  keyDown = e => {
    const keyMap = {
      ArrowLeft: this.props.previous,
      ArrowRight: this.props.next,
    }
    if (keyMap[e.key]) {
      e.preventDefault()
      keyMap[e.key]()
    }
  }

  render() {
    const {
      isCurrent,
      tab,
      className,
      onClick,
      onFocus,
      onKeyDown,
    } = this.props

    const active = isCurrent(tab)
    const activeClassName = active ? 'active' : ''
    const finalClassName = [className, activeClassName]
      .filter(c => !!c)
      .join(' ')

    return (
      <InlineFlexStep
        id={`${tab}Tab`}
        step={tab}
        active={active}
        aria-selected={active}
        aria-controls={`${tab}Panel`}
        tabIndex={active ? 0 : -1}
        visible
        {...this.props}
        onClick={flow(this.show, onClick)}
        onFocus={flow(this.show, onFocus)}
        onKeyDown={flow(this.keyDown, onKeyDown)}
        className={finalClassName}
        elementRef={createElementRef(this, 'element')}
      />
    )
  }
}

const TabsTab = styled(Component)`
  position: relative;
  flex: 1;
  user-select: none;
  outline: none;
  align-items: center;
  white-space: nowrap;
  justify-content: center;
  text-decoration: none;
  height: 2.5em;
  padding: 0 0.5em;
  min-width: 2.5em;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  &.active {
    border-bottom: 1px solid black;
  }
  &[disabled] {
    pointer-events: none;
  }
`

const enhance = compose(
  as('li'),
  setDisplayName('TabsTab'),
  setPropTypes({
    ...InlineFlex.propTypes,
    tab: PropTypes.string.isRequired,
    register: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    unregister: PropTypes.func.isRequired,
    isCurrent: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    next: PropTypes.func.isRequired,
    previous: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyDown: PropTypes.func,
  }),
  setStatic('defaultProps', {
    role: 'tab',
    onClick: () => {},
    onFocus: () => {},
    onKeyDown: () => {},
  }),
)

export default enhance(TabsTab)
