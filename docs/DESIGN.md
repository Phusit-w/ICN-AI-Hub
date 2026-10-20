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
- **Workflow** = สายงานส่งต่อระหว่างทีม (มีจุดตรวจและส่งกลับแก้ได้)
- **Workspace** = ห้องสั่งงานและติดตามความคืบหน้า

### Core concepts (domain model)

```
Workflow ──has many──▶ Node (Trigger | Agent | Skill | Condition | Output)
Agent ──uses──▶ Skill[] , Knowledge[] , Tool[] , Model , OutputFormat
Skill ──reusable across──▶ many Agents
Run (task) ──executes──▶ Step[] (one per Agent/Skill/Condition) ──produces──▶ Artifact
Model ──location──▶ Local | Cloud | Auto  (Auto = router picks by data classification + cost)
```

### Design principles
1. **Plan before run** — ระบบเสนอแผน (Agent ไหนทำอะไร) ให้ผู้ใช้เห็นและแก้ก่อนเริ่ม → สร้างความไว้วางใจ
2. **Show the team working** — เห็นสถานะ Waiting / Processing / Completed / Sent back ของทุก Agent แบบเรียลไทม์
3. **Outputs, not messages** — ผลลัพธ์ของแต่ละ Agent เป็นชิ้นงาน ดูย้อนได้ทีละขั้น
4. **Safe by default** — ข้อมูลลับถูกส่งไป Local AI อัตโนมัติ และแสดงให้ผู้ใช้เห็นว่าข้อมูลไม่ออกนอกบริษัท
5. **Plain language** — ทุกฟอร์มมีคำอธิบายภาษาคน, มีตัวอย่าง, มี template ให้เริ่ม

---

## 2. Sitemap

```
ICN AI Hub
├── Work
│   ├── Home Dashboard                /
│   ├── AI Workspace                  /workspace  (?q= prompt, ?agent= preselect, ?run= view run)
│   └── Workflow Builder              /workflows  (?id=)
├── Library
│   ├── Agent Library                 /agents
│   │   ├── Agent Detail              /agents/:id
│   │   └── Create / Clone Agent      /agents/new  (?from= clone source)
│   ├── Skill Library                 /skills  (?open= detail modal)
│   │   └── Create Skill              /skills/new
│   └── Community                     /community
└── Organization
    └── Governance (Admin)            /governance
```

## 3. Information architecture

- **Global (ทุกหน้า):** Sidebar (3 กลุ่ม: Work / Library / Organization), ปุ่ม **New task**, Global search (Agent + Skill + Workflow), Running-count badge, Hybrid routing meter (Local vs Cloud)
- **Work** — สิ่งที่ผู้ใช้ "ทำ" ทุกวัน: สั่งงาน, ติดตาม, ประกอบ Workflow
- **Library** — สิ่งที่ผู้ใช้ "ค้น/ใช้ซ้ำ/สร้าง": Agent, Skill, ของที่คนอื่นแชร์
- **Organization** — สิ่งที่ผู้ดูแล "ควบคุม": ค่าใช้จ่าย, Model, สิทธิ์, นโยบาย

Object ทุกตัวมีชุด metadata เดียวกัน: Owner · Department · Share level (Private/Department/Company) · Version · Rating · Usage → ทำให้ Library, Community และ Governance ใช้ component ชุดเดียวกันได้

## 4. Main user flows

**Flow A — สั่งงานครั้งเดียว ได้ Proposal (hero demo)**
1. Home → พิมพ์ "ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า X" → *วางแผนงาน*
2. Workspace แสดง **แผนที่ระบบเสนอ**: Research → Sales Proposal → Document → Image → Review → Condition "ข้อมูลครบ?"
3. ผู้ใช้ลบขั้นที่ไม่ต้องการ (ถ้ามี) → *เริ่มทำงาน*
4. Pipeline ไฮไลต์ Agent ที่กำลังทำงาน, Activity panel แสดงขั้นย่อยแบบสด, Outputs แสดงชิ้นงานที่เสร็จ
5. Condition ตรวจพบ "ไม่มีงบประมาณลูกค้า" → **ส่งกลับ Research Agent** (รอบที่ 2) → ผ่าน
6. Final deliverable (Proposal .docx) → Download / Share / **Save as workflow**

