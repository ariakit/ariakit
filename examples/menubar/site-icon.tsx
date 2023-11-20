export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center gap-1.5 overflow-hidden p-5">
          <div className="flex gap-2">
            <div className="h-4 w-7 rounded-sm bg-black/20 dark:bg-white/20" />
            <div className="h-4 w-7 rounded-sm bg-blue-600 dark:bg-blue-500" />
            <div className="h-4 w-7 rounded-sm bg-black/20 dark:bg-white/20" />
          </div>
          <div className="ml-7 flex w-[70px] flex-col gap-2.5 rounded border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
            <div className="h-1.5 w-12 bg-black/50 dark:bg-white/50" />
            <div className="h-1.5 w-8 bg-blue-600 dark:bg-blue-500" />
            <div className="h-1.5 w-10 bg-black/50 dark:bg-white/50" />
            <div className="h-1.5 w-6 bg-black/50 dark:bg-white/50" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
