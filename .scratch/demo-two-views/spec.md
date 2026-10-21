# Spec: เดโมที่ดูเหมือน ICN จริง และสลับมุมมองผู้ใช้ทั่วไป / แอดมินได้

Status: ready-for-agent

## Problem Statement

เดโม ICN AI Hub ใช้นำเสนอผู้บริหาร แต่หลายจุดทำให้คนดูสะดุดว่า "นี่ไม่ใช่ ICN":

- **ตัวเลขขัดกันเอง** หน้าภาพรวมบอกว่าเดือนนี้มี 1,480 งาน แต่ Agent ตัวเดียวถูกใช้ไป 12,840 ครั้ง Skill ตัวเดียว 15,400 ครั้ง และ IT Support Agent 11,420 ครั้ง ทั้งที่ฝ่าย IT มีคนเดียว
- **ระบบที่เชื่อมต่อเป็นของบริษัทใหญ่** (Salesforce, SAP, ServiceNow, Confluence) ซึ่ง ICN อาจไม่ได้ใช้
- **คะแนนดาว 4.x** ไม่มีความหมายเมื่อมีผู้ใช้แค่ราว 25 คน
- **การกำกับดูแลเป็นแบบองค์กรใหญ่** มี 4 บทบาท มีทีม "AI CoE" มีตารางอันดับตัวบุคคล และ audit log มี "Unknown device" ทั้งที่ทุกคนต้อง login
- **Model ให้เลือก 6 ตัว** บน GPU server เครื่องเดียว
- **ทุกคนเห็นทุกอย่าง** ผู้ใช้ทั่วไปเห็นหน้าค่าใช้จ่าย นโยบาย ตัวเลือก Model และปุ่ม "ขั้นสูง" ซึ่งเป็นงานของแอดมิน และตอนนำเสนอก็ไม่มีทางแยกให้ผู้บริหารเห็นว่าพนักงานเห็นอะไร แอดมินเห็นอะไร

## Solution

เดโมเล่าภาพเดียว: **ICN หลังเปิดใช้ประมาณ 3 เดือน มี User ราว 25 คนจากพนักงาน ~60 คน** ตัวเลขทุกตัวสอดคล้องกับภาพนี้

- **สองมุมมอง** สลับได้ที่เมนูโปรไฟล์ด้านล่าง sidebar เปิดเว็บมาเป็นมุมมอง **User** (ผู้ใช้ทั่วไป)
  - **User**: ใช้งาน สร้าง Agent และ Workflow แบบง่าย แชร์ระดับแผนก บันทึกไว้ใช้ซ้ำ ไม่เห็นหน้าภาพรวมและการกำกับดูแล ไม่เห็นตัวเลือก Model ไม่เห็นปุ่ม "ขั้นสูง"
  - **Admin** (แอดมิน): เห็นทุกอย่างที่ User เห็น บวกหน้าภาพรวมและการกำกับดูแล ปุ่ม "ขั้นสูง" กล่อง **Company sharing request** ให้อนุมัติหรือส่งกลับ และสรุป **Feedback** ของทุก Agent
- **บทบาทเหลือ 2** คือ User กับ Admin ไม่มี AI CoE แล้ว Admin เป็นคนอนุมัติการแชร์ทั้งบริษัท
- **Feedback 👍/👎** ใต้ Artifact แทนคะแนนดาว กด 👎 แล้วบอกเหตุผลสั้นๆ ได้ หน้า Agent แสดง "มีประโยชน์ 92% จาก 38 ครั้ง"
- **ระบบที่เชื่อมต่อ** ใช้ชื่อกลาง: ระบบบัญชี (ERP), โฟลเดอร์กลางของบริษัท, อีเมลบริษัท
- **Model** เหลือ Local 1 ตัว (ภาษาไทยดี บน GPU server ของบริษัท) กับ Claude ระบบเลือกให้เองตามความลับของข้อมูล
- **ไม่มีอันดับตัวบุคคล** ใช้ "Agent ที่มีประโยชน์ที่สุดเดือนนี้" ที่บอกแผนกแทน
- **ลูกเล่นใหม่ 2 อย่าง**: ตัวอย่าง Artifact ที่เป็นเอกสาร Word มีหัวกระดาษ ICN และแจ้งเตือนเมื่อ Run ที่ใช้เวลานานทำเสร็จ

