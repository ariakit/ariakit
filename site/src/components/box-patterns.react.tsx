export function BoxPatternsRight() {
  const top = (
    <div className="absolute bottom-full flex flex-col gap-2 end-0 mb-4 w-full h-40 mask-t-from-50% mask-t-to-95% ak-layer-pop ak-frame-border ak-frame-2xl/2 [--hole:var(--ak-layer-parent)]">
      <div className="ak-layer-(--hole) ak-frame/2 ring flex-1 flex flex-col">
        <div className="flex-1" />
        <div className="ak-layer-pop ak-frame/1 h-8 w-2/3" />
      </div>
      <div className="ak-layer-(--hole) ak-light:ak-layer ak-frame/1 ring flex">
        <div className="size-8 ak-frame/1 ak-layer-pop ms-auto" />
      </div>
    </div>
  );

  const bottom = (
    <div className="absolute top-full end-0 mt-4 w-[220%] grid grid-cols-[1.2fr_1fr_1.4fr] gap-4 mask-l-from-50% mask-b-from-20%">
      <div className="ak-layer-pop ak-frame-border h-40 ak-frame-2xl/2 flex">
        <div className="ms-auto h-10 aspect-square ak-frame ak-frame-border ak-layer" />
      </div>
      <div className="ak-layer-current ak-frame-border h-40 ak-frame-2xl/2 flex flex-col gap-2">
        <div className="ak-layer-pop ak-frame-border ak-frame/1 h-10">
          <div className="h-full aspect-square ak-frame/1 ring ak-layer-down ak-light:ak-layer" />
        </div>
        <div className="ak-layer-pop ak-frame/1 h-10" />
        <div className="ak-layer-pop ak-frame/1 h-10">
          <div className="h-full aspect-square ak-frame/1 ring ak-layer-down ak-light:ak-layer" />
        </div>
      </div>
      <div className="ak-layer-pop ak-frame-border h-40 ak-frame-2xl/2 flex flex-col gap-2">
        <div className="ak-layer-down ak-light:ak-layer h-10 ak-frame-border ak-frame-cover flex flex-none">
          <div className="h-full aspect-square ak-frame/1 ring ak-layer-pop ms-auto" />
        </div>
        <div className="ak-layer-down ak-frame-border h-10 ak-frame flex-none" />
        <div className="ak-layer-down ak-frame-border h-full ak-frame" />
      </div>
    </div>
  );

  const right = (
    <div className="absolute start-full flex flex-col gap-2 ms-4 -translate-y-[70%] ak-layer-down ak-frame-border h-75 w-70 ak-frame-2xl/2 mask-r-from-50% mask-t-from-50%">
      <div className="ak-layer-pop ak-frame flex-1" />
      <div className="ak-layer-pop ak-frame h-10 ak-frame-border" />
      <div className="ak-layer-pop ak-frame h-10" />
      <div className="ak-layer ak-frame-border ak-frame-cover flex gap-2">
        <div className="ak-layer-pop ak-frame-border h-8 w-14 ak-frame" />
        <div className="ak-layer-pop ak-frame-border h-8 w-10 ak-frame" />
      </div>
    </div>
  );

  const left = (
    <div className="absolute end-full bottom-0 flex flex-col gap-1 me-4 ak-layer-pop ak-frame-border h-40 w-[80%] ak-frame-2xl/2 mask-l-from-50% mask-l-to-95% mask-t-from-50% mask-t-to-95% [--hole:var(--ak-layer-parent)]">
      <div className="flex-1" />
      <div className="flex">
        <div className="h-10 w-20 ak-frame/1 ak-frame-border ak-layer-pop ms-auto" />
      </div>
    </div>
  );

  return (
    <div className="opacity-30 absolute inset-0 ak-light:opacity-40 -z-1 touch-none **:ak-edge/25 [--contrast:0]">
      {top}
      {right}
      {bottom}
      {left}
    </div>
  );
}

