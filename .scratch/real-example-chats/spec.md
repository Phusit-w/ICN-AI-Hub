# Spec: ตัวอย่างแชตงานจริง 3 แชต (SOC · ก้าวเดิน · รายงานหน้างาน)

Status: ready-for-agent

ที่มา: grill ใน session 2026-10-22 (ต่อจาก `.scratch/agents-only-redesign/spec.md` หัวข้อ Out of Scope เรื่อง LINE/Excel/ตั้งเวลา) · ADR `docs/adr/0001-no-separate-workflow.md` · ทำบน branch `prototype/workspace-layout`

## Problem Statement

เดโมที่มีอยู่แสดงงานแบบทั่วไป (ใบเสนอราคา, รายงานตลาด) ซึ่งพนักงาน ICN มองแล้วไม่เห็นว่าเป็นงานของตัวเอง งานที่เสียเวลาจริงของพนักงานคือ งานเอกสารที่ต้องเทียบกันทีละข้อ (ตรวจ SOC กับ datasheet), ข้อความ LINE ที่ต้องมานั่งคัดลงตารางทุกสัปดาห์ (ก้าวเดินของกลุ่มเดิน), และงานหลังออกไซต์ (เขียนรายงานแล้วทำใบเบิกค่าเดินทาง) ทั้งสามจบที่ Excel แต่เดโมไม่มีตัวอย่างที่เป็นตาราง Excel, ไม่มีแนวคิดงานที่ทำเองตามเวลา และไม่เคยแสดงการอ่านตัวเลขจากรูป

## Solution

ในประวัติแชตของ User เดโมมี Thread ตัวอย่าง 3 แชต เปิดแล้วเห็นบทสนทนาและผลงานครบเหมือนใช้งานจริง ผลงานที่เป็นตารางแสดงในพื้นที่ทำงาน และกด "ดาวน์โหลด Excel" ได้ไฟล์ .xlsx ที่เปิดใน Excel ได้จริง:

1. **ตรวจ SOC เทียบ datasheet:** ได้ตารางผลตรวจรายข้อ ผลมี 3 ค่า คือ ผ่าน / ไม่ผ่าน / ไม่พบ ต้องตรวจเอง
2. **บันทึกก้าวเดิน:** Thread เดียวสอง Run Run แรกรับข้อความ LINE ของสัปดาห์ 5-11 ต.ค. พร้อมรูปตัวนับก้าว และตั้ง Schedule "ทุกวันจันทร์ 20:00" Run ที่สองเกิดจาก Schedule ครอบสัปดาห์ 12-18 ต.ค. และรวมสัปดาห์ก่อนหน้าไว้ในไฟล์ มีแถวที่ติด "ตรวจสอบ" เพราะอ่านรูปไม่ชัด
3. **รายงานหน้างาน + ใบเบิกค่าเดินทาง:** ทีม (Agent ที่มี Steps) สองขั้น ให้ Artifact สองชิ้น โหลดแยกกันได้

Agent ที่ทำทั้งสามงานอยู่ในคลัง Agent ด้วย (ของ User สมมติ แชร์ในแผนก) เพื่อให้ "ใช้ซ้ำ" และหน้า Agent เปิดดูได้

ทั้งหมดเป็นเดโมแบบสคริปต์ที่เนื้อหาเหมือนงานจริง ไม่ได้เรียก AI จริง ไม่ได้เชื่อม LINE และ Schedule ไม่ได้ทำงานเองจริง

## User Stories

### ภาพรวม
1. As a User, I want to open real-looking example chats from my chat history, so that I can see what the Hub does for work I actually have.
2. As a presenter, I want the three examples to be about field work, paperwork and LINE chores, so that staff recognise their own jobs.
3. As a presenter, I want every name, ID and number in the examples to be fictional, so that no real ICN employee or contract is shown.
4. As a User, I want each example to be an ordinary Thread with Runs, so that it behaves like the chats I would make myself.
5. As a User, I want to see which Agent did each example, so that I can open it and use it again.

### ตรวจ SOC
6. As an engineer, I want to ask the Agent to check a SOC against a vendor datasheet, so that I don't compare item by item by hand.
7. As an engineer, I want to see attached files for the SOC and the datasheet in the chat, so that I know what was compared.
8. As an engineer, I want the result as a table with the columns item, SOC requirement, value found in the datasheet, referenced page, result and note, so that I can send it to a reviewer as it is.
9. As an engineer, I want each result to be pass, fail, or not found (check by hand), so that the Agent says plainly what it is unsure of.
10. As an engineer, I want the example to include at least one of each result, so that I can see how a failure and an unknown look.
11. As an engineer, I want to see the referenced page number for each item, so that I can verify it in the datasheet.
12. As an engineer, I want to download the result as an .xlsx file, so that I can attach it to the bid documents.
13. As an engineer, I want a short summary above the table (how many pass, fail, unknown), so that I know where to look first.

