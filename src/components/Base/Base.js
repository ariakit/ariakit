import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'

const Base = ({ as: T, ...props }) => <T {...props} />

const type = PropTypes.oneOfType([PropTypes.func, PropTypes.string])

const enhance = compose(
  as('span'),
  setDisplayName('Base'),
  setPropTypes({
    as: PropTypes.oneOfType([type, PropTypes.arrayOf(type)]),
  }),
)

export default enhance(Base)
