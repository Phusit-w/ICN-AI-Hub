# ICN AI Hub — Product & UX Design

> Innovation Contest 2026 · "The Future of Work & Life"
> Prototype: React + Tailwind (mock data, no backend) — ดูวิธีรันใน `README.md`

---

## 1. Product concept

**ICN AI Hub คือ "พื้นที่ทำงาน AI ของทั้งองค์กร"** ไม่ใช่ chatbot อีกตัว

| Chatbot ทั่วไป | ICN AI Hub |
|---|---|
| คุยกับ AI ตัวเดียว | มอบหมายงานให้ **ทีม Agent** ที่แต่ละตัวเชี่ยวชาญต่างกัน |
| ผลลัพธ์เป็นข้อความในแชต | ผลลัพธ์เป็น **ไฟล์งานจริง** ตาม Template บริษัท (Word, Excel, Diagram) |
| ความรู้อยู่ในหัวคนเขียน prompt | ความรู้ถูกเก็บเป็น **Skill / Knowledge / Workflow** ที่แชร์และใช้ซ้ำได้ |
| ผูกกับ Provider เดียว | **Provider-agnostic** — Local AI สำหรับข้อมูลลับ, Cloud AI สำหรับงานทั่วไป |
| ไม่มีใครดูแล | มี **Governance** — ค่าใช้จ่าย, สิทธิ์, นโยบายข้อมูล, Audit log |

**Mental model สำหรับผู้ใช้ที่ไม่เก่ง AI** — ใช้คำเปรียบเทียบกับการทำงานในบริษัทจริง:

- **Agent** = พนักงานผู้เชี่ยวชาญ (มีหน้าที่, ความรู้, เครื่องมือ)
- **Skill** = คู่มือการทำงาน / SOP ที่พนักงานหลายคนใช้ร่วมกัน
- **Knowledge** = เอกสารอ้างอิงที่ให้พนักงานอ่าน
- **Plan (แผนงาน)** = หัวหน้าแบ่งงานให้ทีม: ลำดับ Agent ที่ระบบเสนอเมื่อผู้ใช้ไม่ได้เลือก Agent หรือ Workflow เอง ผู้ใช้กด "เริ่มเลย" ก่อน Run เริ่ม (ไม่ได้บันทึก จนกว่าจะกด "บันทึกไว้ใช้ซ้ำ")
- **Workflow** = สายงานส่งต่อระหว่างทีมที่ **บันทึกไว้** (มีจุดตรวจและส่งกลับแก้ได้) — ใช้คำนี้กับสายงานที่บันทึกแล้วเท่านั้น ไม่ใช่โหมดหรือ Plan
- **Workspace** = ห้องสั่งงานและติดตามความคืบหน้า

### Core concepts (domain model)

```
Workflow ──has many──▶ Node (Trigger | Agent | Skill | Condition | Output)
Agent ──uses──▶ Skill[] , Knowledge[] , Tool[] , Model , OutputFormat
Skill ──reusable across──▶ many Agents
Run ──starts from──▶ chat (1 step) | Plan (Agents the system proposed) | picked Agent | picked Workflow
Run ──executes──▶ Step[] (one per Agent/Skill/Condition) ──produces──▶ Artifact
Model ──location──▶ Local | Cloud | Auto  (Auto = router picks by data classification + cost)
```

