import styled from "styled-components";
import as from "../../enhancers/as";
import Block from "../Block";

const Fit = styled(Block)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export default as("div")(Fit);
