# 09: Simple Workflow editor by default

**What to build:** Editing a Workflow opens the simple editor (ordering Agents up and down) by default. The detailed builder is reached through a quiet "ขั้นสูง" link instead of a button next to "บันทึก" and "ลองรัน". The editor has exactly one primary button.

Spec: `.scratch/simpler-pages/spec.md` (stories 44–45; decision "Workflow editing").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Opening a Workflow to edit shows the simple editor first
- [ ] The detailed builder is reached from a low-emphasis "ขั้นสูง" link
- [ ] The editor has exactly one primary button
- [ ] Saving and "ลองรัน" still work, and "ลองรัน" starts the Run immediately because the user picked the Workflow
