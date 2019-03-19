export function getTabId(stopId: string, prefix?: string, suffix?: string) {
  return [prefix, stopId, suffix].filter(Boolean).join("-");
}

export function getTabPanelId(stopId: string, prefix?: string) {
  return getTabId(stopId, prefix, "panel");
}
