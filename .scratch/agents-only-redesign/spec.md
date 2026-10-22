# Spec: ผู้ช่วย AI อย่างเดียว + หน้าแรกแบบ Qwen

Status: ready-for-agent

ที่มา: grill ใน `.scratch/agents-only-redesign/grill-notes.md` · ADR `docs/adr/0001-no-separate-workflow.md` · หน้าออกแบบ (เลือกแบบ A): https://claude.ai/artifact/Ro8hpFzGuiKsFuYWabc5kc

## Problem Statement

พนักงาน ICN ส่วนใหญ่ไม่ถนัด AI แต่ ICN AI Hub ให้เรียนรู้ของที่สร้างและใช้ซ้ำได้สองแบบ คือ **ผู้ช่วย AI** (Agent) กับ **สายงาน** (Workflow) โดยไม่รู้ว่าต่างกันอย่างไรและควรใช้อันไหน คำว่า "สายงาน" ในองค์กรไทยยังอ่านเป็น "ฝ่าย/แผนก" ซึ่งชนกับแนวคิดผู้ช่วยของแต่ละแผนก ทั้งที่สิ่งที่คนอยากได้จริงคือเอาผู้ช่วยของตัวเองหรือของแผนกมาต่อกันทำงานหลายขั้น

การสร้างผู้ช่วยก็ยังยาก: ต้องบรรยายในช่องเดียวหรือกรอก wizard 6 หน้า คุยกับ AI เพื่อคิดว่าผู้ช่วยควรเป็นแบบไหนไม่ได้ และดึงความรู้ของผู้ช่วยที่แผนกมีอยู่แล้วมาช่วยเขียนไม่ได้

หน้าตาโดยรวมยังไม่คุ้นมือเท่า ChatGPT, Gemini, Claude หรือ Qwen ที่พนักงานเคยใช้ ช่องพิมพ์ไม่มีปุ่มพูด และสีม่วงครามไม่ใช่สีของบริษัท

## Solution

ผู้ใช้เจอแนวคิดเดียวคือ **ผู้ช่วย AI** เหมือน GPTs, Gems หรือ Projects:

- ผู้ช่วยตัวไหนก็มี **ขั้นตอน** (Step) ได้ แต่ละขั้นส่งงานให้ผู้ช่วยอีกตัวตามลำดับ เช่น "ทำใบเสนอราคา" = สรุป TOR → คำนวณราคา → ร่างหนังสือ ผู้ใช้เรียกใช้ผู้ช่วยที่มีขั้นตอนเหมือนผู้ช่วยทั่วไป ไม่มีหน้า "สายงาน" อีกต่อไป
- ผู้ช่วยทำงานร่วมกันได้ 2 ทาง: **ขั้นตอน** ที่บันทึกไว้ในผู้ช่วย และ **Plan** ที่ระบบเสนอเมื่อสั่งงานในแชต "บันทึกไว้ใช้ซ้ำ" ได้ผู้ช่วยเสมอ ถ้างานนั้นใช้ผู้ช่วยหลายตัว ผู้ช่วยใหม่จะมีขั้นตอนตาม Plan
- **ทักษะ** เป็นส่วนประกอบที่เลือกตอนสร้างผู้ช่วย ไม่มีเมนูหรือ tab ของตัวเอง
- สร้างผู้ช่วยได้ 2 ทาง: "บันทึกไว้ใช้ซ้ำ" หลังได้ผลงาน หรือปุ่ม "＋ สร้างผู้ช่วย" ในหน้าผู้ช่วย AI ซึ่งเปิด **หน้าสร้างผู้ช่วยแบบแชต** (แบบ GPT Builder): ซ้ายคุยกับ AI ขวาเป็นฟอร์มที่ AI กรอกให้ระหว่างคุยและแก้เองได้ทุกช่อง มีปุ่ม "✨ ให้ AI ช่วยเขียน" ที่ช่องคำสั่ง และพิมพ์ @ เรียกผู้ช่วยที่มีอยู่มาช่วยเขียนได้ wizard 6 หน้ายังอยู่สำหรับคนที่อยากตั้งค่าละเอียด
- หน้าแรกเป็น **แบบ A (เรียบแบบ Qwen)**: แถบซ้ายมี แชตใหม่ · ค้นหา · ผู้ช่วย AI · ประวัติแชต (+ ภาพรวมและการกำกับดูแลสำหรับ Admin) ตรงกลางมีคำทัก ช่องพิมพ์ทรงแคปซูล (＋ แนบไฟล์ · ช่องพิมพ์ · ไมค์ · ส่ง) และแถว "ใช้ซ้ำ"
- ปุ่มไมค์พูดแล้วได้ข้อความจริงในเบราว์เซอร์ที่รองรับ ถ้าไม่รองรับ ปุ่มจะไม่แสดง
- ธีมตามบริษัท: แดง ICN ใช้กับโลโก้เท่านั้น สีหลักของปุ่มและการกดเป็นกรมท่า

