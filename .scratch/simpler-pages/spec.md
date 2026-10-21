# Spec: ทุกหน้าใช้ง่าย คลิกน้อย และ Clean

Status: resolved

## Problem Statement

พนักงานที่ไม่เก่ง AI เปิด ICN AI Hub แล้วต้องคิดเยอะและคลิกเยอะกว่าที่ควร:

- การใช้ **Workflow** เดิมซ้ำต้องออกจาก Home ไปหน้าสายงาน กด "ใช้งาน" แล้วจึงพิมพ์ได้ ส่วน **Favourite agent** กดแล้วก็พาออกจาก Home ไปหน้าอื่น
- ใน Workspace ผู้ใช้ต้องเลือกเองว่าจะใช้โหมด "แชต" หรือ "Workflow" ก่อนพิมพ์ ทั้งที่ไม่รู้ว่าต่างกันอย่างไร และคำว่า Workflow ตรงนี้ก็ไม่ได้หมายถึงสายงานที่บันทึกไว้
- ของที่คนอื่นแชร์กระจายอยู่ 3 ที่ (ผู้ช่วย AI, ทักษะ, ชุมชน) และหน้าชุมชนมีปุ่มหลักเป็น "คัดลอก" ทั้งที่ Workflow ที่แชร์มาควรใช้ได้ทันทีโดยไม่ต้องคัดลอก
- หลายหน้ามีปุ่มระดับเดียวกันหลายปุ่ม ตัวเลขที่ไม่ช่วยตัดสินใจ และกรอบซ้อนกรอบ เช่น หลังงานเสร็จมีปุ่มเท่ากัน 5 ปุ่ม ทำให้หน้าดูรกและไม่รู้ว่าควรกดอะไร
- เมนูหลักมี 7 รายการ บางรายการ (ทักษะ, ชุมชน) ผู้ใช้ทั่วไปแทบไม่ได้ใช้

## Solution

ทำให้ทุกหน้าเข้าใจได้เองโดยไม่ต้องเปิด tour มีงานหลักชัดเจนหนึ่งอย่างต่อหน้า และงานที่ทำบ่อยใช้จำนวนคลิกไม่เกิน **click budget** ที่กำหนด:

| Journey (นับจาก Home ไม่รวมการพิมพ์) | เป้า |
|---|---|
| 1. สั่งงานใหม่จนได้ Artifact | ≤ 2 คลิก (คลิกที่ 2 เฉพาะกรณีต้องยืนยัน Plan) |
| 2. ใช้ Favourite agent หรือ Workflow ซ้ำ | 1 คลิก และไม่เปลี่ยนหน้า |
| 3. เปิดดูผลงานเก่า | 1 คลิก |
| 4. สร้าง Agent | ≤ 3 คลิก |
| 5. หา Agent หรือ Workflow ที่คนอื่นแชร์แล้วใช้งาน | ≤ 2 คลิก |

สิ่งที่เปลี่ยนในมุมผู้ใช้:

- **เมนูหลักเหลือ 5 รายการ** คือ หน้าหลัก · สั่งงาน AI · สายงาน · ผู้ช่วย AI (มี tab ทักษะอยู่ข้างใน) · ภาพรวมและการกำกับดูแล (อยู่ล่างสุด แยกจากเมนูงาน)
- **Home** มีช่องสั่งงาน ใต้ช่องมีแถว "ใช้ซ้ำ" ที่รวม Favourite agent กับ Workflow ที่ใช้บ่อยหรือเพิ่งใช้ กดแล้วเติมลงในช่องสั่งงานทันที และมีรายการ "งานของฉัน"
- **Workspace** ไม่มีตัวสลับโหมด ระบบตัดสินใจเองว่าจะตอบแบบแชตหรือเสนอ Plan ให้หลายผู้ช่วยทำ
- **ของที่แชร์** อยู่ในแต่ละ library ผ่านตัวกรอง "ยอดนิยม / แชร์ให้ฉัน" และปุ่มหลักคือ "ใช้งาน" เสมอ
- **ทุกหน้าใช้กฎ Clean**:
  1. หนึ่งหน้ามีปุ่มหลักปุ่มเดียว
  2. แสดงเฉพาะข้อมูลที่ช่วยตัดสินใจ
  3. ไม่มีกรอบซ้อนกรอบ

  สไตล์และสีแบรนด์ ICN คงเดิม

## User Stories

