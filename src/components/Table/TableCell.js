import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { ifProp } from 'styled-tools'
import {
  compose,
  setDisplayName,
  setPropTypes,
  branch,
  withProps,
} from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableCell = styled(Base)`
  display: table-cell;
  border: inherit;
  padding: 0 8px;
  vertical-align: middle;

  ${ifProp(
    'header',
    css`
      font-weight: bold;
      background-color: rgba(0, 0, 0, 0.05);
    `,
  )};
`

const enhance = compose(
  branch(props => props.header, as('th'), as('td')),
  setDisplayName('TableCell'),
  withProps(props => ({
    role: props.header ? 'columnheader' : 'cell',
  })),
  setPropTypes({
    ...Base.propTypes,
    header: PropTypes.bool,
  }),
)

export default enhance(TableCell)
