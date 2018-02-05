import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableHead = styled(Base)`
  display: table-header-group;
  border: inherit;
`

const enhance = compose(
  as('thead'),
  setDisplayName('TableHead'),
  setPropTypes(Base.propTypes),
  setStatic('defaultProps', {
    role: 'rowgroup',
  }),
)

export default enhance(TableHead)
