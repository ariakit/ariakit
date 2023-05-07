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
            <div className="m-2 flex flex-col gap-2 rounded border border-black/20 bg-white p-2 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
              <div className="h-1 w-8 bg-black/70 dark:bg-white/70" />
              <div className="h-3 w-12 rounded-sm border border-black/30 bg-white dark:border-white/20 dark:bg-black" />
              <div className="h-2 w-6 rounded-sm bg-blue-600 dark:bg-blue-500" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
