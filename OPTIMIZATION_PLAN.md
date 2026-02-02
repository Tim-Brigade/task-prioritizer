# Optimization Plan

## Status Legend
- [ ] Pending
- [x] Completed

---

## High Priority (Biggest Impact)

### 1. Component Memoization
- [ ] Add `React.memo()` to TaskCard.jsx
- [ ] Add `React.memo()` to Quadrant.jsx
- [ ] Add `React.memo()` to TaskModal.jsx
- [ ] Add `React.memo()` to HelpModal.jsx
- [ ] Wrap callbacks with `useCallback` in parent components

**Impact:** 40-50% reduction in re-renders, especially during drag operations

### 2. Code Splitting (Bundle is 526KB)
- [ ] Lazy load emoji-picker (only when modal opens) ~100KB savings
- [ ] Lazy load GoalBoard (separate route)
- [ ] Dynamic import HelpModal (rarely used)

**Impact:** ~50% bundle size reduction, faster initial load

### 3. Split Monolithic App.jsx ~~(2,825 lines)~~ → 1,802 lines
- [x] Use extracted TaskCard, Quadrant, TaskModal, HelpModal components
- [x] Remove duplicate inline component definitions
- [x] Import shared utilities (getAutoIcon, quadrantConfig, Q1_OVERLOAD_THRESHOLD)
- [ ] Extract Header/Toolbar component
- [ ] Create modal management context or hook
- [ ] Consolidate modal state (10+ useState → single object)

**Impact:** Maintainability, easier testing, reduced cognitive load
**Progress:** Reduced from 2,825 → 1,802 lines (36% reduction, 1,023 lines removed)

---

## Medium Priority

### 4. localStorage Write Batching
- [ ] Consolidate 5+ separate useEffect hooks into single debounced write
- [ ] Consider using a single state object for persistence

**Impact:** ~60% reduction in disk I/O

### 5. Memoize Computed Values
- [ ] Wrap `getAutoIcon()` in useMemo (recalculates on every keystroke)
- [ ] Memoize task filtering/sorting results
- [ ] Cache quadrant task lists

**Impact:** 20-30% render reduction

### 6. Tailwind CSS Optimization
- [ ] Switch from CDN to PostCSS build
- [ ] Configure PurgeCSS to remove unused classes

**Impact:** 50-70% CSS size reduction

---

## Lower Priority

### 7. Font Loading Strategy
- [ ] Add `font-display: swap` for faster fallback
- [ ] Load only default fonts, rest on demand
- [ ] Move Google Fonts link to index.html (from useEffect)

### 8. Drag-and-Drop Efficiency
- [ ] Batch drag position updates with requestAnimationFrame
- [ ] Only commit state on drop

### 9. Virtualization for Large Task Lists
- [ ] Implement react-window or similar for 100+ tasks

### 10. Error Boundaries
- [ ] Add error boundaries around modals and major sections

---

## Completed Optimizations

### Already Implemented
- [x] Custom hooks for logic isolation (useTasks, useLocalStorage, useUndoRedo)
- [x] useCallback usage in hooks (13+ callbacks in useTasks.js)
- [x] Ref-based optimization for drag state (isDraggingRef)
- [x] Extracted TaskCard, Quadrant, TaskModal, HelpModal components
- [x] Conditional rendering for modals (return null when closed)

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Bundle size (gzip) | 135.30 KB | <70 KB |
| App.jsx lines | 1,802 | <500 |
| Components with memo | 0 | 4+ |
| localStorage writes/action | 5+ | 1 |