### Design principles
1. **Plan before run** — เมื่อระบบเลือก Agent หลายตัวเอง จะหยุดที่ **Plan** (Agent ไหนทำอะไร) ให้ผู้ใช้เห็น แก้ได้ และกด "เริ่มเลย" ก่อนเริ่ม → สร้างความไว้วางใจ · คำถามสั้นตอบเป็นแชตทันที และถ้าผู้ใช้เลือก Agent หรือ Workflow เองก็เริ่มทันที ไม่ถามซ้ำ · ไม่มีตัวสลับโหมดให้ผู้ใช้ต้องเลือก
2. **Show the team working** — เห็นสถานะ Waiting / Processing / Completed / Sent back ของทุก Agent แบบเรียลไทม์
3. **Outputs, not messages** — ผลลัพธ์ของแต่ละ Agent เป็นชิ้นงาน ดูย้อนได้ทีละขั้น
4. **Safe by default** — ข้อมูลลับถูกส่งไป Local AI อัตโนมัติ และแสดงให้ผู้ใช้เห็นว่าข้อมูลไม่ออกนอกบริษัท
5. **Plain language** — ทุกฟอร์มมีคำอธิบายภาษาคน, มีตัวอย่าง, มี template ให้เริ่ม · ทุกหน้าอธิบายตัวเองได้โดยไม่ต้องเปิดทัวร์ (ทัวร์มีแค่ 5 ขั้น)
6. **Clean** — หนึ่งหน้ามีปุ่มหลัก (สีแบรนด์) ปุ่มเดียว · แสดงเฉพาะข้อมูลที่ช่วยตัดสินใจ · แยกส่วนด้วยระยะห่าง ไม่ใช้กรอบซ้อนกรอบ · งานที่ทำบ่อยอยู่ใน click budget (สั่งงานจนได้ Artifact ≤ 2 คลิก, ใช้ซ้ำ 1 คลิก, เปิดผลงานเก่า 1 คลิก, สร้าง Agent ≤ 3 คลิก, ใช้ของที่แชร์ ≤ 2 คลิก)

---

## 2. Sitemap

แอปเปิดที่ **แชตใหม่** (แบบ ChatGPT / Claude / Gemini) — ไม่มีหน้าหลักแยก · เมนู 3 รายการ (มุมมอง Admin; มุมมอง User มี 2 — ไม่มีภาพรวมและการกำกับดูแล): ไม่มีหน้าชุมชน, ทักษะเป็นแท็บในหน้าผู้ช่วย, Workspace ไม่มีตัวสลับโหมด · สลับมุมมอง User / Admin ที่เมนูโปรไฟล์ด้านล่าง sidebar (เปิดมาเป็น User, จำไว้ข้าม reload) · รายการที่ทำเครื่องหมาย ★ เป็นของ Admin เท่านั้น: ใน User view ลิงก์ตรงจะพาไปหน้าที่ User เห็นได้

```
ICN AI Hub
├── แชตใหม่ / แชต (Workspace)         /workspace  (/ เปิดที่นี่; ?q= prompt, ?agent= / ?workflow= pick, ?run= view Run)
├── งานของฉัน
│   ├── สายงาน (Workflows)             /workflows  (?id= simple editor, &advanced=1 detailed builder ★ → simple editor)
│   └── ผู้ช่วย AI (Agents)            /agents     (?filter=popular|shared, ?tab=skills, &open= Skill detail)
│       ├── Agent Detail              /agents/:id
│       ├── Create Agent              /agents/new  (?q= description, ?from= copy source, ?advanced=1 wizard ★ → quick create)
│       └── Create Skill              /skills/new  (?q= description, ?advanced=1 full form)
└── องค์กร
    └── ภาพรวมและการกำกับดูแล          /governance  ★ → แชตใหม่

Old links: / → /workspace · /community → /agents?filter=popular · /skills(?open=id) → /agents?tab=skills(&open=id)
```

## 3. Information architecture

- **Global (ทุกหน้า):** Sidebar แบบ ChatGPT / Claude / Gemini: ปุ่ม **แชตใหม่** และช่องค้นหา (Agent + Skill + Workflow; Skill เปิดในแท็บทักษะ) ด้านบน (แชตใหม่คือหน้าแรกของแอป), เมนู 3 รายการ (กลุ่ม "งานของฉัน" 2 รายการ + "องค์กร"), **ประวัติแชต** (งานที่กำลังทำมีจุดกระพริบ) (Thread ล่าสุดก่อน แบ่ง วันนี้ / ก่อนหน้านี้ กด 1 ครั้งเปิดได้), ผู้ใช้อยู่ล่างสุด; ย่อเป็นแถบไอคอนได้ (ซ่อนประวัติ, ปุ่มค้นหาขยายแล้วโฟกัสช่องค้นหา; ทัวร์เปิด sidebar ให้เองเมื่อขั้นนั้นอยู่ใน sidebar). Top bar โล่ง ไม่มีเส้นขอบ: ปุ่มเมนูบนมือถือ, ปุ่ม **วิธีใช้** (คำศัพท์ + ทัวร์ 5 ขั้น). หน้าแชตไม่มีแผงประวัติแยก
- **งานของฉัน** — สิ่งที่ผู้ใช้ทำทุกวัน: สั่งงาน, ใช้ซ้ำ, ติดตาม Run, หาและใช้ Agent / Workflow / Skill
- **องค์กร** — สิ่งที่ผู้ดูแลควบคุม: ค่าใช้จ่าย, Model, สิทธิ์, นโยบาย, Audit log, Agent ที่มีประโยชน์ที่สุดเดือนนี้
- **ของที่แชร์** ไม่มีหน้าแยก: อยู่ในแต่ละ library ผ่านชิป "ยอดนิยมในองค์กร" / "แชร์ให้ฉัน" และปุ่มหลักคือ **ใช้งาน** เสมอ (Workflow ที่แชร์ใช้ได้ทันทีโดยไม่ต้องคัดลอก)

