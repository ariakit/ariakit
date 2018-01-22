import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Perpendicular from '../Perpendicular'
import Arrow from '../Arrow'
import Box from '../Box'

const PerpendicularArrowBox = Perpendicular.as([Arrow, Box])

const PopoverArrow = styled(PerpendicularArrowBox)`
  color: white;
  border: inherit;
  border-top: 0;
  font-size: 24px;
`

const enhance = compose(
  as('div'),
  setDisplayName('PopoverArrow'),
  setPropTypes(PerpendicularArrowBox.propTypes),
  setStatic('defaultProps', {
    pos: 'top',
    align: 'center',
    gutter: '-1px',
    rotate: true,
    reverse: true,
  }),
)

export default enhance(PopoverArrow)