## User Stories

### แนวคิดเดียว: ผู้ช่วย AI
1. As an employee, I want only one kind of thing to build, use and share, called ผู้ช่วย AI, so that I don't have to learn the difference between an Agent and a Workflow.
2. As an employee, I want an Agent that does several stages of work to look and behave like any other Agent, so that I use it the same way.
3. As an employee, I want an Agent with Steps to show a small badge such as "3 ขั้นตอน" on its card, so that I know it will take longer than a one-step Agent.
4. As an employee, I want the main menu to have no "สายงาน" item, so that there is one place to find everything I can reuse.
5. As an employee with an old bookmark to the Workflows page, I want it to take me to the ผู้ช่วย AI page, so that my link still works.
6. As an employee, I want the Agents that used to be Workflows to keep their names, so that I can still find the ones I used before.
7. As an employee, I want my past Runs that used a Workflow to show as Runs of the matching Agent, so that my history still makes sense.
8. As an employee, I want search to find Agents with Steps the same way it finds any Agent, so that I don't search in two places.
9. As an employee, I want the composer's Agent picker and @ mention to list Agents with Steps too, so that I can pick them directly.
10. As an employee, I want the "ใช้ซ้ำ" row under the composer to show my Favourite agents and the Agents I use most or used recently, with or without Steps, so that what I repeat is at hand.
11. As an employee, I want clicking an Agent with Steps in the "ใช้ซ้ำ" row to fill it into the composer without leaving the page, so that reuse still takes 1 click.
12. As an employee, I want sending with an Agent with Steps I picked myself to start the Run straight away without a Plan to confirm, so that I'm not asked twice.

### ขั้นตอน (Steps)
13. As an Agent builder, I want a "ขั้นตอน" section at the end of the Agent form, empty by default with "＋ เพิ่มขั้นตอน", so that most Agents stay simple and multi-stage ones are still possible.
14. As an Agent builder, I want each Step to be another Agent I pick from the Agents I can use, so that I can reuse what my department already set up, such as the price list in the sales "คำนวณราคา" Agent.
15. As an Agent builder, I want to reorder and remove Steps, so that I can fix the order of work.
16. As an Agent builder, I want only Agents without Steps of their own to be offered as Steps, so that work never nests or loops back on itself.
17. As an employee running an Agent with Steps, I want to see each Step's progress in order in the Workspace, so that I know where the work is.
18. As an employee, I want each Step to receive what the Step before it produced, so that the final Artifact builds on every stage.
19. As an employee, I want a review Step that comes after a research Step to send the work back once when information is missing, so that the result is checked before I get it.
20. As an Agent owner, I want an Agent used as a Step to always run its latest version, so that updating a department Agent improves every Agent that uses it.
21. As an Agent owner deleting an Agent that other Agents use as a Step, I want to see which Agents use it before I confirm, so that I don't break someone's work by accident.
22. As an employee, I want an Agent whose Step points to a deleted Agent to say "ผู้ช่วยในขั้นตอนถูกลบแล้ว" and refuse to run until its owner fixes it, so that I don't get a half-done Artifact.
23. As an Agent owner whose Agent has a deleted Step, I want to see which Step is broken in the Agent form, so that I can replace or remove it.

