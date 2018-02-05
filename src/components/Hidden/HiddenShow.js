import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import flow from 'lodash/flow'
import as from '../../enhancers/as'
import Base from '../Base'

const HiddenShow = ({ onClick = () => {}, ...props }) => (
  <Base onClick={flow(onClick, props.show)} {...props} />
)

const enhance = compose(
  as('button'),
  setDisplayName('HiddenShow'),
  setPropTypes({
    ...Base.propTypes,
    show: PropTypes.func.isRequired,
    onClick: PropTypes.func,
  }),
)

export default enhance(HiddenShow)
