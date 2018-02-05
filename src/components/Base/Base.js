import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { bool } from '../../utils/styledProps'
import as from '../../enhancers/as'

const positions = ['static', 'absolute', 'fixed', 'relative', 'sticky']

const Component = ({ as: T, ...props }) => <T {...props} />

const Base = styled(Component)`
  &&& {
    ${bool('position', positions)};
  }
`

const type = PropTypes.oneOfType([PropTypes.func, PropTypes.string])

const enhance = compose(
  as('span'),
  setDisplayName('Base'),
  setPropTypes({
    as: PropTypes.oneOfType([type, PropTypes.arrayOf(type)]),
    ...positions.reduce(
      (obj, position) => ({
        ...obj,
        [position]: PropTypes.bool,
      }),
      {},
    ),
  }),
)

export default enhance(Base)
