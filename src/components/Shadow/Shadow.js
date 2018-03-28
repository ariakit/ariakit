import PropTypes from 'prop-types'
import styled from 'styled-components'
import { withProp } from 'styled-tools'
import as from '../../enhancers/as'
import Fit from '../Fit'

const Shadow = styled(Fit)`
  border-radius: inherit;
  pointer-events: none;
  box-shadow: ${withProp(
    'depth',
    d => `0 ${d * 2}px ${d * 4}px rgba(0, 0, 0, 0.2)`,
  )};
`

Shadow.propTypes = {
  depth: PropTypes.number,
}

Shadow.defaultProps = {
  depth: 2,
}

export default as('div')(Shadow)
