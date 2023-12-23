export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="ml-6 mt-6 flex w-40 flex-col gap-2">
            <div className="flex h-10 w-full items-center gap-1 rounded-md border border-black/30 bg-white px-4 py-2 dark:border-white/30 dark:bg-black">
              <div className="h-2.5 w-7 rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="h-full w-[2px] bg-black/70 dark:w-px dark:bg-white" />
            </div>
            <div className="h-40 w-full rounded-md border border-black/20 bg-gray-300 shadow dark:border-white/30 dark:bg-gray-700 dark:shadow-dark">
              <svg
                height={28}
                viewBox="0 0 58 24"
                fill="none"
                className="mx-1.5 mt-2.5 fill-white stroke-none dark:fill-gray-500"
              >
                <rect x="5" width="48" height="24" rx="5" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M53 15H5V19C5 21.7614 2.76141 24 0 24H58C55.2386 24 53 21.7614 53 19V15Z"
                />
              </svg>
              <div className="mt-[-0.5px] h-full w-full bg-white p-2 dark:bg-gray-500"></div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
