export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center px-5">
          <div className="flex w-full flex-col gap-2 rounded-md border border-black/20 bg-white p-2 shadow-md dark:border-white/10 dark:bg-white/10 dark:shadow-md-dark">
            <div className="h-1.5 w-10 rounded-[1px] bg-black/65 dark:bg-white/70" />
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full rounded-[1px] bg-black/35 dark:bg-white/40" />
              <div className="h-1.5 w-10 rounded-[1px] bg-black/35 dark:bg-white/40" />
            </div>
            <div className="h-2.5 w-6 rounded-sm bg-blue-600 dark:bg-blue-500" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
