export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center p-4">
          <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-md border border-gray-350 bg-gray-250 pt-0 dark:border-gray-450 dark:bg-gray-900">
            <div className="flex w-full items-center gap-0.5 border-b border-[inherit] bg-white p-1 dark:bg-gray-750">
              <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40" />
            </div>
            <div className="h-full w-full p-3">
              <div className="flex h-full w-full flex-col gap-2 rounded-sm border border-black/20 bg-white p-1 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
                <div className="grid h-3.5 w-full grid-flow-col gap-1">
                  <div className="bg-black/40 dark:bg-white/40" />
                  <div className="bg-green-600 dark:bg-green-500" />
                  <div className="bg-black/40 dark:bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
