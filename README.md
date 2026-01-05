# Multi-Select Dropdown Component

**Deck Selection Protocol — Take Home Assignment**  

A multi-select dropdown that handles 10,000+ items with fuzzy search, virtual scrolling, and full keyboard support.

---

## Setup

```bash
npm install
npm run dev
npm test  # Run accessibility tests
```

Open [http://localhost:3001](http://localhost:3001)

---

## Design & Reasoning

### 1. Ordering Logic

Selected items always appear first, followed by unselected items. When searching, selected items stay pinned at the top while unselected items are filtered and ranked by fuzzy match score via fuse.js (threshold 0.3). This design prioritizes visibility—you can always see and manage selections without scrolling, even while searching.

The ordering happens in a useMemo that splits items into two arrays: selected and unselected. If there's a search query, fuse.js filters and scores only the unselected items, then we concatenate selected + searched.

The test dataset includes realistic Deck use cases: vendors (AWS, Stripe, Salesforce), merchants (Uber, Starbucks, Delta), corporate cards, expense categories, departments, cost centers, projects, and GL codes.

### 2. Keyboard Shortcuts & Focus

Uses a **virtual focus index** separate from DOM focus. The input field keeps actual DOM focus for typing, while a state variable tracks which list item appears focused. Arrow keys update this index and scroll the virtualized list. `aria-activedescendant` points to the focused item for screen readers.

**Shortcuts:**
- ↑/↓: Navigate list items
- ←/→: Navigate between selection chips
- Enter/Space: Toggle selection
- Backspace/Delete: Remove chips
- Escape: Close dropdown
- Focus management: Dropdown closes when focus leaves the component entirely (input, chips, or list)

### 3. Performance Strategy

**Virtual Scrolling:** Uses react-virtualized to render only ~20-30 visible items at a time regardless of dataset size. With 10k items, we render a tiny fraction and let the library handle scroll positioning. AutoSizer manages responsive width.

**Fuzzy Search:** fuse.js searches across label and group fields with a 0.3 threshold, returning scored results. It's headless and fast enough for real-time filtering.

**Dependencies:** fuse.js (~24KB) and react-virtualized (~90KB) are single-purpose libraries. Could swap react-virtualized for react-window (~7KB) in production, but chose stability for this assignment.

**Styling:** Uses BEM (Block Element Modifier) CSS methodology instead of utility frameworks. This avoids initial CSS bloat and keeps the component self-contained with clear, maintainable styles in a single CSS file.

### 4. Accessibility Approach

Follows WAI-ARIA Combobox and Listbox patterns:
- Container: `role="combobox"` with `aria-expanded`, `aria-haspopup`
- List: `role="listbox"` with `aria-multiselectable`
- Items: `role="option"` with `aria-selected`
- Active item announced via `aria-activedescendant`

All interactive elements have descriptive `aria-label` attributes. Visual focus indicators (blue rings) are distinct from hover states following contrast designs of a11y. Fully functional with keyboard only—no mouse required.

**Testing:** Includes jest-axe tests to catch accessibility violations automatically. During development, axe caught several violations (invalid `aria-controls` when dropdown was closed, improper ARIA roles on chips) that were fixed before submission. Given the importance of a11y in financial software (compliance requirements, diverse user needs), automated testing ensures ARIA attributes are valid and no violations slip through.

### 5. What I'd Improve With More Time

**Testing:** Unit tests for ordering logic, integration tests for keyboard flows, a11y audits with real screen readers.

**Performance:** Web Workers for search on 50k+ datasets, progressive loading, better scroll optimization.

**Features:** Group separators in dropdown, custom chip designs, bulk actions like select all from search results, multi-select dropdown items, saved filters, async data loading.

---
