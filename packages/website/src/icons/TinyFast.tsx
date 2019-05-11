import * as React from "react";

function TinyFast(props: React.SVGAttributes<SVGElement>, ref: React.Ref<any>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 48 48" {...props} ref={ref}>
      <g>
        <g>
          <path fill="#F57C00" d="M24,15.7l-6,11.6L24,43l18-8.7V15.7H24z" />
        </g>
      </g>
      <g>
        <g>
          <path fill="#FF9800" d="M6,15.7v18.6L24,43V15.7H6z" />
        </g>
      </g>
      <g>
        <g>
          <path fill="#FFCC80" d="M6,15.7l18,7.9l18-7.9L24,9L6,15.7z" />
        </g>
      </g>
      <g>
        <polygon fill="#607D8B" points="34,10.1 34,4 32,4 32,9.3 	" />
        <polygon fill="#607D8B" points="28,7.8 28,4 26,4 26,7.1 	" />
        <polygon fill="#607D8B" points="40,12.3 40,4 38,4 38,11.6 	" />
        <polygon fill="#607D8B" points="10,11.6 10,4 8,4 8,12.3 	" />
        <polygon fill="#607D8B" points="22,7.1 22,4 20,4 20,7.8 	" />
        <polygon fill="#607D8B" points="16,9.3 16,4 14,4 14,10.1 	" />
      </g>
      <path
        fill="#AB5600"
        d="M32,25.8l4-1.7c0.6-0.2,1-0.9,1-1.4v0c0-0.6-0.4-0.8-1-0.6l-4,1.7c-0.6,0.2-1,0.9-1,1.4v0
	C31,25.8,31.4,26.1,32,25.8z"
      />
    </svg>
  );
}

export default React.forwardRef(TinyFast);
