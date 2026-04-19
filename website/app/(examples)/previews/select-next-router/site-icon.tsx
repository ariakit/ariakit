import { Nextjs } from "@/icons/nextjs.tsx";

export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-[83px] pt-20">
          <Nextjs height={56} />
        </div>
      </foreignObject>
      <foreignObject width={128} height={128}>
        <div className="flex flex-col gap-1.5 overflow-hidden bg-gray-150/40 dark:bg-gray-850/30">
          <div className="-ml-6 mt-6 flex h-8 w-28 items-center justify-end rounded-md bg-blue-600 px-2">
            <svg
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 16 16"
              className="size-6 stroke-white"
            >
              <polyline points="4,6 8,10 12,6" />
            </svg>
          </div>
          <div className="-ml-8 flex w-32 flex-col overflow-hidden rounded-lg border border-black/30 bg-white shadow dark:border-white/[15%] dark:bg-gray-700 dark:shadow-dark">
            <div className="flex flex-col gap-1.5 p-1.5">
              <div className="h-7 rounded bg-black/25 dark:bg-white/30" />
              <div className="flex h-7 items-center justify-end rounded bg-blue-600 px-1 text-white">
                <svg
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  className="size-5 fill-none stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
