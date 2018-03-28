import styled from 'styled-components'
import as from '../../enhancers/as'
import Base from '../Base'

const TableColumn = styled(Base)`
  display: table-column;
`

export default as('col')(TableColumn)
