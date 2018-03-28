import React from 'react'
import PropTypes from 'prop-types'
import as from '../../enhancers/as'
import Hidden from '../Hidden'

const TabsPanel = props => {
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

TabsPanel.propTypes = {
  tab: PropTypes.string.isRequired,
  isCurrent: PropTypes.func.isRequired,
}

TabsPanel.defaultProps = {
  role: 'tabpanel',
}

export default as('div')(TabsPanel)
