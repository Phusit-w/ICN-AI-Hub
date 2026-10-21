# 04: Home reuse row and cleaner Home

**What to build:** Under Home's command box is a "ใช้ซ้ำ" row that combines Favourite agents and Workflows the user uses often or used recently, including anything they just saved for reuse.
- Clicking an item fills it into Home's command box as the picked Agent or Workflow, without leaving Home.
- The pick is shown clearly and can be cleared in one click.
- Sending carries the pick to the Workspace, where the Run starts immediately.

The rest of Home:
- The popular task grid becomes small example chips that only show when the user has no Runs yet.
- "My Runs" shows 3–5 items, running ones first.
- The welcome card keeps its show-once rule.

Home's composer and the Workspace composer share the logic for showing and clearing a pick (an Agent pick or a Workflow pick, never both) instead of duplicating it.

Spec: `.scratch/simpler-pages/spec.md` (Home stories 1–11, 23; decisions "Reuse row on Home" and "Home structure").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Journey test: clicking a Favourite agent in the reuse row fills the command box and the URL stays on Home (1 click)
- [ ] Journey test: clicking a Workflow in the reuse row fills the command box and the URL stays on Home (1 click), and sending runs it with no Plan confirmation
- [ ] The pick can be cleared in one click, which returns to letting the system choose
- [ ] Journey test: after "บันทึกไว้ใช้ซ้ำ" on a finished Run, the saved Agent or Workflow appears in the reuse row
- [ ] Example task chips show only when the user has no Runs
- [ ] Journey test: opening a past Run from "my Runs" takes 1 click
- [ ] Empty states (no favourites, no Runs) tell the user what to do next
- [ ] Home follows the Clean rules: one primary button, no nested bordered cards
