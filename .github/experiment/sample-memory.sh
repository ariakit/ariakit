#!/usr/bin/env bash
# Experiment: sample memory and CPU per process group every 30 s on macOS.
# Each sample prints the swap usage, vm_stat counters, the memory pressure
# level, the load average, one line per group, and the 8 largest processes.
#
# Groups (first match wins):
#   sampler:   this script and its children
#   spotlight: mds*, mdworker*, mdsync, mdbulkimport, mdwrite, corespotlightd,
#              managedcorespotlightd, spotlightknowledged*
#   nextjs:    the process or an ancestor runs opennextjs-cloudflare
#   astro:     the process or an ancestor runs astro preview
#   webkit:    Playwright WebKit (its own build under ms-playwright/webkit-*)
#   test:      the process or an ancestor runs Playwright (node runner/workers)
#   other:     everything else
set -u

sample() {
  ps -axww -o pid=,ppid=,rss=,pcpu=,command= | awk -v self="$$" '
    {
      pid = $1
      parent[pid] = $2
      rss[pid] = $3
      cpu[pid] = $4
      line = $0
      sub(/^ *[0-9]+ +[0-9]+ +[0-9]+ +[0-9.]+ /, "", line)
      cmd[pid] = line
      name = line
      sub(/ .*/, "", name)
      sub(/.*\//, "", name)
      base[pid] = name
    }
    function chain_matches(p, pattern,    q, depth) {
      for (q = p; q != "" && q > 1 && depth < 30; q = parent[q]) {
        if (cmd[q] ~ pattern) return 1
        depth++
      }
      return 0
    }
    function has_ancestor(p, target,    q, depth) {
      for (q = p; q != "" && q > 1 && depth < 30; q = parent[q]) {
        if (q == target) return 1
        depth++
      }
      return 0
    }
    function group_of(p) {
      if (has_ancestor(p, self)) return "sampler"
      if (base[p] ~ /^(md(s|s_stores|worker|worker_shared|sync|bulkimport|write)|corespotlightd|managedcorespotlightd|spotlightknowledged.*)$/) return "spotlight"
      if (chain_matches(p, "opennextjs-cloudflare")) return "nextjs"
      if (chain_matches(p, "astro preview|astro\\.js preview|run preview --port")) return "astro"
      if (chain_matches(p, "ms-playwright/webkit|Playwright\\.app")) return "webkit"
      if (chain_matches(p, "playwright")) return "test"
      return "other"
    }
    END {
      for (p in rss) {
        g = group_of(p)
        grss[g] += rss[p]
        gcpu[g] += cpu[p]
        gcount[g]++
        total += rss[p]
      }
      split("webkit test astro nextjs spotlight sampler other", order, " ")
      for (i = 1; i <= 7; i++) {
        g = order[i]
        printf "group %-9s rss_mb=%7.1f cpu=%6.1f procs=%d\n", g, grss[g] / 1024, gcpu[g], gcount[g]
      }
      printf "group %-9s rss_mb=%7.1f\n", "total", total / 1024
      for (p in rss) printf "%d\t%s\t%s\t%s\t%s\n", rss[p], group_of(p), cpu[p], p, substr(cmd[p], 1, 140) | "sort -rn | head -8 | sed \"s/^/proc /\""
    }
  '
}

while true; do
  echo "=== $(date -u +%T)"
  echo "loadavg $(sysctl -n vm.loadavg)"
  echo "swapusage $(sysctl -n vm.swapusage)"
  # 1 = normal, 2 = warning, 4 = critical
  echo "pressure_level $(sysctl -n kern.memorystatus_vm_pressure_level)"
  memory_pressure 2>/dev/null | grep -E 'System-wide memory free percentage' || true
  vm_stat | grep -E '^(Mach Virtual Memory Statistics|Pages (free|active|inactive|speculative|wired down|occupied by compressor|stored in compressor)|Pageins|Pageouts|Swapins|Swapouts|Compressions|Decompressions)'
  sample
  sleep 30
done
