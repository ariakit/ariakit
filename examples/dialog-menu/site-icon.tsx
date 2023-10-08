export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col overflow-hidden p-2">
          <div className="-ml-10 -mt-14 flex w-32 flex-col gap-4 rounded-lg border border-black/20 bg-gray-150 p-4 shadow dark:border-white/10 dark:bg-gray-700 dark:shadow-dark">
            <div className="mt-10 h-2 w-20 rounded-sm bg-black/40 dark:bg-white/40" />
            <div className="h-5 w-[50px] self-end rounded bg-blue-600" />
          </div>
          <div className="-mt-3 ml-4 flex w-24 flex-col gap-1 rounded-lg border border-black/20 bg-white p-1 shadow-md dark:border-white/[15%] dark:bg-gray-650 dark:shadow-md-dark">
            <div className="flex h-5 w-full items-center rounded bg-blue-600 px-2 dark:bg-blue-500" />
            <div className="flex h-5 w-12 items-center rounded px-1">
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
            <div className="flex h-5 w-16 items-center rounded px-1">
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
