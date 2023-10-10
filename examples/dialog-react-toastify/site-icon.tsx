export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full p-5">
          <div className="-ml-10 mt-6 flex w-28 flex-col gap-3 rounded-lg border border-black/20 bg-white p-3 pb-5 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
            <div className="h-3 w-12 rounded-sm bg-black/70 dark:bg-white/70" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="h-2 w-10 rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-end gap-2 p-2">
          <div className="h-6 w-16 gap-2 rounded border border-black/20 bg-white shadow-md dark:border-white/10 dark:bg-gray-500 dark:shadow-md-dark" />
          <div className="h-6 w-16 gap-2 rounded border border-black/20 bg-white shadow-md dark:border-white/10 dark:bg-gray-500 dark:shadow-md-dark" />
        </div>
      </foreignObject>
    </svg>
  );
}
