import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Block from '../Block'
import Box from '../Box'

const BlockBox = Block.as(Box)

const Input = styled(BlockBox)`
  width: 100%;
  padding: 0 0.5em;
  height: 2.5em;
  background-color: white;
  &::placeholder {
    color: currentcolor;
    opacity: 0.5;
  }
  textarea& {
    padding: 0.5em;
    height: auto;
  }
  &[type=checkbox], &[type=radio] {
    display: inline-block;
    width: auto;
    height: auto;
    padding: 0;
  }
`

const enhance = compose(
  as('input'),
  setDisplayName('Input'),
  setPropTypes(BlockBox.propTypes),
  setStatic('defaultProps', {
    type: 'text',
  }),
)

export default enhance(Input)
