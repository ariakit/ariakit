import { useId } from "react";

export function AppStoreIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={id}
          x1="-1315.782"
          x2="-1195.782"
          y1="529.793"
          y2="529.793"
          gradientTransform="rotate(-90 -832.788 -362.994)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1d6ff2"></stop>
          <stop offset="1" stopColor="#1ac8fc"></stop>
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        fillRule="evenodd"
        d="M120,26V94a25.94821,25.94821,0,0,1-26,26H26A25.94821,25.94821,0,0,1,0,94V26A25.94821,25.94821,0,0,1,26,0H94A25.94821,25.94821,0,0,1,120,26Z"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M82.6,69H97.5a5.5,5.5,0,0,1,0,11H82.6Z"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M64.3 69a7.85317 7.85317 0 0 1 7.9 7.9 8.14893 8.14893 0 0 1-.6 3.1H22.5a5.5 5.5 0 0 1 0-11zM62.9 32.8v9.6H56.5L48.7 29a5.19712 5.19712 0 1 1 9-5.2zM68.4 42.1L95.7 89.4a5.48862 5.48862 0 0 1-9.5 5.5L69.7 66.2c-1.5-2.8-2.6-5-3.3-6.2A15.03868 15.03868 0 0 1 68.4 42.1z"
        data-name="Combined-Shape"
      ></path>
      <g>
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M46 74H33.3L62 24.3a5.48862 5.48862 0 0 1 9.5 5.5zM39.3 85.5L34 94.8a5.48862 5.48862 0 1 1-9.5-5.5l3.9-6.8a8.59835 8.59835 0 0 1 3.9-.9A7.77814 7.77814 0 0 1 39.3 85.5z"
          data-name="Combined-Shape"
        ></path>
      </g>
    </svg>
  );
}

export function BooksIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={id}
          x1="60"
          x2="60"
          y1="-725.988"
          y2="-845.988"
          gradientTransform="matrix(1 0 0 -1 0 -725.988)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fe9d02"></stop>
          <stop offset="1" stopColor="#f7701d"></stop>
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M26,0H94a25.94821,25.94821,0,0,1,26,26V94a25.94821,25.94821,0,0,1-26,26H26A25.94822,25.94822,0,0,1,0,94V26A26.012,26.012,0,0,1,26,0Z"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M81.9,27c9.8,0,14.9,3.7,18,6.2a5.83118,5.83118,0,0,1,2.2,4.6V86.5a1.77672,1.77672,0,0,1-.4,1,1.28389,1.28389,0,0,1-1,.4,1.08577,1.08577,0,0,1-.9-.4c-3.1-2.6-9.2-6-18.2-6-15,0-19.4,14-19.4,14v-53A12.19743,12.19743,0,0,1,64.8,35C67.6,31.3,72.7,27,81.9,27ZM39.3,27c9.2,0,14.3,4.3,17.2,8a12.19756,12.19756,0,0,1,2.6,7.5v53s-4.4-14-19.4-14c-9,0-15.1,3.4-18.2,6a3.55193,3.55193,0,0,1-.9.4,1.36706,1.36706,0,0,1-1.4-1.4V37.8a5.97977,5.97977,0,0,1,2.2-4.6C24.4,30.7,29.5,27,39.3,27Z"
      ></path>
    </svg>
  );
}

