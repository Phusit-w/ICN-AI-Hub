# 05: Five-item main menu, with Skills as a tab of the Agents page

**What to build:** The main menu has 5 items, in this order: หน้าหลัก, สั่งงาน AI, สายงาน, ผู้ช่วย AI, and ภาพรวมและการกำกับดูแล as the bottom item in its own group.

The Agents page gets "ผู้ช่วย" and "ทักษะ" tabs, and the tab is reflected in the URL so it can be linked.
- Everything the Skills page did works from the Skills tab: browse, open a Skill's detail, add a Skill to several Agents, and start creating a Skill.
- Old Skills links, including links to a specific Skill, redirect to the Skills tab with that Skill open.
- Global search, Agent detail and any other links to Skills point to the new place.

The community page stays reachable until ticket 07 removes it, but it is no longer in the main menu.

Spec: `.scratch/simpler-pages/spec.md` (stories 26–28, 30, 40–41; decisions "Navigation" and "Skills become a tab of the Agents page").

**Blocked by:** 01

**Status:** resolved

- [ ] Journey test: the main menu has exactly 5 items, in the order above
- [ ] Journey test: an old Skills link lands on the Skills tab of the Agents page
- [ ] Journey test: an old link to a specific Skill lands on the Skills tab with that Skill open
- [ ] Global search results for Skills open in the Skills tab
- [ ] Adding a Skill to several Agents still works from the Skills tab
- [ ] The tabs use proper tab roles and work from the keyboard
- [ ] The collapsed icon-only menu and the mobile menu show the same 5 items
