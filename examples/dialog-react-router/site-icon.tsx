export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col items-center pl-12 pt-20">
          <svg width={64} viewBox="0 0 94 61" fill="none">
            <path
              d="M72.7315 20.9357C70.0548 20.0941 68.6725 20.3778 65.8649 20.071C61.5246 19.5976 59.7954 17.9013 59.0619 13.5356C58.6514 11.0985 59.1361 7.53022 58.0881 5.32106C56.0839 1.10875 51.3943 -0.780439 46.6828 0.297843C42.7049 1.20956 39.3951 5.18518 39.2117 9.266C39.0021 13.9254 41.657 17.901 46.2156 19.273C48.3814 19.9261 50.6825 20.2548 52.9444 20.4214C57.0925 20.7238 57.4113 23.0297 58.5335 24.9277C59.2409 26.1243 59.9264 27.3034 59.9264 30.8714C59.9264 34.4394 59.2365 35.6185 58.5335 36.8151C57.4113 38.7087 56.0271 39.9491 51.879 40.2559C49.6171 40.4225 47.3116 40.7513 45.1502 41.4044C40.5916 42.7807 37.9367 46.7519 38.1463 51.4113C38.3297 55.4921 41.6395 59.4678 45.6174 60.3795C50.3289 61.4621 55.0185 59.5686 57.0227 55.3563C58.075 53.1471 58.6514 50.6443 59.0619 48.2072C59.7998 43.8414 61.5289 42.1451 65.8649 41.6717C68.6725 41.3649 71.5783 41.6717 74.2093 40.177C76.9895 38.1456 79.4734 35.0968 79.4734 30.8714C79.4734 26.6459 76.7967 22.2156 72.7315 20.9357Z"
              className="fill-red-600/70 dark:fill-red-600/70"
            />
            <path
              d="M28.1997 40.7739C22.7285 40.7739 18.2656 36.3027 18.2656 30.8213C18.2656 25.3399 22.7285 20.8687 28.1997 20.8687C33.6709 20.8687 38.1338 25.3399 38.1338 30.8213C38.1338 36.2983 33.6665 40.7739 28.1997 40.7739Z"
              className="fill-black/70 dark:fill-white/70"
            />
            <path
              d="M9.899 61C4.43661 60.9868 -0.0130938 56.498 2.89511e-05 51.0122C0.0132099 45.5353 4.4936 41.0773 9.96914 41.0948C15.4359 41.108 19.8856 45.5968 19.8681 51.0825C19.8549 56.5551 15.3745 61.0131 9.899 61Z"
              className="fill-black/70 dark:fill-white/70"
            />
            <path
              d="M83.7137 60.9998C78.2339 61.0304 73.7361 56.5901 73.7052 51.122C73.6747 45.632 78.1068 41.1258 83.5646 41.0949C89.0444 41.0643 93.5423 45.5046 93.5731 50.9727C93.6036 56.4583 89.1716 60.9689 83.7137 60.9998Z"
              className="fill-black/70 dark:fill-white/70"
            />
          </svg>
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center overflow-hidden bg-gray-150/20 p-4 px-2 dark:bg-gray-850/30">
          <div className="-ml-12 -mt-12 flex w-full flex-col gap-2 rounded-lg border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-gray-650 dark:shadow-dark">
            <div className="h-3 w-14 rounded-sm bg-black/60 dark:bg-white/60" />
            <div className="flex flex-col gap-2 pb-2 pt-2">
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="h-2 w-10 rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
            <div className="h-5 w-14 self-end rounded bg-blue-600 dark:bg-blue-500" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
