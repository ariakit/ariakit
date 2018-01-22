import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Perpendicular from '../Perpendicular'
import Arrow from '../Arrow'

const PerpendicularArrow = Perpendicular.as(Arrow)

const TooltipArrow = styled(PerpendicularArrow)`
  pointer-events: none;
  color: rgba(0, 0, 0, 0.85);
  border: inherit;
  font-size: 1.1764705882em;
`

const enhance = compose(
  as('div'),
  setDisplayName('TooltipArrow'),
  setPropTypes(PerpendicularArrow.propTypes),
  setStatic('defaultProps', {
    pos: 'bottom',
    align: 'center',
    gutter: '0px',
    rotate: true,
    reverse: true,
  }),
)

export default enhance(TooltipArrow)
