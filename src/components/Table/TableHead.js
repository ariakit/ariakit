import styled from 'styled-components'
import as from '../../enhancers/as'
import Base from '../Base'

const TableHead = styled(Base)`
  display: table-header-group;
  border: inherit;
`

TableHead.defaultProps = {
  role: 'rowgroup',
}

export default as('thead')(TableHead)
