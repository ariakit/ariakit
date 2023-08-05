export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={104} y={24}>
        <div className="-ml-14 flex w-40 flex-col gap-2">
          <div className="h-8 w-full rounded-md border border-black/30 bg-white dark:border-white/30 dark:bg-black" />
          <div className="flex h-20 w-full flex-col gap-2 rounded-md border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="flex w-full flex-row-reverse rounded bg-blue-200/60 p-2 py-2 dark:bg-blue-600/60">
              <svg
                viewBox="0 0 24 24"
                strokeWidth={2}
                className="h-5 w-5 fill-none stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </div>
            <div className="h-9 w-full rounded bg-black/10 p-2 py-2 dark:bg-white/10" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
