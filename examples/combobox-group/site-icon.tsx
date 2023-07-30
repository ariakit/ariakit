export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden p-5">
          <div className="mx-auto h-4 w-16 rounded-sm border border-black/30 bg-white px-1 py-0.5 dark:border-white/30 dark:bg-black">
            <div className="h-full w-px bg-black/70 dark:bg-white/70" />
          </div>
          <div className="mx-auto mt-1 h-40 w-16 rounded-sm border border-black/25 bg-white shadow dark:border-white/[15%] dark:bg-gray-600 dark:shadow-dark" />
        </div>
      </foreignObject>
      <foreignObject width={128} height={80} y={48}>
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          <div className="mx-auto flex w-20 flex-col gap-2 rounded border border-blue-600 bg-blue-200/20 p-2 px-4 dark:border-blue-500 dark:bg-blue-500/20">
            <div className="h-1 w-10 bg-black/50 dark:bg-white/60" />
            <div className="h-1 w-6 bg-blue-600 dark:bg-blue-500" />
            <div className="h-1 w-12 bg-black/50 dark:bg-white/60" />
          </div>
          <div className="mx-auto flex w-20 flex-col gap-2 rounded border border-blue-600 bg-blue-200/20 p-2 px-4 dark:border-blue-500 dark:bg-blue-500/20">
            <div className="h-1 w-8 bg-black/50 dark:bg-white/60" />
            <div className="h-1 w-10 bg-black/50 dark:bg-white/60" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
