import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Hidden from '../Hidden'

const Backdrop = styled(Hidden)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 998;
`

const enhance = compose(
  as('div'),
  setDisplayName('Backdrop'),
  setPropTypes(Hidden.propTypes),
  setStatic('defaultProps', {
    role: 'button',
    tabIndex: -1,
  }),
)

export default enhance(Backdrop)
