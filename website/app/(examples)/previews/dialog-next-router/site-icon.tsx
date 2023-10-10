import { Nextjs } from "icons/nextjs.jsx";

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-14 pt-16">
          <Nextjs height={80} />
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center overflow-hidden bg-gray-150/40 p-4 px-2 dark:bg-gray-850/30">
          <div className="-ml-10 -mt-10 flex w-full flex-col gap-2 rounded-lg border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-gray-650 dark:shadow-dark">
            <div className="h-3 w-14 rounded-sm bg-black/60 dark:bg-white/60" />
            <div className="flex flex-col gap-2 pb-2 pt-2">
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="h-2 w-full rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="h-2 w-10 rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
            <div className="h-5 w-14 self-end rounded bg-blue-600 dark:bg-blue-500" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