Object ทุกตัวมีชุด metadata เดียวกัน: Owner · Department · Share level (Private/Department/Company) · Version · Usage · Feedback (Agent) — การ์ดแสดงแค่ไอคอน ชื่อ คำอธิบาย 1 บรรทัด และปุ่ม "ใช้งาน" ตัวเลขอื่นอยู่ในหน้ารายละเอียด

## 4. Main user flows

**Flow A — สั่งงานครั้งเดียว ได้ Proposal (hero demo, ≤ 2 คลิก)**
1. แชตใหม่ → พิมพ์ "ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า X" → Enter
2. ระบบเลือก Agent หลายตัวเอง → Workspace แสดง **Plan**: Research → Sales Proposal → Document → Image → Review → Condition "ข้อมูลครบ?"
3. ผู้ใช้ลบขั้นที่ไม่ต้องการ (ถ้ามี) → **เริ่มเลย**
4. Step chips ในแชตบอกว่า Agent ไหนกำลังทำ · "ดูขั้นตอน" เปิด panel ด้านขวา (pipeline, ปิดได้)
5. Condition ตรวจพบ "ไม่มีงบประมาณลูกค้า" → **ส่งกลับ Research Agent** (รอบที่ 2) → ผ่าน
6. Artifact (Proposal .docx — เอกสารมีหัวจดหมาย ICN: โลโก้และชื่อบริษัท; ตาราง ภาพ และคำตอบแชตไม่มี) → **ดาวน์โหลด** (ปุ่มหลัก) · **บันทึกไว้ใช้ซ้ำ** · "⋯" (คัดลอก, แชร์, ดูขั้นตอน)

คำถามสั้น (เช่น "ลาพักร้อนได้กี่วัน") ตอบเป็นแชตทันที ไม่มี Plan

**Flow B — ใช้ซ้ำ (1 คลิก ไม่เปลี่ยนหน้า)**: แชตใหม่ → แถว **ใช้ซ้ำ** → กด Favourite agent หรือ Workflow → ถูกเติมในช่องสั่งงาน → พิมพ์แล้วส่ง → Run เริ่มทันที (ไม่มี Plan เพราะผู้ใช้เลือกเอง)

**Flow C — เปิดผลงานเก่า (1 คลิก)**: sidebar → **ประวัติแชต** → กด Thread

**Flow D — สร้าง Agent ของตัวเอง (≤ 3 คลิก)**: ผู้ช่วย AI → สร้างผู้ช่วย → บอกว่าอยากได้ผู้ช่วยแบบไหน → AI กรอกให้ในหน้าเดียว → ตรวจ → สร้าง (wizard เต็มอยู่หลัง "ตั้งค่าขั้นสูง"; คัดลอก Agent ที่มีอยู่ทำจากหน้ารายละเอียด)

**Flow E — ใช้ของที่คนอื่นแชร์ (≤ 2 คลิก)**: ผู้ช่วย AI หรือ สายงาน → ชิป "ยอดนิยมในองค์กร" / "แชร์ให้ฉัน" → **ใช้งาน** → ช่องสั่งงานใน Workspace ที่เลือกไว้แล้ว

