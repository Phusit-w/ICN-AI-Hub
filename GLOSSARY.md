# ICN AI Hub

An enterprise AI workspace where employees hand work to AI assistants in plain language, and reuse what worked.

## Language

### Assistants

**Agent** (AI Agent):
An AI assistant with its own instruction, skills and knowledge, built for one kind of job; it may carry Steps when the job takes several stages. The only kind of thing a User builds, uses and shares.
An Agent that carries Steps is called a team (ทีม) in the interface, so it reads apart from a single-purpose Agent at a glance.
_Avoid_: Bot, assistant profile, Workflow, สายงาน (there is no separate Workflow: a multi-stage job is an Agent with Steps)

**Personal agent** (Agent ส่วนตัว):
The one Agent every User has for themselves: it learns what they do, decides how each request is carried out (answer, Plan, or an Agent borrowed from the library), and speaks to them in the app and in their Channels. The User can name it; "Agent ของคุณ" is the starting name.
_Avoid_: Assistant, bot, "อัตโนมัติ" (that was the choice that no longer exists beside it)

**Step** (ขั้นตอน):
One stage inside an Agent that hands the work to another Agent; Steps run in order, each taking what the one before produced. Only an Agent without Steps of its own can be a Step.
_Avoid_: Node, task

**Skill** (ทักษะ):
A reusable capability that any number of Agents can be given; chosen while building an Agent, not something a User goes looking for on its own.
_Avoid_: Plugin, tool

**Favourite agent** (Agent ประจำ):
An Agent a user has starred so it stays at hand on the Agents page. It is not shown on Home (there is no reuse row); it is also chosen from the composer's Agent menu.
_Avoid_: Pinned agent, bookmark

### Doing work

**Run** (งาน):
One request carried out by one or more Agents, producing one or more Artifacts (a team gives each Step's Artifact).
_Avoid_: Task, job, execution

**Plan** (แผนงาน):
The ordered list of Agents the Personal agent proposes for a Run when the user did not pick an Agent themselves; the user confirms it before the Run starts.
_Avoid_: Workflow, workflow mode (a Plan is not saved; Save for reuse turns it into an Agent with Steps)

**Thread** (แชต):
A conversation made of one or more Runs that follow on from each other.
_Avoid_: Session, conversation

**Schedule** (ตั้งเวลา):
A rule on a User's Personal agent that it does a job at a set time, such as every Monday 20:00; each time it fires, a new Run is added to the same Thread, covering the period since the last one.
_Avoid_: Cron, automation, trigger

**Artifact** (ผลงาน):
The deliverable a Run produces, such as a document, table or image.
_Avoid_: Output, result, message

**Desk** (พื้นที่ทำงาน):
The area beside the Thread where a Run's Plan, progress and Artifacts are shown; the Thread itself only talks. It opens by itself on a finished Run and stays closed while one is running until the User expands it.
_Avoid_: Panel, canvas, preview

**Memory** (ความจำ):
What a Personal agent keeps about its User, such as their role, routine jobs and preferred report style. Shown to the User, who can edit or delete any of it; private to them, and never carried along when they share an Agent.
_Avoid_: Profile (the page that shows it is called "สิ่งที่ Agent รู้เกี่ยวกับคุณ"), history

**Connection** (การเชื่อม):
The link a User gives their Personal agent to an outside app or Channel: LINE, email, Office365 or the Office Add-in. An Admin switches each kind on for the company and can cut one person's Connection.
_Avoid_: Integration, plugin

**Channel** (ช่องทาง):
A place outside the web app where a User talks to their Personal agent, such as LINE (one-to-one, or in a group when called with @) or the Office Add-in beside a Word, Excel or PowerPoint file.
_Avoid_: Bot, integration

**Outward action** (การลงมือออกนอก):
Anything a Personal agent does that leaves the app: sending an email, posting in a LINE group, adding a row to an Excel file. Needs the User's yes each time, unless the User has set that kind to automatic. Reading and drafting are not Outward actions.
_Avoid_: Write access, permission

**Cube**:
The small face that stands for an Agent: its body shape, eyes, colour and accessory. The User can switch every Cube off with the button at the foot of the sidebar; the app then shows plain icons.
_Avoid_: Avatar, mascot, robot

**Save for reuse** (บันทึกไว้ใช้ซ้ำ):
Turning a finished Run into an Agent the user can use again; when several Agents did the work, the new Agent carries them as Steps.
_Avoid_: Save as workflow, save as agent

**Feedback** (👍/👎):
A user's verdict on one Artifact, helpful or not, with an optional reason when not; summed per Agent for its maker and the Admin.
_Avoid_: Rating, stars, score

### People

**User** (ผู้ใช้ทั่วไป):
Any employee. Uses Agents, creates their own, and shares them with their department.
_Avoid_: Employee role, Agent Creator, Department Admin (a department's champion is a User who built that department's Agents)

**Admin** (แอดมิน):
The one or two people who run the platform: see usage and cost, set data policies, and approve sharing with the whole company.
_Avoid_: Platform Admin, AI CoE, reviewer

**Company sharing request** (คำขอแชร์ทั้งบริษัท):
A User's request to share an Agent or Skill with everyone; it is shared only after an Admin approves it. An Agent with Steps is requested together with the Agents in its Steps.
_Avoid_: Review, publish
