import * as React from "react";

function TestTube(props: React.SVGAttributes<SVGElement>, ref: React.Ref<any>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 48 48" {...props} ref={ref}>
      <g fill="#90CAF9">
        <path d="M29 21H19L7.206 35.143c-.049.049-.091.104-.138.153l-.24.269h.02A3.954 3.954 0 0 0 6 38a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4c0-.891-.301-1.705-.793-2.369h.015l-.181-.201c-.092-.108-.181-.219-.283-.316L29 21z" />
        <path d="M19 9h10v13.417H19z" />
        <path d="M31 8a2 2 0 0 1-2 2H19a2 2 0 0 1 0-4h10a2 2 0 0 1 2 2z" />
      </g>
      <path
        fill="#F50057"
        d="M39.601 36.822l-.014-.019-.034-.038-.02-.021-.019-.021-.048-.058c-.031-.037-.061-.075-.095-.109l-.057-.055-.047-.053-6.595-7.948H15.323l-6.629 7.979-.036.04-.013.013c-.038.044-.068.079-.099.111l-.04.045-.078.102A1.98 1.98 0 0 0 8 38c0 1.103.897 2 2 2h28c1.103 0 2-.897 2-2 0-.528-.218-.932-.399-1.178z"
      />
      <circle fill="#F48FB1" cx={29} cy={35} r={3} />
      <circle fill="#F8BBD0" cx={22} cy={32} r={2} />
      <g fill="#E3F2FD">
        <circle cx={25} cy={23} r={2} />
        <circle cx={23.5} cy={16.5} r={1.5} />
      </g>
    </svg>
  );
}

export default React.forwardRef(TestTube);
