# 08: Clean Agent and Workflow cards

**What to build:** Agent and Workflow cards show only an icon, name, one-line description and a "ใช้งาน" button.
- Clicking anywhere else on the card opens its details.
- The Favourite star appears when the card is hovered or has keyboard focus.
- Uses, rating and version move from the cards to the detail pages.
- Advanced filters stay hidden by default.

Spec: `.scratch/simpler-pages/spec.md` (stories 32–34, 37–38, 42; decision "Card shape").

**Blocked by:** 07 (same pages)

**Status:** resolved

- [ ] Agent and Workflow cards share the same shape: icon, name, one-line description, "ใช้งาน"
- [ ] Clicking a card outside the button opens its details, and clicking "ใช้งาน" doesn't
- [ ] The Favourite star shows on hover and on keyboard focus, and starring still adds the Agent to the reuse row on Home
- [ ] Uses, rating and version appear on the detail pages and not on the cards
- [ ] Journey tests still pass
