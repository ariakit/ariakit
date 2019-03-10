export function unstable_getTabId(
  tabId: string,
  prefix?: string,
  suffix?: string
) {
  return [prefix, tabId, suffix].filter(Boolean).join("-");
}

export function unstable_getTabPanelId(tabId: string, prefix?: string) {
  return unstable_getTabId(tabId, prefix, "panel");
}
