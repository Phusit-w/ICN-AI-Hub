# 01: Journey test harness and tests of the current app

**What to build:** A developer can run `npm test` and get whole-app journey tests. Each test renders the whole app in an in-memory router starting at Home, drives it with clicks and typing like a user, and asserts both that the journey finished and that it stayed within its click budget (see the spec's click budget table). This ticket captures **today's** behaviour so later tickets can turn the budget assertions green one at a time.

Spec: `.scratch/simpler-pages/spec.md` (Testing Decisions).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Vitest, React Testing Library, user-event and jsdom are dev dependencies, and `npm test` runs the suite once and exits
- [ ] A small helper counts user clicks during a journey, so a test can assert "finished within N clicks"
- [ ] Tests use fake timers to advance Runs to completion
- [ ] Browser storage is cleared between tests, so each one starts from the default mock data
- [ ] One journey test for each of the 5 journeys (new request → Artifact; reuse a Favourite agent or Workflow; open a past Run; create an Agent; find something shared and use it)
- [ ] Budget assertions that today's app doesn't meet are marked as expected to fail, with a note naming the ticket that should fix them
- [ ] Tests only use what the user can see and do (roles, accessible names, visible text, current URL), never the store or component internals
- [ ] `npm run build` still passes