export function BoxPatternsMiddle() {
  const top = (
    <div className="absolute bottom-full mb-4 w-full flex">
      <div className="ak-layer-down ak-frame-border w-40 h-32 justify-self-start ak-frame-xl/1 mask-t-from-50% mask-t-to-90% mask-r-from-25% mask-r-to-60% flex flex-col gap-2">
        <div className="flex-1" />
        <div className="ak-layer ak-frame-cover ak-frame-border flex gap-1">
          <div className="ak-layer-down ak-frame size-8 ak-frame-border" />
          <div className="ak-layer-down ak-frame size-8 ak-frame-border" />
        </div>
      </div>
      <div className="ak-layer-current ak-frame-border w-48 h-32 absolute end-0 bottom-0 translate-x-22 ak-frame-2xl/2 gap-2 grid grid-rows-[1fr_--spacing(10)] mask-t-from-50% mask-t-to-90% mask-l-from-50% mask-l-to-90%">
        <div className="ak-layer-pop ak-frame flex-1 w-2/3" />
        <div className="ak-layer-down ak-frame ak-frame-border" />
      </div>
    </div>
  );

  const right = (
    <div className="absolute start-full ms-4 top-0 flex h-full gap-4">
      <div className="ak-layer-pop ak-frame-border w-18 h-[1em] ak-frame-xl/1 flex justify-end">
        <div className="ak-layer h-full aspect-square ak-frame-border ak-frame" />
      </div>
      <div className="grid h-max mask-b-from-60% mask-t-from-70% -translate-y-35 gap-4">
        <div className="ak-layer-pop ak-frame-border w-full h-10 ak-frame-xl/1" />
        <div className="ak-layer-current ak-frame-border w-40 ak-frame-xl/1 grid gap-1 h-max">
          <div className="ak-layer-down h-9 ak-frame-border ak-frame/1 flex justify-end">
            <div className="ak-layer-pop h-full aspect-square ak-frame ak-frame-border" />
          </div>
          <div className="h-9 ak-frame/1">
            <div className="ak-layer-pop-2 h-full aspect-square ak-frame" />
          </div>
          <div className="h-9 ak-frame-border ak-frame/1">
            <div className="ak-layer-pop-2 h-full aspect-square ak-frame" />
          </div>
          <div className="h-9 ak-frame/1">
            <div className="ak-layer-pop-2 h-full aspect-square ak-frame" />
          </div>
          <div className="ak-layer-pop ak-frame-border h-9 ak-frame self-end" />
        </div>
      </div>
      <div className="ak-layer ak-frame-border w-70 h-80 ak-frame-3xl/2 flex flex-col gap-2 mask-r-from-70% mask-y-from-80% mask-y-to-95% mask-r-to-90% -translate-y-30">
        <div className="ak-layer-down ak-frame-border ak-frame/2 flex-1 grid grid-cols-3 gap-2">
          <div className="ak-layer-pop ak-frame aspect-square" />
          <div className="ak-layer-pop ak-frame aspect-square" />
          <div className="ak-layer-pop ak-frame aspect-square" />
          <div className="ak-layer-pop ak-frame aspect-square" />
          <div className="ak-layer-pop ak-frame aspect-square" />
          <div className="ak-layer-pop ak-frame aspect-square" />
          <div className="ak-layer-pop ak-frame aspect-square" />
        </div>
        <div className="ak-layer-down ak-frame-border ak-frame h-14" />
      </div>
    </div>
  );

  const left = (
    <div className="absolute end-full me-4 flex gap-4">
      <div className="ak-layer-down ak-frame-border w-80 ak-frame-2xl/2 flex flex-col gap-2 -translate-y-28 mask-y-from-80% mask-y-to-95% mask-l-from-70% mask-l-to-95%">
        <div className="ak-layer-pop ak-frame w-1/2 h-12 self-end" />
        <div className="ak-layer-pop ak-frame w-3/4 h-12" />
        <div className="ak-layer-pop ak-frame w-3/4 h-12 self-end" />
        <div className="ak-layer-pop ak-frame w-1/3 h-12 self-end" />
        <div className="ak-layer ak-frame-cover ak-frame-border mt-auto flex justify-end gap-2">
          <div className="ak-layer-pop ak-frame h-16 w-40" />
        </div>
      </div>
      <div className="ak-layer-down ak-frame-border w-48 h-42 ak-frame-2xl/2 -translate-y-16 mask-b-from-50% mask-b-to-90% flex gap-2 flex-col">
        <div className="ak-layer ak-frame-cover ak-frame-border flex justify-end">
          <div className="ak-layer-pop ak-frame ak-frame-border size-8" />
        </div>
        <div className="ak-layer-pop ak-frame h-10" />
        <div className="ak-layer-pop ak-frame h-10" />
      </div>
    </div>
  );

  return (
    <div className="opacity-30 absolute inset-0 ak-light:opacity-40 -z-1 touch-none **:ak-edge/25 [--contrast:0]">
      {top}
      {right}
      {left}
    </div>
  );
}