### Plan และบันทึกไว้ใช้ซ้ำ
24. As an employee, I want the system to answer simple questions directly and propose a Plan only when my request needs several Agents, so that I don't choose a mode.
25. As an employee, I want a Plan that includes an Agent with Steps to show that Agent's Steps as separate stages, so that I see all the work before I press "เริ่มเลย".
26. As an employee, I want "บันทึกไว้ใช้ซ้ำ" after a one-Agent Run to save an Agent, so that I can do it again.
27. As an employee, I want "บันทึกไว้ใช้ซ้ำ" after a multi-Agent Run to save one Agent whose Steps are the Plan's Agents in order, so that the whole job becomes one thing I can reuse.
28. As an employee, I want an Agent saved from a Plan to have one level of Steps only, so that it can always be saved and run.

### สร้างผู้ช่วยแบบแชต
29. As an employee, I want a "＋ สร้างผู้ช่วย" button as the main action of the ผู้ช่วย AI page, so that I know where to start building one.
30. As an employee, I want the builder to open with an AI asking what kind of Agent I want, so that I can describe it in my own words.
31. As an employee, I want the form beside the chat to fill in name, description, instruction, Skills and Steps as I talk, so that I see the Agent take shape.
32. As an employee, I want to edit any field in the form myself, so that I stay in control of what the AI wrote.
33. As an employee, I want a "✨ ให้ AI ช่วยเขียน" button on the instruction field, so that I get a well-written instruction without knowing how to write prompts.
34. As an employee, I want to type @ in the builder chat to call an Agent I can use, such as @HR Policy Agent, to help write the instruction, so that the new Agent follows what my department already knows.
35. As an employee, I want the @ list to show only Agents I may use (mine, my department's and company-wide ones), so that I can't pull in someone's private Agent.
36. As an employee, I want an Agent I called with @ not to become a Step automatically, so that the new Agent only does what I chose.
37. As an employee, I want the builder chat not to appear in my chat history, so that my history only holds real work.
38. As an employee, I want to be asked to confirm before leaving the builder with an unsaved draft, so that I don't lose my work by accident.
39. As an employee who wants full control, I want a link from the builder to the detailed 6-page setup, so that I can set the model, data classification and tools.
40. As an employee, I want to choose Skills while building an Agent and create a new Skill from there if none fits, so that I never need a separate Skills page.

### หน้าแรกและช่องพิมพ์ (แบบ A)
41. As an employee, I want the sidebar to hold only แชตใหม่, ค้นหา, ผู้ช่วย AI and my chat history grouped by day, with my profile at the bottom, so that it looks like the AI tools I already use.
42. As an Admin, I want ภาพรวมและการกำกับดูแล in the sidebar only in the Admin view, so that ordinary users don't see it.
43. As an employee, I want the new-chat screen to show a greeting, the composer and the "ใช้ซ้ำ" row, so that I can start work straight away.
44. As an employee, I want a capsule-shaped composer with ＋ (attach), the text field, a microphone and send, so that it feels like Qwen or ChatGPT.
45. As an employee, I want to press the microphone, speak Thai and see my words appear in the composer, so that I can ask without typing.
46. As an employee whose browser can't recognise speech, I want the microphone button hidden, so that I don't press a button that does nothing.
47. As an employee, I want the microphone to show clearly when it is listening and stop when I press it again, so that I know what it is doing.
48. As an employee, I want "ประมวลผลตามนโยบายองค์กร" shown under the composer, so that I know my data is handled by company policy.
49. As an employee, I want the ICN red only on the logo and navy on buttons and selected items, so that nothing looks like a delete or exit button.

### การแชร์และ Feedback
50. As an Agent owner, I want sharing an Agent with Steps with my department to also share the Agents in its Steps, after showing me which ones, so that my colleagues can actually run it.
51. As an Agent owner, I want a company sharing request for an Agent with Steps to include the Agents in its Steps, so that the Admin approves the whole set at once.
52. As an Admin, I want a company sharing request for an Agent with Steps to list the Agents in its Steps, so that I know everything I'm approving.
53. As an Admin, I want approving or rejecting that request to apply to the whole set, so that half a set is never shared.
54. As an employee, I want my 👍/👎 on an Artifact to count for the Agent I chose, not for each Step, so that my verdict goes to what I actually used.
55. As an Agent maker, I want my Agent's Feedback to include Runs of it as a whole, so that I see how the whole job is doing.

### Admin
56. As an Admin, I want usage and the most useful Agents to include Agents with Steps, so that nothing disappears from the overview after Workflows go away.

## Implementation Decisions

- **Domain model.** No Workflow entity remains. An Agent gains an ordered list of Steps; each Step references another Agent by id. Invariant: an Agent referenced by a Step has no Steps of its own. A Step whose Agent no longer exists is a *broken Step*; an Agent with a broken Step cannot run. See `GLOSSARY.md` and ADR 0001.
- **Mock data migration.** Every existing Workflow becomes an Agent with the same id-derived identity, name, description, department, owner, sharing and usage. Its agent nodes, in forward-edge order, become Steps; its skill nodes become Skills of the new Agent; trigger, condition and output nodes and loop edges are dropped. Seeded Runs, Company sharing requests and Favourites that pointed at a Workflow point at the new Agent.
- **Review loop.** The existing run-simulator rule (a review stage after a research stage sends work back once with "ข้อมูลยังไม่ครบ") applies to Steps as it does to Plans, so the demo keeps that behaviour without condition nodes in data.
- **Planner.** Planning takes an Agent (with or without Steps) instead of a Workflow. Picking an Agent with Steps runs its Steps directly with no Plan to confirm. Keyword matching that used to choose a Workflow chooses the corresponding Agent with Steps and still shows the Plan. When a Plan includes an Agent with Steps, its Steps are expanded inline so the Plan is always one level deep.
- **Save for reuse.** Always produces an Agent. One-Agent Run → Agent as today. Multi-Agent Run → new Agent whose Steps are the Plan's Agents in order.
- **Store.** Workflow actions are removed. New Agent actions: update an Agent (including its Steps) and delete an Agent. Delete is preceded by a check that lists Agents using it as a Step; it does not cascade. Sharing an Agent with Steps shares the Agents in its Steps in the same action; a Company sharing request carries the whole set and an Admin decision applies to all of them.
- **Feedback** is recorded against the Agent the Run was started with.
- **Pages.** The Workflows page and Workflow builder go away; `/workflows` redirects to `/agents`. The simple step editor moves into the Agent form as the "ขั้นตอน" section. Agent detail gains "แก้ไข" (opening the same form) and "ลบ". The Skills tab leaves the Agents page; `/skills` keeps redirecting sensibly and creating a Skill is reached from the Skill picker in the Agent form.
- **Agent builder.** New default create page: chat on one side, live Agent form on the other. In this prototype the builder AI is simulated like Runs: it proposes field values from what the user typed and from any @-mentioned Agent's instruction and knowledge. "✨ ให้ AI ช่วยเขียน" rewrites the instruction field. The 6-page wizard stays, reachable from the builder through "ตั้งค่าแบบละเอียด" in the Admin view only (decided 2026-10-22 after ticket 05: the wizard has been Admin-only since demo-two-views, and opening it would show Users the model and data-classification choices hidden from them; story 39 is read as the Admin's). The simulated AI fills name, description, instruction and Skills but leaves Steps for the user to add with "＋ เพิ่มขั้นตอน" (decided the same day: a guessed Step could pick the wrong Agent on stage). The builder chat is not a Thread.
- **Sidebar and new chat** follow design A: no "สายงาน", no separate "สร้าง" item. The reuse row ranks Favourites first, then Agents (with or without Steps) by recent and frequent use.
- **Composer.** Capsule shape: attach, text, microphone, send. Microphone uses the browser's built-in speech recognition with Thai as the language, appends recognised text to the composer, toggles listening on press, and is not rendered when the browser lacks support. No new dependency.
- **Theme.** The brand colour scale switches from indigo to navy (primary around `#1E3A5F`). ICN red appears only in the logo. Neutral greys for links and secondary elements.
- **Wording.** "สายงาน" and "Workflow" disappear from the UI, tour and help; the Thai for Step is "ขั้นตอน". The parts of the earlier Workspace redesign prompt that conflict (keep the old sidebar, use "สายงาน") are superseded; its single-page Request → Plan → AI Working → Result flow still holds.

