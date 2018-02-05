import styled from 'styled-components'
import {
  compose,
  setDisplayName,
  setPropTypes,
  setStatic,
  withProps,
} from 'recompose'
import as from '../../enhancers/as'
import Hidden from '../Hidden'
import Perpendicular from '../Perpendicular'
import Box from '../Box'

const HiddenPerpendicularBox = Hidden.as([Perpendicular, Box])

const Popover = styled(HiddenPerpendicularBox)`
  user-select: auto;
  cursor: auto;
  color: inherit;
  background-color: white;
  padding: 1em;
  z-index: 999;
  outline: 0;
`

const enhance = compose(
  as('div'),
  setDisplayName('Popover'),
  setPropTypes(HiddenPerpendicularBox.propTypes),
  setStatic('defaultProps', {
    role: 'group',
    pos: 'bottom',
    align: 'center',
    hideOnEsc: true,
  }),
  withProps(props => ({
    id: props.popoverId,
  })),
)

export default enhance(Popover)
