# Bugs Found and Fixed

## Summary
Found and fixed 3 significant bugs in the Ariakit codebase:

## 1. Array Modification During Iteration (Critical)
**File:** `packages/ariakit-core/src/utils/focus.ts`
**Issue:** Using `forEach` while modifying the array with `splice` caused elements to be skipped
**Impact:** Incomplete focus management, affecting accessibility
**Fix:** Replaced `forEach` with reverse `for` loop for safe array modification

## 2. Silent Error Handling (Medium)
**File:** `packages/ariakit-core/src/utils/events.ts`
**Issue:** Empty `catch {}` blocks hid all errors
**Impact:** Difficult debugging, potential security issues masked
**Fix:** Added specific error handling that only ignores expected SecurityError exceptions

## 3. Missing parseInt Radix (Medium)
**File:** `site/src/lib/kv.ts`
**Issue:** `parseInt(lastSync)` without radix parameter
**Impact:** Incorrect parsing with leading zeros or octal formats
**Fix:** Added radix parameter: `parseInt(lastSync, 10)`

All fixes maintain backward compatibility while improving reliability and accessibility.
