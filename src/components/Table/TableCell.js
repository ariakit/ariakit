import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { ifProp } from 'styled-tools'
import as from '../../enhancers/as'
import Base from '../Base'

const Component = props => (
  <Base
    as={props.header ? 'th' : 'td'}
    role={props.header ? 'columnheader' : 'cell'}
    {...props}
  />
)

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

TableCell.propTypes = {
  header: PropTypes.bool,
}

export default as(Component)(TableCell)