## User Stories

### สลับมุมมอง
1. As a presenter, I want to switch between the User view and the Admin view from the profile menu at the bottom of the sidebar, so that I can show management both sides without leaving the demo.
2. As a presenter, I want the demo to open in the User view, so that the first thing management sees is what an ordinary employee sees.
3. As a presenter, I want the name and title at the bottom of the sidebar to change with the view, so that it's obvious whose eyes we are looking through.
4. As a presenter, I want switching view to keep me on the same page when that page exists in the new view, so that the story isn't interrupted.
5. As a presenter, I want switching to the User view while on the governance page to take me to new chat, so that I never land on a page the User can't see.
6. As a presenter, I want the chosen view to survive a page reload during the presentation, so that a refresh doesn't throw me back to the User view.
7. As a User, I want a direct link to the governance page to take me to new chat, so that an old or shared link never shows me admin pages.

### สิ่งที่ User เห็น
8. As a User, I want the sidebar to show only the menus I use every day, so that I'm not distracted by cost and policy pages.
9. As a User, I want no model picker anywhere, so that I don't have to understand which AI to choose; the system chooses for me based on data sensitivity.
10. As a User, I want the notice that confidential data is processed on internal AI to keep showing, so that I trust the system without choosing a model myself.
11. As a User, I want no "ขั้นสูง" button when making a Workflow or an Agent, so that I only see the simple way that's meant for me.
12. As a User, I want a link to the detailed Workflow builder to take me to the simple Workflow editor instead, so that I never land in the canvas.
13. As a User, I want to still create my own Agents and Workflows and share them with my department, so that the department's champion can build what everyone uses.
14. As a User, I want sharing with the whole company to send a Company sharing request to the Admin, so that I know it goes live only after approval.
15. As a User, I want to see that my Company sharing request is waiting, so that I'm not confused why colleagues outside my department can't find it yet.

### สิ่งที่ Admin เห็น
16. As an Admin, I want the governance page in the sidebar, so that I can check cost, usage and policies.
17. As an Admin, I want a list of pending Company sharing requests, so that I can review what people want to share with everyone.
18. As an Admin, I want to approve a Company sharing request with one click, so that the item becomes shared with the whole company.
19. As an Admin, I want to send a Company sharing request back, so that the maker can fix it before sharing.
20. As an Admin, I want an approved or sent-back request to leave the pending list and show up in the audit log, so that I have a record.
21. As an Admin, I want to see each Agent's Feedback (helpful % and number of verdicts), so that I know which Agents need attention.
22. As an Admin, I want to read the reasons people gave with 👎, so that I can tell the maker what to fix.
23. As an Admin, I want the "ขั้นสูง" buttons for the Workflow canvas and the step-by-step Agent form, so that I can build things with conditions and loops when needed.
24. As an Admin, I want the permissions table to show just two columns, User and Admin, so that the rules fit a company of our size.
25. As an Admin, I want the audit log to name a person for every event, so that the log never shows an unknown actor.
26. As an Admin, I want cost and requests broken down by the two models, so that I can see how much stays on internal AI.

### Feedback
27. As a User, I want 👍 and 👎 under each Artifact, so that I can say in one click whether it helped.
28. As a User, I want 👎 to let me type a short reason, optionally, so that the Agent's maker knows what went wrong.
29. As a User, I want to change my Feedback on an Artifact, so that a mis-click isn't permanent.
30. As a User, I want an Agent page to say "มีประโยชน์ X% จาก N ครั้ง" instead of stars, so that I can judge it by what colleagues actually said.
31. As a User, I want an Agent with no Feedback yet to say so instead of showing 0%, so that a new Agent doesn't look bad.
32. As a User, I want no star ratings on any card and no "sort by rating" option, so that the library isn't cluttered with numbers that don't mean much.
33. As a User, I want my Feedback to count in the Agent's summary right away, so that I see my click mattered.

