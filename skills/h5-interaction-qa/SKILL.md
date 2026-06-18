---
name: h5-interaction-qa
description: Use after editing a static H5/mobile web demo, single-file HTML app, or hash-routed prototype. Trigger for 按钮点不了、退不了、跳不了、遮盖、重叠、H5检查、手机页面检查、不要每次手动检查, or when a button cannot go back, click, or navigate. Verifies data-goto navigation, browser hash routing, images, overflow, pointer-event interception, and key visual block overlap with Playwright.
---

# H5 Interaction QA

Run this skill after changes to static H5 demos or hash-routed prototypes.

## Required Checks

1. Use Playwright on mobile viewports, normally `390x844`, `390x720`, and `430x932`.
2. Visit every `[data-screen]` route by hash.
3. On each screen, click every visible `[data-goto]` control.
4. Fail if Playwright reports that another element intercepts pointer events.
5. Fail if the active screen after clicking does not match `data-goto`.
6. Check broken images and horizontal overflow.
7. Check key visual blocks for accidental overlap on mobile viewport.
8. For board-game / map-game H5 pages, also check portrait mobile layout: `.board-title` must not cover `.board-cell`, `.board-cell` items must not overlap each other, and dice/card overlays must stay out of the main route labels.
9. For card-based board controls, check that card buttons stay within safe control dimensions, do not overlap the map panel, and do not overlap dice controls. This catches legacy `.map-cards` rules accidentally stretching board cards into full-screen artwork.
10. Repackage only after this check passes.

## Script

Use the bundled script when possible:

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/h5-interaction-qa/scripts/check_h5_routes.js" /absolute/path/to/index.html
```

The script requires Playwright in the active Node environment. It exits non-zero on route failures, click interception, broken images, console errors, horizontal overflow, or key visual block overlap.
When lazy-loading is used, the image check should evaluate images visible in the active viewport instead of every hidden-screen image, otherwise deferred images can be mistaken for broken assets.

## Fix Pattern

If a visible button cannot be clicked and Playwright says an element intercepts pointer events, inspect stacking order first:

- Compare the target button `z-index` with nearby full-width headers or overlays.
- Remember that a later rule with the same specificity can override an earlier `z-index`.
- Prefer raising only navigation controls such as `.back-btn` or disabling pointer events only on purely decorative overlays.
- Re-run the script before final delivery.

If visual blocks overlap, inspect absolute positioning and responsive height rules first:

- Avoid placing multiple cards with independent `bottom` values unless there is a measured gap.
- For stacked game/H5 panels, keep at least 16 CSS px between neighboring cards at standard and short-height mobile viewports.
- Move decorative/status chips away from main CTA and primary content cards.
- For monopoly-style boards, make a dedicated portrait override instead of relying on the landscape layout: shrink or move `.board-title`, recompute `.board-cell` positions, and verify at `390x844`, `390x720`, and `430x932`.
- Keep board card controls isolated from old generic map-card selectors. Prefer a dedicated wrapper such as `.board-card-stack` without also using legacy `.map-cards`, then add a final hard-lock rule for `.board-card-token` width, height, flex-basis, min/max dimensions, and image `object-fit`.