### Home
1. As an employee, I want the command box to be the first thing I see on Home, so that I can start work without looking around.
2. As an employee, I want a "reuse" row under the command box that shows my Favourite agents and the Workflows I use most or used recently, so that the things I repeat are always at hand.
3. As an employee, I want clicking a Favourite agent in the reuse row to fill it into the command box without leaving Home, so that I only have to type and send.
4. As an employee, I want clicking a Workflow in the reuse row to fill it into the command box without leaving Home, so that I can reuse a Workflow in one click.
5. As an employee, I want to see clearly which Agent or Workflow is filled into the command box and remove it with one click, so that I can go back to letting the system choose.
6. As an employee, I want sending from Home with a chosen Agent or Workflow to start the Run straight away, so that I don't have to confirm something I already chose.
7. As an employee, I want to see my 3–5 latest Runs on Home, running ones first, so that I can follow up on work in one click.
8. As a new employee with no Runs yet, I want small example task chips under the command box, so that I know what kind of things I can ask for.
9. As an employee who already has Runs, I want the example task chips to disappear, so that Home stays clean.
10. As a first-time user, I want the welcome card to appear only once and to be dismissable, so that it doesn't take space every day.
11. As an employee, I want a short link to "see all" Runs and "all Agents", so that I can go further when I need to without those links competing with the command box.

### Workspace
12. As an employee, I want the system to answer short questions directly as chat, so that I don't have to choose a mode first.
13. As an employee, I want the system to propose a Plan when my request needs several Agents to produce an Artifact, so that I can see who will do what before it starts.
14. As an employee, I want to start a proposed Plan with one click on "เริ่มเลย", so that confirming takes no effort.
15. As an employee, I want to be able to edit the Plan before starting it, so that I can remove a step I don't need.
16. As an employee who picked an Agent or Workflow myself, I want the Run to start immediately without a Plan confirmation, so that I'm not asked twice.
17. As an employee, I want to see step chips in the Thread while a multi-Agent Run is working, so that I know which Agent is working now.
18. As an employee, I want to open "ดูขั้นตอน" as a panel on the right side of the Thread, so that I can see how the Agents handed work to each other without leaving the conversation.
19. As an employee, I want to close the step panel with one click, so that I can get back to a clean Thread.
20. As an employee, I want "ดาวน์โหลด" to be the single primary action under a finished Artifact, so that the most common next step is obvious.
21. As an employee, I want "บันทึกไว้ใช้ซ้ำ" visible as a secondary action under a finished Artifact, so that I can turn work that went well into something reusable.
22. As an employee, I want copy, share and "ดูขั้นตอน" grouped in a "⋯" menu, so that the area under the Artifact isn't crowded.
23. As an employee, I want something I save for reuse to show up in the reuse row on Home, so that I can use it again next time in one click.
24. As an employee, I want to collapse and expand the Thread history on the left, so that I have room when I focus on one Thread.
25. As an employee, I want sensitive-data notices to keep showing that the data is processed on internal AI, so that I trust the system without needing to ask.

### Navigation and search
26. As an employee, I want the main menu to have only 5 items, so that I can find my way quickly.
27. As an employee, I want the governance menu kept at the bottom, separate from my daily work menus, so that the menu matches what I use every day.
28. As an employee, I want global search results for Skills and Workflows to open in their new places, so that search never leads me to a page that no longer exists.
29. As an employee with an old link to the community page, I want to land on the Agents page with the "popular" filter on, so that old links don't break.
30. As an employee with an old link to the Skills page or to a specific Skill, I want to land on the Skills tab of the Agents page, with that Skill open, so that shared demo links keep working.
31. As an employee on mobile, I want the menu, Home and Workspace to still work and not overflow sideways, so that I can check work away from my desk.

### Agents and Skills library
32. As an employee, I want each Agent card to show only an icon, name, one line of description and a "ใช้งาน" button, so that I can choose quickly.
33. As an employee, I want clicking anywhere on an Agent card except the button to open its details, so that I don't have to aim at a small name link.
34. As an employee, I want the Favourite star to appear when I hover a card, so that I can star an Agent without the star cluttering every card.
35. As an employee, I want "popular in the organization" and "shared with me" filter chips in one row at the top, so that finding what others made takes one click.
36. As an employee, I want "ใช้งาน" on a shared Agent to take me to the composer with that Agent picked, so that I can use it without copying it.
37. As an employee, I want advanced filters hidden by default, so that the page stays clean.
38. As an employee, I want the numbers like uses, rating and version shown on the detail page instead of on the card, so that cards only show what helps me choose.
39. As an Agent builder, I want "คัดลอกไปปรับใช้" as a secondary action on the Agent detail page, so that I can still make my own version when I need to.
40. As an Agent builder, I want a "ทักษะ" tab inside the Agents page, so that I can find Skills where I build Agents.
41. As an Agent builder, I want to open a Skill's detail and add it to several Agents from the Skills tab, so that the existing Skill flow keeps working in its new place.