**Flow B — ใช้ Agent ของแผนก**: Agent Library → filter Sales → *Use Agent* → Workspace (Agent ถูกเลือกไว้แล้ว)

**Flow C — สร้าง Agent ของตัวเอง**: Agent Library → *Clone* Agent ที่ใกล้เคียง → Wizard 6 ขั้น (ค่าเดิมถูกเติมให้) → ปรับ Instruction/Skill → เลือก Share → สร้าง

**Flow D — ทำ SOP เป็น Skill แล้วกระจายให้ทุก Agent**: Create Skill → ทดลอง (Run test) → สร้าง → *Add to Agent* (เลือกหลาย Agent พร้อมกัน)

**Flow E — ประกอบ Workflow**: Workflow Builder → ลาก Agent/Skill/Condition → เชื่อม (คลิกจุดขวาของ Node) → Condition ชี้กลับ Node ก่อนหน้า = เส้นวนกลับอัตโนมัติ → *Test run* ดูสถานะบน Canvas

**Flow F — Admin**: Governance → ดู Cost/Model/Local vs Cloud → เปิด-ปิดนโยบายข้อมูลลับ → ดู Audit log

## 5. Screen-by-screen design & layout

| # | Screen | Layout (desktop) | Key elements |
|---|---|---|---|
| 1 | **Home** | Greeting + org stats · Command bar (full width) · 2/3: Running workflows, Recent tasks, Recommended agents (3 cards) · 1/3: Frequently used, Popular skills, CTA "สร้าง Agent" | Command bar + quick-start chips ทำให้คนไม่เก่ง AI เริ่มได้ใน 1 คลิก |
| 2 | **AI Workspace** | ซ้าย 340px: Composer (Auto / เลือก Agent / ใช้ Workflow) + รายการงาน Planned/Running/Completed · ขวา: Run header → Pipeline visual → [Agent activity 2/5 · Outputs 3/5] | Plan-before-run, Sensitive-data banner, progress %, loop-back, Save as workflow |
| 3 | **Agent Library** | Header + Create · Search + filters (Model location, Share, Sort, Favorites) · Department tabs with counts · Grid grouped by department | Card: icon, name, dept, version, description, Model badge (Local/Cloud/Auto), share, owner, rating, uses · **Use Agent / Details / Clone / ★** |
| 4 | **Create Agent** | 3 คอลัมน์: Stepper (6 ขั้น) · Form · Live preview + readiness checklist | Instruction starters ต่อแผนก, Data classification → ล็อก Cloud model, Knowledge upload, Skill picker, Tool toggles, Output format, Share + review gate |
| 5 | **Skill Library** | Header + Create · Search + category tabs · Grid | Card: "ใช้ใน N Agents", Details modal (Input → Output, instruction, used-by, versions), **Add to Agent** multi-select |
| 6 | **Create Skill** | Form 4 ส่วน (What / How / Tools & Template / Sharing) · Sidebar: preview + **Run test** | Input → Expected output แบบเห็นภาพ |
| 7 | **Workflow Builder** | Palette (Agents/Skills/Logic) · Canvas (dot grid, zoom) · Inspector | Drag & drop, ลากย้าย Node, คลิก port เพื่อเชื่อม, เส้นประสีส้ม = retry loop, Test run แสดงสถานะบน Node |
| 8 | **Community** | KPI 4 ช่อง · ตาราง ranking (tab Agents/Skills/Workflows) · Top contributors + tips | Created by, Rating, Usage, Version (คลิกดู history + Restore), Clone/Fork |
| 9 | **Governance** | KPI 5 ช่อง · Model usage bars + Local/Cloud donut · Monthly cost (stacked) + Department table · Policies (toggle) + Permission matrix · Audit log | ทุกกราฟแยกสี Local (เขียว) / Cloud (เทา) สม่ำเสมอ |
| 10 | **Agent Detail** | Hero (icon, name, version, meta, Favorite/Clone/Use) · 2/3: ทำอะไร + ตัวอย่างคำสั่ง + System prompt, Skills, Workflows ที่ใช้อยู่, Version history · 1/3: Model + data class, Output format, Knowledge, Tools, งานล่าสุด | ตัวอย่างคำสั่งคลิกแล้วไป Workspace ทันที |

