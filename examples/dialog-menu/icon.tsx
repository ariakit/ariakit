export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-start justify-center p-5">
          <div className="flex w-full flex-col gap-1.5 rounded border border-black/20 bg-white p-2 shadow-md dark:border-white/10 dark:bg-gray-700 dark:shadow-md-dark">
            <div className="h-1 w-10 bg-black/70 dark:bg-white/70" />
            <div className="h-1 w-full bg-black/40 dark:bg-white/40" />
            <div className="h-2 w-6 rounded-sm bg-blue-600 dark:bg-blue-500" />
          </div>
          <div className="-mt-2 ml-2 flex w-10 flex-col gap-1.5 rounded-sm border border-black/20 bg-white p-1.5 shadow dark:border-white/10 dark:bg-gray-550 dark:shadow-dark">
            <div className="h-0.5 w-6 bg-black/50 dark:bg-white/70" />
            <div className="h-0.5 w-4 bg-black/50 dark:bg-white/70" />
            <div className="h-0.5 w-5 bg-black/50 dark:bg-white/70" />
            <div className="h-0.5 w-3 bg-black/50 dark:bg-white/70" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