export function CalculatorIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={id}
          x1="59.25"
          x2="60.76"
          y1="119.1"
          y2="-.16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d4d4d2"></stop>
          <stop offset="1" stopColor="#d4d4d2"></stop>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill={`url(#${id})`}></rect>
      <rect width="62" height="90" x="29" y="15" fill="#1c1c1c" rx="8"></rect>
      <rect width="50" height="21" x="35" y="21" fill="#505050" rx="4"></rect>
      <circle cx="41" cy="55" r="6" fill="#d4d4d2"></circle>
      <circle cx="60" cy="55" r="6" fill="#d4d4d2"></circle>
      <circle cx="79" cy="55" r="6" fill="#fe9500"></circle>
      <circle cx="41" cy="74" r="6" fill="#d4d4d2"></circle>
      <circle cx="60" cy="74" r="6" fill="#d4d4d2"></circle>
      <circle cx="79" cy="74" r="6" fill="#fe9500"></circle>
      <path fill="#d4d4d2" d="M41 99a6 6 0 0 1 0-12h19a6 6 0 0 1 0 12Z"></path>
      <circle cx="79" cy="93" r="6" fill="#fe9500"></circle>
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M94,120H26A25.9482,25.9482,0,0,1,0,94V26A25.9482,25.9482,0,0,1,26,0H94a25.9482,25.9482,0,0,1,26,26V94A25.9482,25.9482,0,0,1,94,120Z"
      ></path>
      <path
        fill="#ff3b30"
        d="M42.36084 25.63436c.15088 1.293 1.42187 2.12207 3.25342 2.12207 1.6914 0 2.8872-.85156 2.8872-2.05762 0-1.02343-.77587-1.61621-2.68261-2.03613l-2.02539-.44141c-2.833-.60351-4.22266-2.05761-4.22266-4.417 0-2.89746 2.35938-4.81543 5.94629-4.81543 3.42578 0 5.84961 1.90723 5.94678 4.65332H48.4043c-.15088-1.27051-1.29248-2.10058-2.86524-2.10058-1.627 0-2.7041.78711-2.7041 2.0039 0 .98047.74316 1.55176 2.564 1.9502l1.87451.39844c3.124.668 4.4707 2.01464 4.4707 4.417 0 3.10254-2.40234 5.01953-6.30225 5.01953-3.70556 0-6.10791-1.82031-6.22656-4.69629zM63.62109 26.1617H58.15918l-1.1958 3.77051H53.69922l5.39746-15.54492H62.9209l5.39746 15.54492H64.79492zm-4.76171-2.43457h4.07226l-1.92871-6.18359h-.19336zM73.06348 29.93221V17.06991H68.39941V14.38729h12.582v2.68262H76.31738v12.8623z"
      ></path>
      <path d="M37.11328 42.36776c9.813 0 16.78418 6.74414 16.78418 15.0791 0 5.91016-2.68994 10.38086-12.42725 20.4209L26.8457 93.13729v.15137H55.29932v4.62207H19.647V94.273L38.96973 73.96541c7.84277-8.18359 9.7749-11.4414 9.7749-16.25292 0-6.02442-4.73584-10.79786-11.63135-10.79786-7.23633 0-12.6543 4.96289-12.73 11.66895H19.38184C19.45752 49.22518 26.99756 42.36776 37.11328 42.36776zM62.00684 70.55624c0-17.16309 7.46386-28.18848 19.81543-28.18848 12.38867 0 19.77734 10.9873 19.77734 28.15039 0 17.27637-7.35059 28.26367-19.77734 28.26367S62.00684 87.8326 62.00684 70.55624zm34.40234 0c0-14.35938-5.418-23.6045-14.58691-23.6045-9.13086 0-14.58692 9.32032-14.58692 23.56641 0 14.51074 5.3418 23.71777 14.58692 23.71777C91.06641 94.23592 96.40918 85.02889 96.40918 70.55624z"></path>
    </svg>
  );
}