**Responsive:** Sidebar → drawer (< lg), grid ลดคอลัมน์, Pipeline เปลี่ยนจากแนวนอนเป็นแนวตั้ง, ตารางเลื่อนแนวนอน, Modal เป็น bottom sheet บนมือถือ

## 6. Component list (`src/components`)

| Group | Components |
|---|---|
| `layout/` | `AppShell` (Sidebar, Topbar, GlobalSearch, mobile drawer) |
| `ui/Button` | variants: primary · secondary · ghost · subtle · danger; sizes sm/md/lg/icon; `to` → router Link |
| `ui/Badge` | `Badge`, `StatusPill` (Waiting/Processing/Completed/Sent back/Ready/Running), `ModelBadge` (Local/Cloud/Auto), `DeptBadge`, `ShareBadge`, `Rating` |
| `ui/Card` | `Card`, `CardHeader`, `PageHeader`, `StatCard`, `EmptyState`, `ProgressBar` |
| `ui/Form` | `Field`, `Input`, `Textarea`, `Select`, `SearchInput`, `Toggle`, `Segmented` (tabs), `ChoiceCard` (single/multi) |
| `ui/Overlay` | `Modal`, `Toaster`, `Avatar` |
| `agents/` | `EntityIcon` (agent = brand tint, skill = neutral), `AgentCard`, `AgentRow`, `FavoriteButton` |
| `skills/` | `SkillCard` |
| `workflow/` | `Pipeline` (run visual), `RunRow` (live mini-progress), `ArtifactView` (bullets/table/doc/diagram/checklist) |

Logic: `store/AppStore.jsx` (reducer + one clock for all runs) · `lib/runs.js` (planner, model router, step engine with loop-back) · `lib/mockOutputs.js`

## 7. Design system

| Token | Value | Use |
|---|---|---|
| Brand | Indigo `brand-50…900` (`#4F46E5` = 600) | Primary action, active Agent, selection — **สีเด่นสีเดียว** |
| Neutral | Slate; canvas `#F6F7F9`; card white + `slate-200` border | 90% ของหน้าจอ |
| Status | Brand = Processing · Emerald = Completed/Local · Amber = Sent back/Condition · Slate = Waiting/Cloud · Rose = Danger only | ใช้สีเฉพาะเมื่อสื่อความหมาย |
| Department | จุดสีเล็ก 6px (Core indigo, Sales sky, HR rose, IT teal, Accounting amber) | ไม่ใช้เป็นพื้นหลัง เพื่อไม่ให้หน้าจอรก |
| Type | Inter + IBM Plex Sans Thai; H1 24/600, section 15/600, body 14, meta 12, micro 11 | |
| Radius | 8px control · 12px card · 16px modal | |
| Elevation | border เป็นหลัก, shadow เฉพาะ hover/popover/modal | ดู enterprise ไม่ฟุ้ง |
| Motion | flow-dash บนเส้นเชื่อมที่กำลังส่งงาน, pulse ring บน Agent ที่ทำงาน, rise 250ms · ข้อยกเว้น: ตัวอย่างพิมพ์ทีละตัวอักษรในช่องพิมพ์ที่ยังว่าง (สอนว่าพิมพ์อะไรได้ หยุดทันทีเมื่อผู้ใช้พิมพ์ และปิดเมื่อตั้ง reduce motion) | การเคลื่อนไหว = สถานะ ไม่ใช่ตกแต่ง |
| Icon | lucide, 16–18px; Agent icon tile สี brand, Skill tile สีเทา | แยก Agent/Skill ได้ทันที |

## 8. Example dummy data (ดูไฟล์จริงใน `src/data/`)

