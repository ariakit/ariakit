export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center p-5">
          <div className="flex w-full flex-col gap-1 rounded border border-black/20 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/10 dark:shadow-sm-dark">
            <div className="flex items-center gap-1">
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 stroke-black/70 dark:stroke-white/70"
              >
                <polyline points="4,6 8,10 12,6" />
              </svg>
              <div className="h-1 w-8 bg-black/70 dark:bg-white/70" />
            </div>
            <div className="flex flex-col gap-1 p-1 pl-[18px] pt-0">
              <div className="h-1 w-full bg-black/40 dark:bg-white/40" />
              <div className="h-1 w-full bg-black/40 dark:bg-white/40" />
              <div className="h-1 w-10 bg-black/40 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
