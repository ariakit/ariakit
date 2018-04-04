import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Field = styled(Base)`
  display: flex;
  flex-direction: column;
  flex: 1;
  label {
    padding-bottom: 0.5em;
  }
  > *:not(label):not(:last-child) {
    margin-bottom: 0.5em;
  }
`;

export default as("div")(Field);
