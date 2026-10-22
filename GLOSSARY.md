# ICN AI Hub

An enterprise AI workspace where employees hand work to AI assistants in plain language, and reuse what worked.

## Language

### Assistants

**Agent** (AI Agent):
An AI assistant with its own instruction, skills and knowledge, built for one kind of job; it may carry Steps when the job takes several stages. The only kind of thing a User builds, uses and shares.
An Agent that carries Steps is called a team (ทีม) in the interface, so it reads apart from a single-purpose Agent at a glance.
_Avoid_: Bot, assistant profile, Workflow, สายงาน (there is no separate Workflow: a multi-stage job is an Agent with Steps)

**Step** (ขั้นตอน):
One stage inside an Agent that hands the work to another Agent; Steps run in order, each taking what the one before produced. Only an Agent without Steps of its own can be a Step.
_Avoid_: Node, task

**Skill** (ทักษะ):
A reusable capability that any number of Agents can be given; chosen while building an Agent, not something a User goes looking for on its own.
_Avoid_: Plugin, tool

**Favourite agent** (Agent ประจำ):
An Agent a user has starred so it stays at hand on Home, the Agents page and the composer.
_Avoid_: Pinned agent, bookmark

### Doing work

**Run** (งาน):
One request carried out by one or more Agents, producing an Artifact.
_Avoid_: Task, job, execution

**Plan** (แผนงาน):
The ordered list of Agents the system proposes for a Run when the user did not pick an Agent themselves; the user confirms it before the Run starts.
_Avoid_: Workflow, workflow mode (a Plan is not saved; Save for reuse turns it into an Agent with Steps)

**Thread** (แชต):
A conversation made of one or more Runs that follow on from each other.
_Avoid_: Session, conversation

**Artifact** (ผลงาน):
The deliverable a Run produces, such as a document, table or image.
_Avoid_: Output, result, message

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
