export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col">
          <div className="ml-[72px] mt-6 size-8 rounded-tr-2xl border-r border-t border-black/55 dark:border-white/40" />
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col">
          <div className="ml-20 mt-4 size-8 rounded-tr-3xl border-r border-t border-black/55 dark:border-white/40" />
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col">
          <div className="-ml-4 mt-8 flex w-28 flex-col gap-3 rounded-xl border border-black/20 bg-white p-3 pb-5 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
            <div className="h-3 w-12 rounded-sm bg-black/65 dark:bg-white/70" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-full rounded-sm bg-black/35 dark:bg-white/40" />
              <div className="h-2 w-10 rounded-sm bg-black/35 dark:bg-white/40" />
            </div>
            <div className="h-4 w-12 self-end rounded bg-blue-600 dark:bg-blue-500" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
