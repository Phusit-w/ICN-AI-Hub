# 02: Workspace decides chat vs Plan by itself, with the step view as a side panel

**What to build:** The chat/Workflow mode toggle disappears from the Workspace. The system decides with a single rule:
- a short question is answered straight away as chat
- if the user picked an Agent or Workflow, the Run starts immediately
- if the system planned several Agents itself (including matching a Workflow by keyword), the Run stops at the **Plan** and waits for "เริ่มเลย"

The pipeline view that the toggle used to show opens as a panel on the right of the Thread from "ดูขั้นตอน", and closes again. Step chips stay in the conversation while a Run is working.

Note: today's default chat mode auto-starts system-planned multi-Agent Runs. After this ticket those stop at the Plan.

Spec: `.scratch/simpler-pages/spec.md` (Workspace stories 12–19, 24–25; decisions "Remove the Workspace mode toggle" and "Step view as a side panel").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] No mode toggle and no saved mode preference remain, and the word "Workflow" is not used for a view mode anywhere in the Workspace UI
- [ ] Journey test: a short general question gets an answer with no extra click
- [ ] Journey test: a multi-Agent request with nothing picked shows the Plan, and one click on "เริ่มเลย" runs it to an Artifact (journey 1 ≤ 2 clicks)
- [ ] Journey test: a request with a picked Agent or a picked Workflow starts immediately with no Plan confirmation
- [ ] The Plan can still be edited (remove a step) before starting
- [ ] "ดูขั้นตอน" opens a right-side panel showing the steps, and it can be closed in one click
- [ ] The Thread history still collapses and expands, and the sensitive-data notice still shows
- [ ] Works at phone width without sideways scrolling
