import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableCaption = styled(Base)`
  display: table-caption;
  text-transform: uppercase;
  font-size: 0.9em;
  color: #999;
`

const enhance = compose(
  as('caption'),
  setDisplayName('TableCaption'),
  setPropTypes(Base.propTypes),
)

export default enhance(TableCaption)