**Flow F — ทำ SOP เป็น Skill แล้วกระจายให้ทุก Agent**: ผู้ช่วย AI → แท็บ **ทักษะ** → สร้างทักษะ (บอก → AI กรอก → สร้าง) → เปิดรายละเอียด → *เพิ่มให้ผู้ช่วย* (เลือกหลายตัวพร้อมกัน)

**Flow G — ประกอบ Workflow**: สายงาน → เล่าขั้นตอนเป็นภาษาปกติ → AI ร่าง → editor แบบง่าย (เรียง Agent ขึ้น/ลง) → บันทึก / ลองรัน · เงื่อนไขและการวนกลับอยู่ในตัวสร้างแบบละเอียดหลังลิงก์ "ขั้นสูง"

**Flow H — Admin**: ภาพรวมและการกำกับดูแล → 4 ตัวเลขหลัก (ค่าใช้จ่าย, จำนวน Run, สัดส่วน Local AI, การแจ้งเตือนนโยบาย) → แท็บรายละเอียด (ค่าใช้จ่ายและ Model, แผนก, นโยบายข้อมูล, สิทธิ์, Audit log, Agent ที่มีประโยชน์ที่สุดเดือนนี้ พร้อมแผนกและเหตุผลที่คนกด 👎)

## 5. Screen-by-screen design & layout

| # | Screen | Layout (desktop) | Key elements |
|---|---|---|---|
| 1 | **แชตใหม่** (หน้าแรก) | Welcome card (ครั้งแรกครั้งเดียว) · คำทักทาย · ช่องสั่งงาน · แถว **ใช้ซ้ำ** | ชิปตัวอย่างงาน (ส่งทันที) แสดงเฉพาะเมื่อยังไม่มี Run · ลิงก์เบา "ผู้ช่วยทั้งหมด" |
| 2 | **แชต (Workspace)** | Thread + composer (ประวัติแชตอยู่ใน sidebar หลัก) (อัตโนมัติ / เลือก Agent / Workflow) · ขวา: panel ขั้นตอน (เปิดจาก "ดูขั้นตอน") | ระบบตัดสินใจเองว่าแชตหรือ Plan · Plan + "เริ่มเลย" · step chips · Sensitive-data notice · ใต้ Artifact: ดาวน์โหลด / บันทึกไว้ใช้ซ้ำ / ⋯ |
| 3 | **ผู้ช่วย AI** | แท็บ ผู้ช่วย / ทักษะ · ช่องบอกงาน + ป้ายงาน → แนะนำ 3 อันดับ (แสดงเมื่อบอกงานแล้วเท่านั้น) · รายการทั้งหมด + ชิปแชร์ + ตัวกรอง (ซ่อนไว้) + สร้างผู้ช่วย | การ์ด: ไอคอน, ชื่อ, 1 บรรทัด, **ใช้งาน** · ทั้งการ์ดเปิดรายละเอียด · ดาวแสดงเมื่อ hover/focus |
| 4 | **ทักษะ (แท็บ)** | ค้นหา + หมวด · Grid · สร้างทักษะ | รายละเอียด (Input → Output, ใช้ในผู้ช่วยตัวไหน, เวอร์ชัน) · **เพิ่มให้ผู้ช่วย** หลายตัวพร้อมกัน |
| 5 | **Create Agent / Create Skill** | หน้าเดียว: บอก → AI กรอก → ตรวจ → สร้าง (ปุ่มหลักปุ่มเดียว) | Wizard / ฟอร์มเต็มหลัง "ตั้งค่าขั้นสูง" · Data classification ล็อก Cloud model · Run test ของ Skill |
| 6 | **สายงาน (Workflows)** | ช่องเล่าขั้นตอน → ร่าง · ชิปแชร์ · การ์ดสายงาน (ใช้งาน) · สายงานของฉัน | Editor แบบง่ายเป็นค่าเริ่มต้น · ตัวสร้างละเอียด (Palette · Canvas · Inspector, condition loop, Test run) หลัง "ขั้นสูง" |
| 7 | **ภาพรวมและการกำกับดูแล** | 4 ตัวเลขหลัก · แท็บรายละเอียดด้านล่าง | ทุกกราฟแยกสี Local (เขียว) / Cloud (เทา) · ไม่มีอันดับตัวบุคคล: แท็บ Agent ที่มีประโยชน์ที่สุดเดือนนี้ บอกแผนกแทน |
| 8 | **Agent Detail** | Hero (icon, name, meta, Feedback "มีประโยชน์ X% จาก N ครั้ง", **ใช้งาน**, คัดลอกไปปรับใช้ = รอง) · ทำอะไร + ตัวอย่างคำสั่ง, Skills, Workflows, Version history · Model, Output, Knowledge, Tools | ตัวเลข uses / Feedback / version อยู่ที่นี่ ไม่อยู่บนการ์ด |

