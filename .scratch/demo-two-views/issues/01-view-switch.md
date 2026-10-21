# 01: Switch between the User and Admin views, and guard Admin-only pages

**What to build:** A presenter switches between the User view and the Admin view from the profile menu at the bottom of the sidebar. The demo opens in the User view and remembers the chosen view across a reload. The name and title at the bottom of the sidebar follow the view: the existing current user in the User view, a new fictional Admin persona (IT department) in the Admin view. The User view has no governance menu, no "ขั้นสูง" buttons (Workflow canvas, step-by-step Agent form) and no model picker anywhere. Direct links are guarded too: the governance page sends a User to new chat, the detailed Workflow builder sends a User to the simple editor for that Workflow, and the step-by-step Agent form falls back to quick create. Switching view keeps the current page when it exists in the new view. The journey harness gains an option to start in a given view.

Spec: `.scratch/demo-two-views/spec.md` (stories 1–13, 16, 23).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Profile menu switches view; the sidebar name/title changes with it
- [x] Opens in the User view; the chosen view survives a reload
- [x] User view: no governance menu, no "ขั้นสูง" buttons, no model picker; the confidential-data notice still shows
- [x] User view: a direct governance link lands on new chat; a detailed-builder link lands on the simple Workflow editor; the step-by-step Agent link lands on quick create
- [x] Switching to User while on governance lands on new chat; otherwise the page stays
- [x] Admin view sees the governance menu and the "ขั้นสูง" buttons
- [x] Admin persona's name is fictional and resembles no one on the ICN org chart
- [x] Journey harness can start in the Admin view; journeys cover all of the above; existing journeys that visit governance start as Admin

## Open questions (after implementation, 2026-10-21)

Resolved in ticket 02:

- **Admin persona name:** renamed to "Kittipong W." (IT Administrator), checked against page 3 of the org chart.
- **Skill quick create:** hidden in the User view too; `/skills/new?advanced=1` falls back to quick create.
- **Ownership:** `state.userId` follows the view, so what the Admin makes belongs to the Admin, and the Admin's company-wide sharing needs no request.
