import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Perpendicular from '../Perpendicular'

const Tooltip = styled(Perpendicular)`
  pointer-events: none;
  opacity: 0;
  white-space: nowrap;
  text-transform: none;
  font-size: 0.85em;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.85);
  border-radius: 0.15384em;
  padding: 0.75em 1em;

  *:hover > &, *:focus > & {
    opacity: 1;
  }
`

const enhance = compose(
  as('div'),
  setDisplayName('Tooltip'),
  setPropTypes(Perpendicular.propTypes),
  setStatic('defaultProps', {
    role: 'tooltip',
    pos: 'top',
    align: 'center',
  }),
)

export default enhance(Tooltip)
