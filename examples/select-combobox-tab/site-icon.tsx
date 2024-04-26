export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-8 pt-4">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col gap-2">
              <div className="ml-2.5 flex h-6 w-20 items-center justify-end rounded bg-blue-600 px-1">
                <svg
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 16 16"
                  className="h-4 w-4 stroke-white"
                >
                  <polyline points="4,6 8,10 12,6" />
                </svg>
              </div>
              <div className="flex w-32 flex-col items-start overflow-hidden rounded-lg border border-black/20 bg-gray-300 shadow dark:border-white/30 dark:bg-gray-700 dark:shadow-dark">
                <div className="flex h-7 w-full items-center gap-0.5 border-b border-black/40 bg-white dark:border-white/30 px-2.5 py-1.5 dark:bg-gray-900">
                  <div className="h-2 w-12 rounded-[1px] bg-black/45 dark:bg-white/50" />
                  <div className="h-full w-px bg-black dark:bg-white" />
                </div>
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
                <div className="mt-[-0.5px] h-10 w-full bg-white p-2 dark:bg-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