export function ContactsIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={`${id}b`}
          x1="113.957"
          x2="113.957"
          y1="32.807"
          y2="42.245"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopOpacity=".3"></stop>
          <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id={`${id}a`}
          x1="113.958"
          x2="113.958"
          y1="62.639"
          y2="72.831"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopOpacity=".2"></stop>
          <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id={`${id}c`}
          x1="113.957"
          x2="113.957"
          y1="92.875"
          y2="100.46"
          xlinkHref={`#${id}a`}
        ></linearGradient>
        <linearGradient
          id="d"
          x1="107.918"
          x2="113.918"
          y1="60"
          y2="60"
          xlinkHref={`#${id}a`}
        ></linearGradient>
      </defs>
      <path
        fill="#d8d6cc"
        fillRule="evenodd"
        d="M93.9996,120h-68a25.9482,25.9482,0,0,1-26-26V26a25.9482,25.9482,0,0,1,26-26h68a25.9482,25.9482,0,0,1,26,26V94A25.9482,25.9482,0,0,1,93.9996,120Z"
      ></path>
      <path
        fill="#4cd964"
        fillRule="evenodd"
        d="M119.99753,92.87463v1.12a25.91354,25.91354,0,0,1-8.08,18.86921,25.26921,25.26921,0,0,1-4,3.12V92.87463Z"
      ></path>
      <rect
        width="12.086"
        height="30"
        x="107.914"
        y="62.873"
        fill="#ff9500"
      ></rect>
      <rect
        width="12.086"
        height="30"
        x="107.914"
        y="32.873"
        fill="#5ac8fa"
      ></rect>
      <rect
        width="12.086"
        height="10"
        x="107.914"
        y="32.873"
        fill={`url(#${id}b)`}
      ></rect>
      <rect
        width="12.086"
        height="10"
        x="107.915"
        y="62.874"
        fill={`url(#${id}a)`}
      ></rect>
      <path
        fill={`url(#${id}c)`}
        fillRule="evenodd"
        d="M107.914,92.87463v8h11.14344A26.10473,26.10473,0,0,0,119.9996,94V92.87463Z"
      ></path>
      <path
        fill="#c4c2ba"
        fillRule="evenodd"
        d="M119.99973,26A25.91639,25.91639,0,0,0,107.914,4.04135V32.87326h12.0857Z"
      ></path>
      <path
        fill="#a9a29a"
        d="M56.1843,99.99754a37.51911,37.51911,0,1,0-37.48088-37.519A37.65665,37.65665,0,0,0,56.1843,99.99754Zm0-24.97444c-12.77409,0-22.29729,5.928-25.31869,11.01478a34.59459,34.59459,0,1,1,50.63738.03823C78.48159,80.95115,68.99662,75.0231,56.1843,75.0231Zm0-6.61654c7.34319,0,12.96529-6.23408,12.96529-14.38044,0-7.64913-5.73685-14.0744-12.96529-14.0744-7.19021,0-12.96537,6.42527-12.92706,14.0744C43.25724,62.17248,48.87934,68.36833,56.1843,68.40656Z"
      ></path>
      <path
        fill={`url(#${id}d)`}
        fillRule="evenodd"
        d="M107.91757,115.95642a25.98648,25.98648,0,0,0,6-5.2273V9.27087a25.98668,25.98668,0,0,0-6-5.22729Z"
      ></path>
    </svg>
  );
}

export function FaceTimeIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={id}
          x1="60"
          x2="60"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#5bf776"></stop>
          <stop offset="1" stopColor="#0dbc29"></stop>
        </linearGradient>
      </defs>
      <rect fill={`url(#${id})`} width="120" height="120" rx="26"></rect>
      <path
        fill="#fefefe"
        d="M18.49 73.73V45.44c0-7.8 4.22-12.06 12.1-12.06h34.57c7.84 0 12.1 4.26 12.1 12.06v28.29c0 7.8-4.26 12.06-12.1 12.06H30.59c-7.84 0-12.1-4.26-12.1-12.06zM79.6 51.17l15.2-12.39a6.26 6.26 0 0 1 3.89-1.7c2.07 0 3.47 1.44 3.47 4v38c0 2.59-1.4 4-3.47 4a6.1 6.1 0 0 1-3.89-1.7l-15.2-12.5z"
      ></path>
    </svg>
  );
}