### บันทึกก้าวเดิน
14. As a group coordinator, I want to paste the week's LINE messages with the step-counter screenshots, so that I don't copy numbers into Excel by hand.
15. As a group coordinator, I want the Agent to read name, department code and total steps from each message, so that every member becomes one row.
16. As a group coordinator, I want the Agent to read the step total from the screenshot, so that I don't type it from the picture.
17. As a group coordinator, I want a member whose picture is blurry or missing a day marked "ตรวจสอบ" with the reason, so that a guessed number never goes into the file.
18. As a group coordinator, I want to correct a flagged number in the chat before it is written to the file, so that the file is right.
19. As a group coordinator, I want to say "บันทึกให้ทุกวันจันทร์ 20:00" in the chat and see a Schedule card confirm it, so that I know the weekly job is set.
20. As a group coordinator, I want the Schedule card to say what period each run covers (the week before, Monday to Sunday), so that the dates are never ambiguous.
21. As a group coordinator, I want the Agent page to show its Schedule, so that I can see when it runs.
22. As a group coordinator, I want the weekly run to appear in the same Thread with a label showing it was started by the Schedule, so that I can tell it from one I started.
23. As a group coordinator, I want each week's Excel to contain the earlier weeks too, with a summary sheet per week, so that I have one file that grows.
24. As a group coordinator, I want to see the week range (such as 12-18 Oct) in the title of each week's Artifact, so that I can find the week I need.
25. As a group coordinator, I want the Excel to show total steps per person per week, so that I can compare members.

### รายงานหน้างาน + ใบเบิก
26. As a field engineer, I want to type a few lines about my site visit, so that I don't write the report from a blank page.
27. As a field engineer, I want the report as a table with site, date, work done, result, problems and pending work, so that it matches how my team files site reports.
28. As a field engineer, I want the second Step to turn the visit into a travel claim, so that I don't retype the trip.
29. As a field engineer, I want the claim to list date, from-to, vehicle, distance, amount and receipt, so that accounting gets what it needs.
30. As a field engineer, I want the mileage amount worked out from a rate stated in the claim's note, so that I can check the arithmetic.
31. As a field engineer, I want to see the report and the claim as two separate Artifacts in the same Run, so that I can send each to the right person.
32. As a field engineer, I want to download each Artifact as its own .xlsx file, so that I can attach them separately.
33. As a field engineer, I want the team shown as a team in the Agent library with its two Steps, so that I can see how it works.

### Excel
34. As a User, I want a download button on every table Artifact, so that I can open it in Excel.
35. As a User, I want the downloaded file to have the same columns and sheets as the preview, so that nothing is lost.
36. As a User, I want Thai text to read correctly in the downloaded file, so that I don't have to fix encoding.
37. As a User, I want the table preview in the work area to be readable without downloading, so that I can check it first.
38. As a User, I want the Excel library to load only when I press download, so that the first page stays fast.

### Agent library
39. As a User, I want the three Agents listed in the library with their department and description, so that I can find them.
40. As a User, I want to use an example Agent from the library, so that I can run my own SOC check, step log or site report the same way.
41. As an Admin, I want the example Agents to appear in usage and Feedback like any other Agent, so that the demo data stays consistent.

## Implementation Decisions

