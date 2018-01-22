import PropTypes from 'prop-types'
import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Fit from '../Fit'

const Shadow = styled(Fit)`
  border-radius: inherit;
  pointer-events: none;
  box-shadow: 0 ${props => props.depth * 2}px ${props => props.depth * 4}px rgba(0, 0, 0, 0.2);
`

const enhance = compose(
  as('div'),
  setDisplayName('Shadow'),
  setPropTypes({
    ...Fit.propTypes,
    depth: PropTypes.number,
  }),
  setStatic('defaultProps', {
    depth: 2,
  }),
)

export default enhance(Shadow)
