import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Component = props => <div {...props} />;

const TableWrapper = styled(Base)(Component)`
	width: 100%;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	${prop("theme.TableWrapper")};
`;

export default as("tableWrapper")(TableWrapper);
