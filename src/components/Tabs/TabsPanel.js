import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Hidden from '../Hidden'

const TabsPanel = (props) => {
  const { isCurrent, tab } = props
  return (
    <Hidden
      id={`${tab}Panel`}
      aria-labelledby={`${tab}Tab`}
      destroy
      {...props}
      visible={isCurrent(tab)}
    />
  )
}

const enhance = compose(
  as('div'),
  setDisplayName('TabsPanel'),
  setPropTypes({
    ...Hidden.propTypes,
    tab: PropTypes.string.isRequired,
    isCurrent: PropTypes.func.isRequired,
  }),
  setStatic('defaultProps', {
    role: 'tabpanel',
  }),
)

export default enhance(TabsPanel)
