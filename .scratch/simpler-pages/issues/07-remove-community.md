# 07: Remove the Community page and make "ใช้งาน" the way to use shared items

**What to build:** The Community page goes away, and its old route redirects to the Agents page with the "popular" filter on.
- The Agents library and the Workflows page each get a single row of filter chips: "ยอดนิยมในองค์กร" and "แชร์ให้ฉัน".
- The primary action on every shared item is "ใช้งาน", which takes the user to the composer with that Agent or Workflow picked.
- A shared Workflow is used as-is: there is no copy or fork action for shared Workflows anywhere.
- Copying a shared Agent stays available as a secondary action on its detail page.
- The contributor leaderboard moves into the contributors tab of the governance page.

Spec: `.scratch/simpler-pages/spec.md` (stories 29, 35–36, 39, 43, 46, 53; decision "Remove the Community page").

**Blocked by:** 05, 06

**Status:** ready-for-agent

- [ ] Journey test: the old community link lands on the Agents page with the "popular" filter on
- [ ] Journey test: from Home, finding a shared Agent and using it takes ≤ 2 clicks (journey 5), and the same for a shared Workflow
- [ ] "ใช้งาน" on a shared Workflow picks it in the composer and never creates a copy
- [ ] The governance contributors tab shows the leaderboard
- [ ] No link anywhere (menu, search, tour, pages) still points to the community page
- [ ] The filter chips are in one row and show which one is active
