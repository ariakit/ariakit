export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={104} y={24}>
        <div className="h-full overflow-hidden">
          <div className="mx-auto h-6 w-24 rounded border border-black/30 bg-white px-2 py-1 dark:border-white/30 dark:bg-black">
            <div className="h-full w-px bg-black/70 dark:bg-white/70" />
          </div>
          <div className="mx-auto mt-1 h-8 w-24 rounded border border-black/25 border-t-black/[35%] bg-gray-250 dark:border-white/[15%] dark:border-t-white/25 dark:bg-gray-700" />
          <div className="mx-auto -mt-5 h-8 w-24 rounded border border-black/25 border-t-black/[35%] bg-gray-150 dark:border-white/[15%] dark:border-t-white/25 dark:bg-gray-650" />
          <div className="mx-auto -mt-5 flex w-24 flex-col gap-2 rounded border border-black/25 border-t-black/[35%] bg-white p-3 shadow dark:border-white/[15%] dark:border-t-white/25 dark:bg-gray-600 dark:shadow-dark">
            <div className="h-1.5 w-12 bg-black/50 dark:bg-white/60" />
            <div className="h-1.5 w-8 bg-blue-600 dark:bg-blue-500" />
            <div className="h-1.5 w-14 bg-black/50 dark:bg-white/60" />
            <div className="h-1.5 w-6 bg-black/50 dark:bg-white/60" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
