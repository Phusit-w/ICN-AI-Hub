# 07: Notify when a long Run finishes

**What to build:** When a multi-Agent Run finishes while the user is on another page or another Thread, a toast says it is done, with a link that opens the Run's Thread. No toast when the user is already looking at that Thread, and none for quick chat answers. Reuses the existing toast system; no browser notifications.

Spec: `.scratch/demo-two-views/spec.md` (stories 47–50).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Finishing on another page or Thread shows a toast; clicking it opens the Thread (one click)
- [x] No toast while viewing that Thread
- [x] No toast for chat Runs
- [x] Journeys cover all three cases
