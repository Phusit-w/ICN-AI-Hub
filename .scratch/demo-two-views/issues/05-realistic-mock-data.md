# 05: Mock data tells one story — ICN three months after launch

**What to build:** Every number in the demo fits "about 3 months after launch, ~25 Users of ~60 staff": per-item uses in the tens to low hundreds, versions mostly 1.x with 1–3 history entries, department User counts summing to the total shown, cost history covering only the months since launch, and IT figures sized for a one-person team. Connected systems become generic (web search, company shared folder, accounting system (ERP), company email draft, document generator, image generator, Python sandbox); Salesforce, ServiceNow and Confluence go, and whatever used them is reworded (IT Support drafts an email to IT instead of opening a ticket). Models become Auto routing, one internal Thai-capable model on the on-premise GPU, and Claude; governance's model breakdown shows those two. Coding Agent and Security Review Agent are removed and references re-pointed. Every audit log entry names a fictional person (no "Unknown device"). A new consistency test (seam 2) guards the story.

Spec: `.scratch/demo-two-views/spec.md` (stories 25, 26, 34–42; Testing Decisions, seam 2).

**Blocked by:** 03

**Status:** done

- [x] Consistency test: each item's uses fit within total Runs since launch; department Users sum to the total; no rating fields; no Salesforce/SAP/ServiceNow/Confluence; every owner and actor resolves to a known fictional persona; only the agreed models exist
- [x] No Coding Agent or Security Review Agent, and nothing links to them
- [x] Audit log names a person on every line
- [x] All staff names fictional, resembling no one on the ICN org chart
- [x] Existing journeys asserting old numbers are updated