- `catalog.js` — 5 departments, 7 users, 7 models (3 Local / 3 Cloud / Auto), 9 tools, 8 knowledge sources, share levels, data classes
- `agents.js` — 16 agents · `skills.js` — 16 skills · `workflows.js` — 5 node-graph workflows · `governance.js` — KPIs, usage, policies, permissions, audit log
- Seeded runs: 2 running (เดินช้าตลอดเดโม), 4 completed

```js
// agent example
{ id: 'agent-sales-proposal', name: 'Sales Proposal Agent', dept: 'sales', model: 'auto',
  skills: ['skill-requirement', 'skill-proposal-template', 'skill-pricing'],
  knowledge: ['kb-price', 'kb-cases'], tools: ['crm'],
  output: { format: 'Word document', language: 'TH', template: 'Sales Proposal v3' },
  share: 'company', owner: 'u-thanawat', rating: 4.9, uses: 4870, version: '3.0' }
```

## 9. ตัวอย่างต่อแผนก

| Dept | Agents | Skills | Workflow |
|---|---|---|---|
| **Sales** | Sales Proposal Agent, Customer Insight Agent (Local, Confidential) | Requirement Analysis, Proposal Template, Pricing Calculator | **Sales Proposal Pipeline**: Research → Sales Proposal → Document → Image → Review → ◇ข้อมูลครบ? (ไม่ → กลับ Research) → Output |
| **HR** | HR Policy Agent (Typhoon Thai, Local), Recruitment Screening, Onboarding | HR Policy Lookup, Company Report Format | **New Hire Onboarding**: Trigger → HR Policy → Onboarding → Report Format skill → Review → ส่งหัวหน้างาน |
| **IT** | IT Support Agent, Security Review Agent | ServiceNow Ticket, PDPA & Compliance, Secure Code Review | **IT Incident Triage**: IT Support → ◇แก้ได้แล้ว? (ยัง → Ticket skill) → แจ้งผู้ใช้ |
| **Accounting** | Invoice Reconciliation Agent, Budget Analysis Agent (Local ทั้งหมด) | 3-Way Match, Data Analysis, ICN Chart Style | **Month-end Close**: Invoice Recon → Budget → Document → Review → ส่ง CFO |

## 10. Prototype scope (2–4 สัปดาห์)

| Week | Scope | Status ใน repo นี้ |
|---|---|---|
| 1 | IA, design system, mock data, App shell, Home, Agent/Skill Library, Agent Detail | ✅ เสร็จ |
| 2 | Workspace + simulated orchestration (plan → run → handoff → loop-back → deliverable), Create Agent/Skill, Clone/Fork | ✅ เสร็จ |
| 3 | Workflow Builder (drag/drop, connect, condition loop, test run), Community, Governance | ✅ เสร็จ (เวอร์ชันเดโม) |
| 4 | Polish & pitch: ซ้อมสคริปต์เดโม, user test กับพนักงาน 5 คน, ปรับ copy, (ทางเลือก) เชื่อม LLM จริง 1 ตัวผ่าน Local model เพื่อพิสูจน์ provider-agnostic | ⏭ ถัดไป |

**ไม่อยู่ใน scope:** backend, auth/SSO, AI จริง, การเก็บข้อมูลถาวร (refresh = reset), การอัปโหลดไฟล์จริง

### Demo script (5 นาที)
1. Home — "นี่คือห้องทำงาน AI ของทั้งบริษัท" ชี้ Running workflows ของแผนกอื่นที่กำลังวิ่ง
2. กด chip "ทำ Proposal ให้ลูกค้า" → แสดงแผน → เริ่ม → ชี้ Agent ส่งต่องาน → Condition ส่งกลับ Research → Final Proposal
3. Agent Library → Clone Sales Proposal Agent → เปลี่ยนเป็นของแผนกตัวเองใน 30 วินาที
4. Skill Library → Add "Company Report Format" ให้ 3 Agents พร้อมกัน ("แก้ที่เดียว ทุก Agent ได้")
5. Workflow Builder → Test run บน canvas
6. Governance → 63% Local, ข้อมูลเงินเดือนถูก block — "ปลอดภัยและไม่ผูกกับ Provider"
