export function getTabId(tabId: string, prefix?: string, suffix?: string) {
  return [prefix, tabId, suffix].filter(Boolean).join("-");
}

export function getTabPanelId(tabId: string, prefix?: string) {
  return getTabId(tabId, prefix, "panel");
}
