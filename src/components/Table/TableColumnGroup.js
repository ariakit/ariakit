import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableColumnGroup = styled(Base)`
  display: table-column-group;
`

const enhance = compose(
  as('colgroup'),
  setDisplayName('TableColumnGroup'),
  setPropTypes(Base.propTypes),
)

export default enhance(TableColumnGroup)