**Responsive:** Sidebar → drawer (< lg), grid ลดคอลัมน์, panel ขั้นตอนเต็มจอบนมือถือ, ตารางเลื่อนแนวนอน, Modal เป็น bottom sheet บนมือถือ, ไม่มี scroll แนวนอนทั้งหน้า

## 6. Component list (`src/components`)

| Group | Components |
|---|---|
| `layout/` | `AppShell` (Sidebar: แชตใหม่, GlobalSearch, เมนู 3 รายการ, ChatHistory, ผู้ใช้ = เมนูโปรไฟล์สลับมุมมอง; ย่อได้ · Topbar โล่ง (วิธีใช้) · mobile drawer) · `Help` (`TERMS` คำศัพท์รวม Plan, WelcomeCard, ปุ่มวิธีใช้/เริ่มทัวร์) |
| `tour/` | `Tour` (spotlight + popover, ข้ามขั้นที่มองไม่เห็น) · `steps.js` (5 ขั้น: ช่องสั่งงาน, ใช้ซ้ำ, ค้นหา, ผู้ช่วย AI, พร้อมแล้ว) |
| `ui/Button` | variants: primary · secondary · ghost · subtle · danger; sizes sm/md/lg/icon; `to` → router Link |
| `ui/Badge` | `Badge`, `StatusPill` (Waiting/Processing/Completed/Sent back/Ready/Running), `ModelBadge` (Local/Cloud/Auto), `DeptBadge`, `ShareBadge` |
| `ui/Card` | `Card`, `CardHeader`, `PageHeader`, `StatCard`, `EmptyState`, `ProgressBar` |
| `ui/Form` | `Field`, `Input`, `Textarea`, `Select`, `SearchInput`, `Toggle`, `Segmented`, `ChoiceCard` (single/multi) |
| `ui/` (อื่นๆ) | `Tabs` (WAI-ARIA tabs: หน้าผู้ช่วย, Governance) · `Menu` ("⋯", หรือ trigger ที่กำหนดเอง เช่น เมนูโปรไฟล์) · `ShareFilterChips` (ยอดนิยม / แชร์ให้ฉัน) · `QuickCreate` (บอก → AI กรอก → สร้าง) · `Attachments` · `TypewriterHint` |
| `ui/Overlay` | `Modal`, `Toaster`, `Avatar` |
| `agents/` | `EntityIcon` (agent = brand tint, skill = neutral), `AgentCard` (`ItemCard`: การ์ดเดียวกันของ Agent และ Workflow — ไอคอน, ชื่อ, คำอธิบาย 1 บรรทัด, "ใช้งาน"; `FavoriteButton`) |
| `skills/` | `SkillCard` |
| `workflow/` | `Pipeline` (panel ขั้นตอน), `ArtifactView` (bullets/table/doc/diagram/checklist), `ComposerPick` (Agent หรือ Workflow ที่เลือกในช่องสั่งงาน), `ReuseRow` (แถวใช้ซ้ำในแชตใหม่), `SaveForReuse`, `Feedback` (👍/👎 ใต้ Artifact), `WorkflowStats` (ใช้กี่ครั้ง, เวอร์ชัน — แสดงในหน้ารายละเอียด ไม่อยู่บนการ์ด) |

Logic: `store/AppStore.jsx` (reducer + one clock for all runs) · `lib/runs.js` (`threadsOf` สำหรับประวัติการคุย, planner: chat หรือ Plan, model router, step engine with loop-back) · `lib/reuse.js` (บันทึกไว้ใช้ซ้ำ) · `lib/sharing.js` (ตัวกรองยอดนิยม / แชร์ให้ฉัน) · `lib/routes.js` (ลิงก์ไปแท็บทักษะ) · `lib/agentDraft.js`, `lib/skillDraft.js` (AI กรอกฟอร์มสร้าง) · `lib/mockOutputs.js`