### ตัวเลขที่สอดคล้อง
34. As a presenter, I want every number in the demo to fit "3 months after launch, ~25 Users", so that management doesn't catch a contradiction.
35. As a presenter, I want usage counts per Agent, Skill and Workflow in the tens to low hundreds, so that they fit 25 Users over 3 months.
36. As a presenter, I want versions mostly 1.x with short histories, so that they fit a 3-month-old platform.
37. As a presenter, I want the number of Users per department to add up to the total shown on the governance page, so that the figures agree.
38. As a presenter, I want the IT department's figures to fit a one-person team, so that it matches the real org chart.

### ระบบและ Model
39. As a presenter, I want connected systems named generically (accounting system (ERP), company shared folder, company email), so that nobody asks "since when do we use Salesforce?".
40. As a presenter, I want no ticketing system or CRM in the demo, so that we don't promise integrations ICN doesn't have.
41. As a presenter, I want only two models, one internal and Claude, so that it matches one on-premise GPU server plus one cloud provider.
42. As an Admin, I want the Agent's data-sensitivity setting to decide where it runs, so that confidential data never goes to the cloud without anyone having to choose a model.

### ไม่มีอันดับตัวบุคคล
43. As an employee, I want no leaderboard ranking people, so that a small company doesn't feel like a competition.
44. As an Admin, I want "Agent ที่มีประโยชน์ที่สุดเดือนนี้" showing each Agent's department, so that departments get credit for what they built.

### หัวกระดาษ ICN
45. As a User, I want a document Artifact's preview to show the ICN letterhead (logo, company name), so that I can see it's ready to send to a customer.
46. As a User, I want the letterhead only on documents, not on tables, images or chat answers, so that it appears where a real letterhead would.

### แจ้งเตือนเมื่องานเสร็จ
47. As a User, I want a notification when a Run that takes a while finishes while I'm on another page or another Thread, so that I don't have to watch it.
48. As a User, I want clicking that notification to open the Run's Thread, so that I get to the Artifact in one click.
49. As a User, I want no notification when I'm already looking at the Thread where the Run finished, so that I'm not told what I can see.
50. As a User, I want quick chat answers not to notify me, so that notifications stay meaningful.

## Implementation Decisions

