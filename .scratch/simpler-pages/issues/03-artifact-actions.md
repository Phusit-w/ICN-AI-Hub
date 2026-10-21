# 03: Clean actions under a finished Artifact

**What to build:** Under every finished Artifact, for both chat Runs and multi-Agent Runs, "ดาวน์โหลด" is the single primary action, "บันทึกไว้ใช้ซ้ำ" is a visible secondary action, and copy, share and "ดูขั้นตอน" live in a "⋯" menu.

Spec: `.scratch/simpler-pages/spec.md` (stories 20–22; decision "Actions under a finished Artifact").

**Blocked by:** 02 (same part of the Workspace)

**Status:** resolved

- [ ] Exactly one primary button under a finished Artifact, and it is "ดาวน์โหลด"
- [ ] "บันทึกไว้ใช้ซ้ำ" is visible without opening any menu
- [ ] Copy, share and "ดูขั้นตอน" are in a "⋯" menu that opens with one click and works from the keyboard, and each item keeps its accessible name
- [ ] "ดูขั้นตอน" from the menu opens the side panel from ticket 02
- [ ] The same layout applies to chat Runs and multi-Agent Runs
- [ ] Journey tests still pass
