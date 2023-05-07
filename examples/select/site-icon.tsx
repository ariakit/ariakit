export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center gap-1 p-5">
          <div className="flex h-4 w-14 items-center justify-end rounded bg-blue-600 px-1">
            <svg
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 16 16"
              className="h-3 w-3 stroke-white"
            >
              <polyline points="4,6 8,10 12,6" />
            </svg>
          </div>
          <div className="flex w-16 flex-col gap-1.5 rounded border border-black/20 bg-white p-1.5 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="h-2 w-full rounded-[1px] bg-black/40 dark:bg-white/40" />
            <div className="h-2 w-full rounded-[1px] bg-blue-600 dark:bg-blue-500" />
            <div className="h-2 w-full rounded-[1px] bg-black/40 dark:bg-white/40" />
            <div className="h-2 w-full rounded-[1px] bg-black/40 dark:bg-white/40" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