Tests: `test/journeys/` — whole-app journey tests (Vitest + Testing Library) ที่ตรวจ click budget และเป้าหมายของทุกขั้นในทัวร์ · `test/mock-data.test.js` — ตรวจว่าข้อมูลจำลองเล่าเรื่องเดียวกัน (3 เดือนหลังเปิดใช้, ~25 User)

## 7. Design system

| Token | Value | Use |
|---|---|---|
| Brand | Navy `brand-50…900` (`#1E3A5F` = 600); แดง ICN ใช้ที่โลโก้เท่านั้น | Primary action, active Agent, selection — **สีเด่นสีเดียว** |
| Neutral | Slate; canvas `#F6F7F9`; card white + `slate-200` border | 90% ของหน้าจอ |
| Status | Brand = Processing · Emerald = Completed/Local · Amber = Sent back/Condition · Slate = Waiting/Cloud · Rose = Danger only | ใช้สีเฉพาะเมื่อสื่อความหมาย |
| Department | จุดสีเล็ก 6px (Core indigo, Sales sky, HR rose, IT teal, Accounting amber) | ไม่ใช้เป็นพื้นหลัง เพื่อไม่ให้หน้าจอรก |
| Type | Inter + IBM Plex Sans Thai; H1 24/600, section 15/600, body 14, meta 12, micro 11 | |
| Radius | 8px control · 12px card · 16px modal · ช่องพิมพ์ทรงแคปซูล ปุ่มกลมในช่องพิมพ์ | |
| Elevation | border เป็นหลัก, shadow เฉพาะ hover/popover/modal | ดู enterprise ไม่ฟุ้ง |
| Motion | flow-dash บนเส้นเชื่อมที่กำลังส่งงาน, pulse ring บน Agent ที่ทำงาน, rise 250ms · ข้อยกเว้น: ตัวอย่างพิมพ์ทีละตัวอักษรในช่องพิมพ์ที่ยังว่าง (สอนว่าพิมพ์อะไรได้ หยุดทันทีเมื่อผู้ใช้พิมพ์ และปิดเมื่อตั้ง reduce motion) | การเคลื่อนไหว = สถานะ ไม่ใช่ตกแต่ง |
| Icon | lucide, 16–18px; Agent icon tile สี brand, Skill tile สีเทา | แยก Agent/Skill ได้ทันที |

## 8. Example dummy data (ดูไฟล์จริงใน `src/data/`)

- เรื่องเดียวทั้งเดโม: ICN เปิดใช้มาราว 3 เดือน (ตั้งแต่ 1 ส.ค. 2026) มี User ~25 คนจากพนักงาน ~60 คน — แต่ละรายการใช้ไปหลักสิบถึงหลักร้อยครั้ง เวอร์ชันส่วนใหญ่ 1.x · `test/mock-data.test.js` คุมให้ตัวเลขสอดคล้องกัน
- `catalog.js` — 9 departments, 10 users (IT มี 1 คน), 3 models (Auto / ICN Local AI / Claude), 7 tools ทั่วไป (ไม่มีชื่อแบรนด์), 14 knowledge sources, share levels, data classes
- `agents.js` — 27 agents · `skills.js` — 18 skills · `workflows.js` — 5 node-graph workflows · `governance.js` — วันเปิดใช้, KPIs, ค่าใช้จ่ายรายเดือนตั้งแต่เปิดใช้, usage, policies, permissions, audit log
- Seeded runs: 2 running (เดินช้าตลอดเดโม), 4 completed

```js
// agent example
{ id: 'agent-sales-proposal', name: 'Sales Proposal Agent', dept: 'sales', model: 'auto',
  skills: ['skill-requirement', 'skill-proposal-template', 'skill-pricing'],
  knowledge: ['kb-price', 'kb-cases'], tools: ['shared-folder'],
  output: { format: 'Word document', language: 'TH', template: 'Sales Proposal v3' },
  share: 'company', owner: 'u-thanawat', feedback: { up: 34, down: 3 }, uses: 181, version: '1.3' }
```

