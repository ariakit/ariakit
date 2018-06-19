import { styled, Code as BaseCode } from "reakit";

const Code = styled(BaseCode)`
  font-family: "Fira Code", monospace;
  font-size: 14px;
  white-space: pre;
  overflow: auto;

  code {
    font-family: inherit;
  }
`;

export default Code;
