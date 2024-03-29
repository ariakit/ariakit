export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-start justify-center gap-1 px-5">
          <div className="h-5 w-full rounded border border-black/30 bg-white px-2 py-1 dark:border-white/30 dark:bg-gray-900">
            <div className="h-full w-px bg-black/70 dark:bg-white/70" />
          </div>
          <div className="flex w-full flex-col gap-2 rounded border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="h-1.5 w-12 rounded-[1px] bg-black/[45%] dark:bg-white/50" />
            <div className="h-1.5 w-8 rounded-[1px] bg-blue-600 dark:bg-blue-500" />
            <div className="h-1.5 w-14 rounded-[1px] bg-black/[45%] dark:bg-white/50" />
            <div className="h-1.5 w-6 rounded-[1px] bg-black/[45%] dark:bg-white/50" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
