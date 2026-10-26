# 03: Feedback 👍/👎 replaces star ratings

**What to build:** Under each Artifact a User can give Feedback: 👍 or 👎, with an optional short reason after 👎, and can change it. An Agent page shows "มีประโยชน์ X% จาก N ครั้ง" from seeded Feedback plus live Feedback on Runs that used the Agent, or says there is no Feedback yet. One function computes the summary so every place agrees. Star ratings disappear from every card and page, and the "คะแนนสูงสุด" sort is removed; anything that ranked by rating (e.g. reuse suggestions) ranks by uses/recency instead.

Spec: `.scratch/demo-two-views/spec.md` (stories 27–33).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] 👍/👎 under each finished Artifact; 👎 offers an optional reason; the verdict can be changed
- [x] Agent page shows helpful % and count, updating right after the user's Feedback
- [x] An Agent with no Feedback says so instead of 0%
- [x] No stars on Agent, Skill or Workflow cards or pages; no rating sort option
- [x] No rating field left in mock data or drafts
- [x] Journeys cover giving, changing and the summary update; existing journeys asserting ratings are updated
