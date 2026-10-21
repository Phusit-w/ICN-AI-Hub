// "Find what others shared" filters, used by the Agents and Workflows pages. The active one lives in `?filter=`.
export const SHARE_FILTERS = [
  { id: 'popular', label: 'ยอดนิยมในองค์กร' },
  { id: 'shared', label: 'แชร์ให้ฉัน' },
]

/** The active filter id from the URL, or null. */
export const shareFilterFrom = (params) => (SHARE_FILTERS.some((f) => f.id === params.get('filter')) ? params.get('filter') : null)

// Workflows have no share level yet; they are visible company-wide.
const shareOf = (item) => item.share ?? 'company'

/**
 * Agents or Workflows matching `filter` for user `me`, most used first. No filter returns `items` unchanged.
 * - popular: shared with the whole company
 * - shared: made by someone else and shared with me (company-wide, or with my department)
 */
export function applyShareFilter(items, filter, me) {
  if (!filter) return items
  const keep = filter === 'popular'
    ? (x) => shareOf(x) === 'company'
    : (x) => x.owner !== me.id && (shareOf(x) === 'company' || (shareOf(x) === 'department' && x.dept === me.dept))
  return items.filter(keep).sort((a, b) => b.uses - a.uses)
}
