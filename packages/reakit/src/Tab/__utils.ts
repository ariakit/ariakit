export function getTabId(stopId?: string, prefix?: string, suffix?: string) {
  if (!stopId) return undefined;
  return [prefix, stopId, suffix].filter(Boolean).join("-");
}

export function getTabPanelId(stopId?: string, prefix?: string) {
  return getTabId(stopId, prefix, "panel");
}