export function MailIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={id}
          x1="26.206"
          x2="146.207"
          y1="-1059.782"
          y2="-1059.782"
          gradientTransform="rotate(90 -486.788 -512.994)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1d6ff2"></stop>
          <stop offset="1" stopColor="#1ac8fc"></stop>
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        fillRule="evenodd"
        d="M0,94V26A25.94821,25.94821,0,0,1,26,0H94a25.94821,25.94821,0,0,1,26,26V94a25.94821,25.94821,0,0,1-26,26H26A26.012,26.012,0,0,1,0,94Z"
      ></path>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M99,86.2a6.10894,6.10894,0,0,1-3,.8H24a5.83049,5.83049,0,0,1-3-.8l24-24,5.9,5.9A12.219,12.219,0,0,0,60,71.5a12.37426,12.37426,0,0,0,9.1-3.4L75,62.2Zm2.1-2.2-24-24,24-24a6.10893,6.10893,0,0,1,.8,3V81A4.55088,4.55088,0,0,1,101.1,84ZM18.8,84a6.10894,6.10894,0,0,1-.8-3V39a5.83049,5.83049,0,0,1,.8-3l24,24ZM99,33.8,66.9,65.9A9.353,9.353,0,0,1,60,68.5a9.353,9.353,0,0,1-6.9-2.6L21,33.8a6.10894,6.10894,0,0,1,3-.8H96A6.10862,6.10862,0,0,1,99,33.8Z"
      ></path>
    </svg>
  );
}

export function PodcastsIcon() {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={16} height={16}>
      <defs>
        <linearGradient
          id={id}
          x1="60"
          x2="60"
          y1="-104.13"
          y2="15.87"
          gradientTransform="translate(0 104)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#c873f5"></stop>
          <stop offset="1" stopColor="#7b33bb"></stop>
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        fillRule="evenodd"
        d="M94,120H26A25.9482,25.9482,0,0,1,0,94V26A25.9482,25.9482,0,0,1,26,0H94a25.9482,25.9482,0,0,1,26,26V94A25.9482,25.9482,0,0,1,94,120Z"
      ></path>
      <path
        fill="#fff"
        d="M74.9,79.7l.5-4.4a8.85417,8.85417,0,0,0,0-2.3,23,23,0,1,0-30.8,0,17.63337,17.63337,0,0,0,0,2.3l.5,4.4a28,28,0,1,1,29.8,0ZM73.2,94.9l.6-5.5a37.125,37.125,0,1,0-27.6-.1l.6,5.5a41.84979,41.84979,0,1,1,26.4.1Z"
      ></path>
      <circle cx="60" cy="52" r="10" fill="#fff"></circle>
      <path
        fill="#fff"
        d="M55.9,66.5l-1.4.5a7.61676,7.61676,0,0,0-4.9,7.8l2.7,24.3A7.85757,7.85757,0,0,0,60,106a7.70934,7.70934,0,0,0,7.7-6.9l2.6-24.3A7.37888,7.37888,0,0,0,65.4,67l-1.3-.5A11.58079,11.58079,0,0,0,55.9,66.5Z"
      ></path>
    </svg>
  );
}

export function ColorPickerIcon() {
  const id = useId();
  return (
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none">
      <rect
        id={`${id}r4`}
        width="512"
        height="512"
        x="0"
        y="0"
        rx="128"
        fill={`url(#${id}r5)`}
        stroke="#FFFFFF"
        strokeWidth="0"
        strokeOpacity="100%"
        paintOrder="stroke"
      ></rect>
      <clipPath id="clip">
        <use xlinkHref={`#${id}r4`}></use>
      </clipPath>
      <defs>
        <linearGradient
          id={`${id}r5`}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(180)"
          style={{ transformOrigin: "center center" }}
        >
          <stop stopColor="#FC466B"></stop>
          <stop offset="1" stopColor="#3F5EFB"></stop>
        </linearGradient>
        {/* <radialGradient
          id={`${id}r6`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(256) rotate(90) scale(512)"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </radialGradient> */}
      </defs>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        width="352"
        height="352"
        x="80"
        y="80"
        alignmentBaseline="middle"
        style={{ color: "rgb(255, 255, 255)" }}
      >
        <path
          d="m5 9.75 5.142-7.196a2.342 2.342 0 1 1 3.304 3.304L7.25 12m-5.5 2.25s.81-1.307 1-2.25c.038-.19.06-.405.07-.626.04-.863.693-1.624 1.558-1.624H5A2.25 2.25 0 0 1 7.25 12v0A2.25 2.25 0 0 1 5 14.25H1.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </svg>
  );
}

