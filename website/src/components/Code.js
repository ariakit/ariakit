import { styled, Code } from "reas";

export default styled(Code)`
  font-family: "Fira Code", monospace;
  font-size: 14px;
  white-space: pre;
  overflow: auto;

  code {
    font-family: inherit;
  }
`;