## Testing Decisions

- Good tests drive the app the way a person does and assert only what they can see: roles, accessible names, text, the URL and the number of clicks. They never reach into the store or component internals, so the refactor from Workflows to Agents with Steps doesn't break them unless behaviour changes.
- **Seam 1 — whole-app journey tests** with the existing journey harness (renders the app in a memory router, counts clicks, advances fake time until Runs finish). New or updated journeys:
  - reuse an Agent with Steps from the "ใช้ซ้ำ" row in 1 click without leaving new chat, and it runs with no Plan to confirm (replaces the Workflow cases in Journey 2);
  - build an Agent in the chat builder, including @-mentioning an Agent and "ให้ AI ช่วยเขียน", within the Journey 4 click budget;
  - add, reorder and remove Steps in the Agent form; Agents with Steps are not offered as Steps (replaces the workflow-editor journey);
  - save for reuse after a multi-Agent Run produces an Agent with Steps;
  - a Plan containing an Agent with Steps shows its Steps expanded;
  - deleting an Agent used as a Step warns with the using Agents' names; afterwards the using Agent shows the broken Step and won't run;
  - share an Agent with Steps with the department and with the company; the Admin sees and decides the whole set (updates the shared-items and company-sharing journeys);
  - Feedback on an Agent-with-Steps Run counts for that Agent;
  - `/workflows` lands on the ผู้ช่วย AI page; the sidebar has no สายงาน; the Skills tab is gone and Skills are picked in the Agent form (updates nav-and-skills-tab);
  - the microphone button is absent when speech recognition is unavailable.
