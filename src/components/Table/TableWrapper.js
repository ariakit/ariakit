import styled from 'styled-components';
import { prop } from 'styled-tools';
import as from '../../enhancers/as';
import Base from '../Base';

const TableWrapper = styled(Base)`
	width: 100%;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	${prop('theme.TableWrapper')};
`;

TableWrapper.defaultProps = {
	role: 'table'
};

export default as('tableWrapper')(TableWrapper);
