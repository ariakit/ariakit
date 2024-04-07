export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col items-center">
      <div className="relative mt-12 flex min-h-screen w-full min-w-[1px] max-w-7xl flex-col items-center gap-8 px-3 md:mt-20 md:px-4 lg:px-8">
        <div className="flex w-full flex-col items-center gap-8 *:w-full *:*:max-w-[--size-content] *:max-w-[1040px]">
          <div>
            <div className="h-12 w-1/2 rounded-md bg-black/10 dark:bg-white/10" />
          </div>
          <div className="flex -translate-y-1.5 flex-col gap-1.5">
            <div className="h-5 w-full rounded bg-black/10 sm:h-7 dark:bg-white/10" />
            <div className="h-5 w-full rounded bg-black/10 sm:h-7 dark:bg-white/10" />
            <div className="h-5 w-1/2 rounded bg-black/10 sm:h-7 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
