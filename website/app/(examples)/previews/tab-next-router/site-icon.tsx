import { Nextjs } from "icons/nextjs.jsx";

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col items-center p-2">
          <Nextjs height={60} />
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center overflow-hidden bg-gray-150/40 p-4 px-2 dark:bg-gray-850/30">
          <div className="mt-8 flex w-full flex-col gap-2 rounded-md border border-black/20 bg-white p-2 shadow dark:border-white/10 dark:bg-gray-700 dark:shadow-dark">
            <div className="grid h-4 w-full grid-flow-col gap-2">
              <div className="rounded-sm bg-black/40 dark:bg-white/40" />
              <div className="rounded-sm bg-blue-600 dark:bg-blue-500" />
              <div className="rounded-sm bg-black/40 dark:bg-white/40" />
            </div>
            <div className="flex flex-col gap-1.5 pb-2 pt-1.5">
              <div className="h-1.5 w-full bg-black/40 dark:bg-white/40" />
              <div className="h-1.5 w-full bg-black/40 dark:bg-white/40" />
              <div className="h-1.5 w-10 bg-black/40 dark:bg-white/40" />
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