## 9. ตัวอย่างต่อแผนก

| Dept | Agents | Skills | Workflow |
|---|---|---|---|
| **Sales** | Sales Proposal Agent, Customer Insight Agent (Local, Confidential) | Requirement Analysis, Proposal Template, Pricing Calculator | **Sales Proposal Pipeline**: Research → Sales Proposal → Document → Image → Review → ◇ข้อมูลครบ? (ไม่ → กลับ Research) → Output |
| **HR** | HR Policy Agent (ICN Local AI), Recruitment Screening, Onboarding | HR Policy Lookup, Company Report Format | **New Hire Onboarding**: Trigger → HR Policy → Onboarding → Report Format skill → Review → ส่งหัวหน้างาน |
| **IT** (1 คน) | IT Support Agent | IT Request Email, PDPA & Compliance | **IT Incident Triage**: IT Support → ◇แก้ได้แล้ว? (ยัง → ร่างอีเมลแจ้ง IT) → แจ้งผู้ใช้ |
| **Accounting** | Invoice Reconciliation Agent, Budget Analysis Agent (Local ทั้งหมด) | 3-Way Match, Data Analysis, ICN Chart Style | **Month-end Close**: Invoice Recon → Budget → Document → Review → ส่ง CFO |

## 10. Prototype scope (2–4 สัปดาห์)

| Week | Scope | Status ใน repo นี้ |
|---|---|---|
| 1 | IA, design system, mock data, App shell, Home, Agent/Skill Library, Agent Detail | ✅ เสร็จ |
| 2 | Workspace + simulated orchestration (plan → run → handoff → loop-back → deliverable), Create Agent/Skill, Clone/Fork | ✅ เสร็จ |
| 3 | Workflow Builder (drag/drop, connect, condition loop, test run), Governance | ✅ เสร็จ (เวอร์ชันเดโม) |
| 3½ | Simpler pages: เมนู 5 รายการ, แถวใช้ซ้ำ, ไม่มีตัวสลับโหมด (แชต หรือ Plan), ทักษะเป็นแท็บ, ไม่มีหน้าชุมชน, สร้างในหน้าเดียว, ทัวร์ 6 ขั้น, journey tests | ✅ เสร็จ |
| 4 | Polish & pitch: ซ้อมสคริปต์เดโม, user test กับพนักงาน 5 คน, ปรับ copy, (ทางเลือก) เชื่อม LLM จริง 1 ตัวผ่าน Local model เพื่อพิสูจน์ provider-agnostic | ⏭ ถัดไป |

**ไม่อยู่ใน scope:** backend, auth/SSO, AI จริง, การเก็บข้อมูลถาวร (refresh = reset), การอัปโหลดไฟล์จริง

### Demo script (5 นาที)
1. แชตใหม่ — "นี่คือห้องทำงาน AI ของทั้งบริษัท" ช่องสั่งงานอยู่ตรงกลาง แถวใช้ซ้ำ และประวัติแชตด้านซ้าย
2. พิมพ์ "ทำ Proposal ให้ลูกค้า" → ระบบเสนอ **Plan** → **เริ่มเลย** → ชี้ step chips / "ดูขั้นตอน" → Condition ส่งกลับ Research → Proposal → ดาวน์โหลด · บันทึกไว้ใช้ซ้ำ
3. กด แชตใหม่ → สายงานที่เพิ่งบันทึกอยู่ในแถวใช้ซ้ำ → กด 1 ครั้ง พิมพ์ ส่ง → เริ่มทันที
4. ผู้ช่วย AI → สร้างผู้ช่วย → บอกเป็นภาษาปกติ → AI กรอกให้ → สร้าง (≤ 3 คลิก)
5. แท็บทักษะ → เพิ่ม "Company Report Format" ให้ 3 Agents พร้อมกัน ("แก้ที่เดียว ทุก Agent ได้")
6. ภาพรวมและการกำกับดูแล → 63% Local, ข้อมูลเงินเดือนถูก block — "ปลอดภัยและไม่ผูกกับ Provider"
