export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={104} y={24}>
        <div className="-ml-10 flex h-40 w-36 flex-col items-center justify-start overflow-hidden rounded-lg border border-gray-350 bg-gray-250 pt-0 dark:border-gray-450 dark:bg-gray-900">
          <div className="h-4 w-full border-b border-[inherit] bg-white dark:bg-gray-750" />
          <div className="flex w-full items-center justify-between">
            <div className="m-4 flex flex-col gap-2 rounded border border-black/20 bg-white p-3 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
              <div className="h-2 w-8 bg-black/70 dark:bg-white/70" />
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-16 bg-black/40 dark:bg-white/40" />
                <div className="h-1.5 w-16 bg-black/40 dark:bg-white/40" />
                <div className="h-1.5 w-8 bg-black/40 dark:bg-white/40" />
              </div>
              <div className="h-3 w-6 rounded-sm bg-blue-600 dark:bg-blue-500" />
            </div>
            <div className="flex h-full flex-col border-l border-black/40 bg-white/80 p-1 dark:border-white/20 dark:bg-white/5">
              <div className="mt-2 h-10 w-2 rounded-full bg-black/40 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