### Workflows
42. As an employee, I want each Workflow card to follow the same clean card shape as Agent cards, with "ใช้งาน" as the button, so that the libraries feel the same.
43. As an employee, I want "ใช้งาน" on a Workflow to take me to the composer with that Workflow picked, so that a shared Workflow is used as-is.
44. As an employee, I want the simple Workflow editor (ordering Agents up and down) to be the default, so that editing doesn't scare me.
45. As an advanced user, I want the detailed Workflow builder behind a quiet "ขั้นสูง" link, so that it doesn't compete with "บันทึก" and "ลองรัน".
46. As an employee, I want "popular / shared with me" filters on the Workflows page too, so that Workflows others shared are easy to find.

### Creating Agents and Skills
47. As an employee, I want to describe the Agent I need in plain language and have AI fill the form on one page, so that I can create an Agent in 3 clicks or fewer.
48. As an employee, I want the multi-step wizard kept behind "ตั้งค่าขั้นสูง", so that the default path stays short.
49. As an Agent builder, I want creating a Skill to work the same way (describe it, AI fills it, create), so that I don't have to learn two ways to create things.
50. As an employee, I want only one primary button on each creation page, so that it's obvious how to finish.

### Governance
51. As an administrator, I want 4 headline numbers at the top of the governance page (cost, number of Runs, share processed on local AI, policy alerts), so that I see the state of the organization at a glance.
52. As an administrator, I want detail tables such as the audit log and contributors in tabs below the numbers, so that the page isn't one long wall of tables.
53. As an administrator, I want the contributor leaderboard that used to be on the community page to live in governance, so that I can still see who is contributing.

### Tour and self-explanation
54. As a first-time user, I want each page to explain itself through clear labels, examples and empty states, so that I don't need the tour.
55. As a first-time user, I want the tour to have no more than 6 steps (command box, reuse row, my Runs, search, Agents, ready), so that it's short enough to finish.
56. As a first-time user, I want the tour never to point at something that no longer exists, so that it doesn't break or confuse me.
57. As an employee, I want empty states (no Runs, no favourites, no search results) to tell me the next thing to do, so that I'm never stuck on a blank page.

### Demo audience
58. As a contest judge watching the demo, I want the core journeys to flow without dead ends, so that I believe employees could really use it.

## Implementation Decisions

- **Domain language**: the vocabulary in `GLOSSARY.md` must be used everywhere, including UI text. The new term **Plan (แผนงาน)** means the list of Agents the system proposes for a Run when the user didn't pick an Agent or Workflow themselves. The word **Workflow** is used only for a saved Workflow, never for a view mode or a Plan.
- **Remove the Workspace mode toggle**: remove the chat/Workflow toggle, its persisted preference and its tour step. The rule for auto-start becomes one rule decided at the point where a Run is planned:
  - the planner returns a single chat step → start immediately
  - the user picked an Agent or a Workflow → start immediately
  - the system planned several Agents itself (including when it matched a Workflow by keyword, which is still a system decision) → stop at the Plan and wait for "เริ่มเลย"

  This changes current behaviour: the default chat mode used to auto-start system-planned multi-Agent Runs as well. The planner's rules for which Agents to choose don't change.
- **Step view as a side panel**: the pipeline view the toggle used to show becomes a panel on the right side of the Thread, opened from "ดูขั้นตอน" and closable. Step chips stay in the conversation while a Run is working.
- **Actions under a finished Artifact**: one primary action ("ดาวน์โหลด"), "บันทึกไว้ใช้ซ้ำ" as a secondary action, and the rest (copy, share, ดูขั้นตอน) in a "⋯" menu. This order applies to both chat Runs and multi-Agent Runs.
- **Reuse row on Home**: combines Favourite agents and Workflows that are used often or used recently, including ones the user just saved for reuse. Clicking an item sets the picked Agent or Workflow in Home's command box (same state shape as the Workspace composer: an Agent pick or a Workflow pick, never both). Sending carries the pick to the Workspace, where the Run starts immediately. Home's composer and the Workspace composer should share the logic for showing and clearing the pick instead of duplicating it.
- **Home structure**: the command box (with the reuse row) and "my Runs" (3–5 items, running first). The popular task grid becomes small chips that show only when the user has no Runs. The welcome card keeps its show-once rule.
- **Navigation**: the main menu has 5 items in this order: หน้าหลัก, สั่งงาน AI, สายงาน, ผู้ช่วย AI, and ภาพรวมและการกำกับดูแล as the bottom item in its own group.
- **Remove the Community page**: the community route redirects to the Agents page with the "popular" filter on. The Agents library and the Workflows page get a single row of filter chips, "ยอดนิยมในองค์กร" and "แชร์ให้ฉัน". The primary action on shared items is always "ใช้งาน". Copying a shared Agent stays as a secondary action on the Agent detail page. Copying a shared Workflow is no longer offered as a primary action anywhere, because a shared Workflow is used as-is. The contributor leaderboard moves into governance.
- **Skills become a tab of the Agents page**: the Agents page gets "ผู้ช่วย" and "ทักษะ" tabs, with the tab reflected in the URL so it can be linked. The old Skills route and its detail parameter redirect to the Skills tab with the same Skill open. Creating a Skill is still reachable from the Skills tab. Links that pointed to the Skills page (global search, Agent detail, Skill creation flow, and any others) point to the new place.
- **Card shape**: Agent and Workflow cards show an icon, name, one-line description and a "ใช้งาน" button. The whole card opens details, and the Favourite star appears on hover and on keyboard focus. Uses, rating and version move to the detail pages.
- **Workflow editing**: the simple editor is the default. The detailed builder is reached through a low-emphasis "ขั้นสูง" link instead of a button next to "บันทึก" and "ลองรัน".
- **Creation pages**: Create Agent keeps its one-page "describe → AI fills → create" flow with the wizard behind "ตั้งค่าขั้นสูง". Create Skill moves to the same pattern. Each creation page has exactly one primary button.
- **Governance layout**: 4 headline numbers at the top (cost, number of Runs, share processed on local AI, policy alerts), and details (audit log, contributors and the rest) in tabs below.
- **Tour**: at most 6 steps: command box, reuse row, my Runs, search, Agents, ready. Every step targets an element that exists after this change.
- **Clean rules for every page**:
  1. one primary (brand-coloured) button per page
  2. show only information that helps the user decide
  3. use spacing, not nested bordered cards, to separate sections

  Brand colours, fonts and corner radius don't change.
