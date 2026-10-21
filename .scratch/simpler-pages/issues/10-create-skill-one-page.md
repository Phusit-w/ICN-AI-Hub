# 10: Create a Skill the same way as an Agent

**What to build:** Creating a Skill works like creating an Agent: the user describes the Skill in plain language, AI fills the form on one page, and the user clicks create.
- Extra settings sit behind "ตั้งค่าขั้นสูง".
- It is reachable from the Skills tab.
- Every creation page (Agent and Skill) has exactly one primary button.
- Creating an Agent from Home takes 3 clicks or fewer.

Spec: `.scratch/simpler-pages/spec.md` (stories 47–50; decision "Creation pages").

**Blocked by:** 05

**Status:** resolved

- [ ] Create Skill has a describe box, an AI-fill action and a create button on one page
- [ ] Extra Skill settings are behind "ตั้งค่าขั้นสูง"
- [ ] Journey test: creating an Agent from Home takes ≤ 3 clicks (journey 4)
- [ ] Journey test: creating a Skill from the Skills tab follows the same short path
- [ ] Each creation page has exactly one primary button
