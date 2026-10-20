# ICN AI Hub

An enterprise AI workspace where employees hand work to AI assistants in plain language, and reuse what worked.

## Language

### Assistants

**Agent** (ผู้ช่วย AI):
A single AI assistant with its own instruction, skills and knowledge, built for one kind of job.
_Avoid_: Bot, assistant profile

**Skill** (ทักษะ):
A reusable capability that any number of Agents can be given.
_Avoid_: Plugin, tool

**Workflow** (สายงาน):
A saved chain of Agents and Skills that hand work to each other in a fixed order, and can be run again on new input.
_Avoid_: Pipeline, flow, automation, template (a shared Workflow is used as-is, not copied from a template)

### Doing work

**Run** (งาน):
One request carried out by one or more Agents, producing an Artifact.
_Avoid_: Task, job, execution

**Thread** (แชต):
A conversation made of one or more Runs that follow on from each other.
_Avoid_: Session, conversation

**Artifact** (ผลงาน):
The deliverable a Run produces, such as a document, table or image.
_Avoid_: Output, result, message

**Save for reuse** (บันทึกไว้ใช้ซ้ำ):
Turning a finished Run into something the user can use again: an Agent when one Agent did the work, a Workflow when several did.
_Avoid_: Save as workflow, save as agent
