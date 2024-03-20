export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="overflow-hidden">
          <div className="-ml-6 mt-6 flex w-32 flex-col gap-3 rounded-lg border border-black/20 bg-white p-4 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="h-3 w-12 rounded-sm bg-black/60 dark:bg-white/70" />
            <div className="flex h-7 w-24 items-center justify-end rounded-md border border-black/30 px-2 dark:border-white/30">
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 16 16"
                className="size-5 stroke-current"
              >
                <polyline points="4,6 8,10 12,6" />
              </svg>
            </div>
            <div className="h-3 w-20 rounded-sm bg-red-400 dark:bg-red-500" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
