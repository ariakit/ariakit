export function unstable_getTabId(
  refId: string,
  prefix?: string,
  suffix?: string
) {
  return [prefix, refId, suffix].filter(Boolean).join("-");
}

export function unstable_getTabPanelId(refId: string, prefix?: string) {
  return unstable_getTabId(refId, prefix, "panel");
}