- **Seam 2 — mock-data test** (existing mock-data test file): every Step references an existing Agent; no Agent referenced by a Step has Steps; no Workflow collection remains; former Workflow names exist as Agents with Steps.
- Prior art: the journey tests for `simpler-pages` and `demo-two-views`, and the existing mock-data test.
- Not automated: real speech recognition (try in Chrome/Edge) and the navy theme (compare by eye with design A).

## Out of Scope

- **Deferred until after the demo** (this round builds only what is shown on stage): editing an existing Agent and the "แก้ไข"/"ลบ" actions on Agent detail; deleting an Agent used as a Step and broken Steps (stories 21–23); sharing an Agent with Steps as a set and the Admin deciding the set (stories 50–53); confirming before leaving the builder with a draft (story 38); limiting the @ list by permission (story 35: the demo lists all Agents). The journeys for these are not written this round.
- Connections to outside systems: LINE bot, writing to Excel, Runs that start on a message or a schedule. These change what a Run is and raise data-leaving-the-company questions; they get their own grill and spec next.
- Agents talking to each other freely; only Steps and Plans.
- Nested Steps, conditions or branches inside an Agent.
- Dark theme, Projects/folders of chats, a model selector in the composer, two-way voice conversation.
- Designs B and C.
- A real backend or real AI; everything stays mock data and simulation.

## Further Notes

- The design canvas with designs A, B and C is shared with anyone with the link; design A with the navy accent is the reference.
- `docs/DESIGN.md`, the tour and Help still describe Workflows and need the same wording pass as the UI.
