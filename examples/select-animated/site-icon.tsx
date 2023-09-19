export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="mt-6 flex flex-col gap-2">
            <div className="mx-auto flex h-5 w-20 items-center justify-end rounded bg-blue-600 px-1">
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
            <div className="mx-auto flex justify-center gap-1.5">
              <div className="-mt-2 h-16 w-px bg-black/60 dark:bg-white/30" />
              <div className="h-20 w-px bg-black/60 dark:bg-white/30" />
              <div className="mx-auto flex w-20 flex-col gap-2 rounded border border-black/25 bg-white p-2 shadow dark:border-white/[15%] dark:bg-gray-600 dark:shadow-dark">
                <div className="h-3 w-full rounded-[1px] bg-black/40 dark:bg-white/40" />
                <div className="h-3 w-full rounded-[1px] bg-blue-600 dark:bg-blue-500" />
                <div className="h-3 w-full rounded-[1px] bg-black/40 dark:bg-white/40" />
                <div className="h-3 w-full rounded-[1px] bg-black/40 dark:bg-white/40" />
              </div>
              <div className="h-20 w-px bg-black/60 dark:bg-white/30" />
              <div className="-mt-2 h-16 w-px bg-black/60 dark:bg-white/30" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