- **Domain language** (already in `GLOSSARY.md`): a Run yields one or more Artifacts (a team yields each Step's Artifact); a **Schedule** (ตั้งเวลา) is a rule on an Agent, each firing adds a Run to the same Thread covering the period since the last one. No new ADR: nothing here is hard to reverse.
- **Artifact kinds:** add a table/Excel kind to Artifacts: one or more named sheets, each with columns and rows, plus per-row marks (such as "ตรวจสอบ") and a note. The work area previews the sheet(s) and offers "ดาวน์โหลด Excel". Existing document/image Artifacts are unchanged.
- **Multiple Artifacts per Run:** a Run carries a list of Artifacts. A team produces one per Step; the Thread shows them together and each downloads on its own. Existing single-Artifact Runs keep working as a list of one.
- **Schedule:** a rule stored on an Agent (weekday, time, period covered). The chat shows a card when it is set; the Agent page shows it as a line. In the seeded data the second Run of the step-count Thread carries a label that it was started by the Schedule. Nothing fires in the demo.
- **Seeded data:** three Threads in the demo User's history, with dates before today's demo date (2026-10-22): SOC check; step log with two Runs (weeks 5-11 Oct and 12-18 Oct, the second labelled Schedule 19 Oct 20:00); site report plus travel claim. Three Agents added to the library: SOC check, step log, and the team "site report + travel claim" whose Steps are two single-purpose Agents (each an Agent without Steps, so ADR-0001 holds). Agents are owned by fictional Users and shared with the fitting department.
- **Step-log content:** each member message has name, department code and a screenshot with step totals; the week total in the sample is 18,724 steps for 12-18 Oct. The Run shows one flagged row with a reason (e.g. blurry picture, total partly unreadable) and the digits it could not read left unfilled, never guessed. The Excel carries earlier weeks and a per-week summary sheet.
- **SOC content:** items cover required values with a datasheet value and page; at least one pass, one fail, one not found. Columns as in story 8.
- **Site report and claim content:** report columns as in story 27; claim columns as in story 29; mileage rate is fictional and written in the claim note. If the user supplies the real ICN claim form (names removed), its columns replace those.
- **Excel download:** add the `exceljs` dependency, loaded with a dynamic import when the download is pressed. The downloaded workbook mirrors the Artifact's sheets, columns, rows, row marks and notes, with Thai text intact.
- **Names and data:** all names, IDs, amounts and file names are fictional; the sample step-log name and ID come from the user's own placeholder message. No real ICN employee names.
- **UI naming:** the interface says "Agent" (and "ทีม" for an Agent with Steps), never ผู้ช่วย or สายงาน, per the earlier rename and the no-workflow-wording guard.
- **Where it shows:** only in the demo User's chat history. No section on Home and no department tags on Home.
- **Branch:** `prototype/workspace-layout`; Artifacts must display in whichever Workspace layout (A or B) is current.

## Testing Decisions

- Good tests drive the app as a person does and assert only what they see: roles, accessible names, text, the URL, the downloaded file's contents. They don't read the store or component internals.
- **Seam 1 — whole-app journey tests** (existing journey harness: memory router, click counter, fake time). One journey per example, each opening the Thread from chat history:
  - SOC check: the table shows the three result values and the page column; pressing download produces a workbook whose first sheet has the same header and row count.
  - Step log: two Runs in one Thread; the Schedule card shows "จันทร์ 20:00" and the period covered; the second Run is labelled as started by the Schedule; one row is marked "ตรวจสอบ" with a reason and its unreadable digits are not filled in; the downloaded workbook holds both weeks and a per-week summary.
  - Site report + claim: two Artifacts from one Run; each downloads as its own workbook; the Agent page shows the team with two Steps.
  - Library: the three Agents are listed and the team shows as a team.
- **Seam 2 — mock-data test** (existing file): every seeded Thread's Agent exists; Steps of the team reference existing Agents without Steps; the Schedule belongs to an existing Agent; no real-looking employee names (reuse any existing guard if present); every table Artifact has non-empty columns and rows with consistent width.
- The workbook is checked by loading the produced file back with the same library inside the test.
- Prior art: the journey tests for `artifact-actions`, `save-agent-with-steps` and `workspace-chat-or-plan`, and the existing mock-data test.
- Not automated: how the tables look in Excel itself (open a downloaded file by eye), and the two Workspace layouts (compare by eye).

## Out of Scope

- A real LINE bot or reading a real LINE group; Schedule that actually fires; AI that really reads pictures, SOCs or datasheets; each is a later spec and brings data-leaving-the-company questions.
- Writing into a real shared Excel file (for example on SharePoint) and keeping one file that grows in place; the demo's file grows only by each week's Run carrying the earlier weeks.
- Editing or deleting a Schedule; time zones other than the company's; holidays.
- Real ICN SOC documents, datasheets and claim forms; if the user supplies de-identified ones they only replace the sample content and columns.
- Approval of a travel claim and sending it to accounting.
- A Home section or department tags for the examples.

## Further Notes

- Today's demo date is 2026-10-22; 12 Oct 2026 is a Monday, so "12-18 Oct" is Monday to Sunday and the run on Monday 19 Oct at 20:00 covers it.
- The repo already has the Claude skills `soc-tech-check`, `soc-no-page` and `tor-compliance-check` outside the app; the sample SOC columns follow their style, but the app does not call them.
- Open for the user: the real ICN travel-claim form (names removed) and a de-identified SOC if they want the samples to match exactly.
