# 02: Two roles and the Company sharing request

**What to build:** Roles shrink to User and Admin. A User who shares an Agent, Skill or Workflow with the whole company creates a Company sharing request: the item stays shared with the department and shows as waiting for approval. In the Admin view, the governance page lists pending requests; the Admin approves one (the item becomes shared with the company) or sends it back (it stays at department), and either decision leaves the list and is written to the audit log. The permissions table shows two columns. "AI CoE" disappears everywhere: owners, approvals and version history name the Admin or a fictional User. Seed one or two pending requests so the Admin view has something to show.

Spec: `.scratch/demo-two-views/spec.md` (stories 14, 15, 17–20, 24).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Sharing with the whole company as a User shows "รออนุมัติ" and the item stays at department sharing
- [ ] Admin sees pending requests with requester, item and time
- [ ] Approve: item becomes company-shared, request leaves the list, audit log gains an entry
- [ ] Send back: item stays at department, request leaves the list, audit log gains an entry
- [ ] Permissions table has exactly two columns, User and Admin
- [ ] No "AI CoE" text anywhere in the app
- [ ] Journeys cover a User request and both Admin decisions