export function DeveloperIcon() {
  const id = useId();
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        id={`${id}r4`}
        width="512"
        height="512"
        x="0"
        y="0"
        rx="128"
        fill={`url(#${id}r5)`}
        stroke="#FFFFFF"
        strokeWidth="0"
        strokeOpacity="100%"
        paintOrder="stroke"
      ></rect>
      <clipPath id="clip">
        <use xlinkHref={`#${id}r4`}></use>
      </clipPath>
      <defs>
        <linearGradient
          id={`${id}r5`}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(45)"
          style={{ transformOrigin: "center center" }}
        >
          <stop stopColor="#99F2C8"></stop>
          <stop offset="1" stopColor="#1F4037"></stop>
        </linearGradient>
        <radialGradient
          id={`${id}r6`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(256) rotate(90) scale(512)"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </radialGradient>
      </defs>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        width="352"
        height="352"
        x="80"
        y="80"
        alignmentBaseline="middle"
        style={{ color: "rgb(255, 255, 255)" }}
      >
        <path
          d="m6.738 6.193-4.69 5.029a1.151 1.151 0 0 0 0 1.547l1.083 1.16a.972.972 0 0 0 1.443 0l4.688-5.028M6.738 6.193l.36-.387a1.151 1.151 0 0 0 0-1.547l-1.082-1.16.36-.388c1.196-1.281 3.134-1.281 4.33 0l3.245 3.482c.399.427.399 1.12 0 1.547L12.87 8.9a.972.972 0 0 1-1.442 0l-.361-.386a.972.972 0 0 0-1.443 0l-.36.387M6.737 6.193 9.262 8.9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </svg>
  );
}

export function AIIcon() {
  const id = useId();
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        id={`${id}r4`}
        width="512"
        height="512"
        x="0"
        y="0"
        rx="128"
        fill={`url(#${id}r5)`}
        stroke="#FFFFFF"
        strokeWidth="0"
        strokeOpacity="100%"
        paintOrder="stroke"
      ></rect>
      <clipPath id="clip">
        <use xlinkHref={`#${id}r4`}></use>
      </clipPath>
      <defs>
        <linearGradient
          id={`${id}r5`}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(45)"
          style={{ transformOrigin: "center center" }}
        >
          <stop stopColor="#F953C6"></stop>
          <stop offset="1" stopColor="#B91D73"></stop>
        </linearGradient>
        <radialGradient
          id={`${id}r6`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(256) rotate(90) scale(512)"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </radialGradient>
      </defs>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        width="352"
        height="352"
        x="80"
        y="80"
        alignmentBaseline="middle"
        style={{ color: "rgb(255, 255, 255)" }}
      >
        <path
          d="M5.75 10C10 10 10 5.75 10 5.75S10 10 14.25 10C10 10 10 14.25 10 14.25S10 10 5.75 10ZM4 1.75S4 4 1.75 4C4 4 4 6.25 4 6.25S4 4 6.25 4C4 4 4 1.75 4 1.75Z"
          fill="currentColor"
        ></path>
        <path
          d="M5.75 10C10 10 10 5.75 10 5.75S10 10 14.25 10C10 10 10 14.25 10 14.25S10 10 5.75 10ZM4 1.75S4 4 1.75 4C4 4 4 6.25 4 6.25S4 4 6.25 4C4 4 4 1.75 4 1.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </svg>
  );
}
