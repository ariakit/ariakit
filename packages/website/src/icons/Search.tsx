import * as React from "react";

function Search(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 16 16" width="16px" height="16px">
      <path
        d="
          M6.02945,10.20327a4.17382,4.17382,0,1,1,4.17382-4.17382A4.15609,4.15609,
          0,0,1,6.02945,10.20327Zm9.69195,4.2199L10.8989,9.59979A5.88021,5.88021,
          0,0,0,12.058,6.02856,6.00467,6.00467,0,1,0,9.59979,10.8989l4.82338,
          4.82338a.89729.89729,0,0,0,1.29912,0,.89749.89749,0,0,0-.00087-1.29909Z"
        fill="#a1a1a1"
      />
    </svg>
  );
}

export default React.forwardRef(Search);
