export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="mt-6 flex flex-col gap-2">
            <div className="mx-auto h-5 w-20 rounded-sm border border-black/30 bg-white px-1.5 py-1 dark:border-white/30 dark:bg-black">
              <div className="h-full w-px bg-black/70 dark:bg-white/70" />
            </div>
            <div className="mx-auto flex justify-center gap-1.5">
              <div className="-mt-2 h-16 w-px bg-black/60 dark:bg-white/30" />
              <div className="h-20 w-px bg-black/60 dark:bg-white/30" />
              <div className="mx-auto flex w-20 flex-col gap-2 rounded-sm border border-black/25 bg-white p-3 shadow dark:border-white/[15%] dark:bg-gray-600 dark:shadow-dark">
                <div className="h-1.5 w-12 bg-black/50 dark:bg-white/60" />
                <div className="h-1.5 w-8 bg-blue-600 dark:bg-blue-500" />
                <div className="h-1.5 w-14 bg-black/50 dark:bg-white/60" />
                <div className="h-1.5 w-6 bg-black/50 dark:bg-white/60" />
                <div className="h-1.5 w-8 bg-black/50 dark:bg-white/60" />
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