- **Accessibility**: actions that appear on hover (the Favourite star) must also appear on keyboard focus. Moving actions into "⋯" must keep accessible names. Tabs use proper tab roles.

## Testing Decisions

- **One seam: whole-app journey tests.** Render the whole app inside an in-memory router starting at Home, then drive it like a user would, with clicks and typing. Each test asserts that the journey finished (for example an Artifact is shown, or the command box shows the picked Workflow) **and** that the number of clicks stayed within the journey's click budget. A small helper counts clicks so the budget is part of the assertion.
- **What a good test is**: it only checks what the user can see and do (roles, accessible names, visible text, the current URL). It doesn't reach into the store, component state or file structure, so moving code around inside the app doesn't break it.
- **What to cover**:
  - the 5 journeys in the click budget table
  - chat vs Plan: a short question answers directly, a multi-Agent request stops at the Plan, and a picked Agent or Workflow starts immediately
  - the reuse row fills the command box and the URL stays on Home
  - the main menu has exactly 5 items
  - the old community and Skills links (including a Skill detail link) land in the right place
  - saving a Run for reuse makes it appear in the reuse row
  - every tour step's target exists on its page
- **Tooling**: add Vitest, React Testing Library, user-event and jsdom as dev dependencies, and an `npm test` script. Runs advance on timers, so tests use fake timers to move Runs to completion. Saved state lives in browser storage, so it's cleared between tests so each test starts from the default mock data.
- **Prior art**: none. The repo has no tests yet. The first ticket should set up the tool and write journey tests for the **current** behaviour first (they should pass against today's app, with the budget assertions that currently fail marked as expected to fail), so later tickets can turn them green one by one.
- **Not automated**: the Clean visual rules are checked by eye during `/code-review` and by opening the running app. A visual rule written as a test would be brittle and catch little.

## Out of Scope

- A new visual style (colours, fonts, corner radius, illustrations). If wanted later, explore it separately with `/prototype`.
- Changing the planner's rules for which Agents to pick for a request, beyond the auto-start rule above.
- Real backend, real authentication or real downloads. This stays a mock-data prototype.
- Mobile-first redesign. Mobile only has to keep working.
- Permissions or roles for the governance page.
- Versioning or forking of Workflows. Shared Workflows are used as-is.

## Further Notes

- Decisions come from a `/grill-with-docs` session (questions Q1–Q22). The term Plan was added to `GLOSSARY.md` during that session.
- There is a shared demo link of this prototype, so old routes must keep working through redirects.
- `docs/DESIGN.md` describes the sitemap with 7 menus and the community page. Update it to match once the work lands.
- No ADR was written. Every decision is easy to reverse in a prototype.

## Later changes (2026-10-21, after this spec was resolved)

- Chat history moved into the main sidebar, and the top bar became a quiet bar, as in ChatGPT, Claude and Gemini.
- Home was merged into the new-chat screen, which the app now opens on. It has the greeting, the composer, the "ใช้ซ้ำ" row and the first-visit card. The menu is now "แชตใหม่" plus 3 items, and "งานของฉัน" is replaced by the sidebar's chat history. Journey 3 opens a past Run from that history in 1 click. The tour has 5 steps.
- Removed:
  - the notification bell, which did nothing
  - the Favourites chip row on the Agents page, which repeated the "ใช้ซ้ำ" row
  - recommendations shown before the user says what the job is
