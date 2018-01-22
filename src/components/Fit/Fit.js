import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Block from '../Block'

const Fit = styled(Block)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const enhance = compose(
  as('div'),
  setDisplayName('Fit'),
  setPropTypes(Block.propTypes),
)

export default enhance(Fit)