- **View lives in the store.** The app store gains a `view` of `'user' | 'admin'` with a `setView` action, defaulting to `'user'`, persisted the same way other per-viewer UI state is persisted (the existing persistent-state helper). One selector answers "is this the Admin view?" and every page asks it rather than checking the view string itself.
- **The two views map to two fictional personas.** User view = the existing current user (Kanya S., Sales). Admin view = a new fictional persona in the IT department with an Admin title. No real ICN staff names (see memory rule: names must be made up and must not resemble someone on the org chart).
- **Route guarding is one place.** The governance route, and the detailed Workflow builder (`advanced=1`), redirect in the User view: governance → new chat, detailed builder → the simple editor for that Workflow. The step-by-step Agent form likewise falls back to quick create. Hiding a nav item is not enough; the routes themselves are guarded.
- **Roles and permissions data** shrink to two roles (User, Admin). The permissions table keeps its rows that still mean something and drops "Agent Creator" and "Department Admin". Everything that names "AI CoE" (owners, approvals, version history "by") becomes the Admin persona or a named fictional User.
- **Company sharing request** is a new piece of store state: a list of pending requests (item kind + id, requester, time). Choosing "ทั้งบริษัท" when sharing creates a request and leaves the item at department sharing until approved. Approve → item's share becomes company, request removed, audit entry added. Send back → request removed, audit entry added, item stays at department. Seed one or two pending requests so the Admin view has something to show.
- **Feedback** is store state keyed by Run: `{ verdict: 'up' | 'down', reason? }`. An Agent's summary (helpful %, count) is seeded per Agent plus the live Feedback on Runs that used that Agent. One function computes the summary so cards, Agent page and governance agree. The `rating` field and the "คะแนนสูงสุด" sort are removed everywhere (Agents, Skills, Workflows, drafts, reuse ranking). Reuse ranking that used rating falls back to uses/recency.
- **Mock data rescale** to "3 months after launch, ~25 Users": per-item uses in tens to low hundreds, versions mostly 1.x with 1–3 history entries, department User counts summing to the total, monthly cost history covering only the 3 months since launch. IT Support and other IT figures sized for one person. Coding Agent and Security Review Agent are removed (no developer team at ICN); anything that referenced them is re-pointed or removed.
- **Connected systems** become: web search, company shared folder, accounting system (ERP), company email draft, document generator, image generator, Python sandbox. ServiceNow and Salesforce are removed and any Agent, Skill, Workflow or example that used them is reworded (e.g. IT Support files a request by email draft instead of a ticket). Knowledge sources lose brand names (no Confluence).
- **Models** become three entries: Auto routing (the only thing a User ever sees, if anything), one internal Thai-capable model on the on-premise GPU, and Claude. Image generation stays an internal capability but is not a separately picked model. Governance's model breakdown shows the two real models.
- **Leaderboard** tab is replaced by "Agent ที่มีประโยชน์ที่สุดเดือนนี้": top Agents by Feedback, each with its department, no person ranking.
- **Audit log** entries all name a fictional User or the Admin; the "Unknown device" entry is reworded to a named User whose request was blocked by policy.
- **Letterhead** is part of the Artifact view for document Artifacts only: ICN logo and company name in a header band above the document body. Download remains simulated.
- **Run-finished notification** reuses the existing toast system. When a multi-Agent Run (not a chat Run) completes and the user is not viewing that Thread, a toast appears with a link that opens the Thread. No browser notifications.
- **Glossary terms** used throughout: User, Admin, Feedback, Company sharing request (already added to the glossary). UI copy uses the Thai labels from the glossary.

## Testing Decisions

- **Good tests** drive the app the way a person does and assert only what they can see: roles, accessible names, text, URL. No assertions on store shape, component names or CSS classes.
- **Seam 1: whole-app journeys** (existing harness, prior art: the journey tests for governance headline, nav and skills tab, shared items, tour). The harness gains one option to start in a given view, e.g. starting at the governance page in the Admin view. Journeys to cover:
  - switching view from the profile menu changes the sidebar menus and the name/title shown;
  - the User view has no governance menu, a direct governance link lands on new chat, no "ขั้นสูง" buttons, and no model picker;
  - the Admin view sees the governance page, approves a pending Company sharing request (it leaves the list and shows in the audit log) and sends one back;
  - a User shares with the whole company and sees it pending;
  - 👍/👎 under an Artifact, 👎 with a reason, changing the verdict, and the Agent page summary updating;
  - no star ratings or rating sort anywhere in the Agents library;
  - a document Artifact shows the ICN letterhead, a chat answer doesn't;
  - a long Run finishing while the user is on another page shows a toast that opens the Thread; none while watching it.
- **Seam 2: mock-data consistency** (new, small). A test reads the mock data modules and checks the story holds: every item's uses fit within total Runs since launch, department User counts sum to the total, no rating fields remain, no brand-name systems (Salesforce, SAP, ServiceNow, Confluence) remain, every owner/actor resolves to a known fictional persona, and only the agreed models exist.
- Existing journey tests that assert old numbers, ratings, four roles or the leaderboard are updated to the new behaviour, not deleted.

## Out of Scope

- Saving Artifacts to a project folder (waits until we know which file storage ICN actually uses).
- Real login, real role enforcement on a server, or real model routing; this is a presentation demo.
- Real file downloads with a letterhead; download stays simulated.
- Browser or email notifications.
- Department admin / champion as a separate role.
- Any change to the ICN brand styling.

## Further Notes

- The demo is for presentation only; when ICN decides to use it for real, numbers, systems and roles get revisited against reality.
- All staff names must be fictional and must not resemble anyone on the ICN org chart.
- After implementing, republish the shared demo link (see the artifact memory for the recipe).
