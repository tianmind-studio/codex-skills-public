---
name: chart-language-quality-gate
description: Use when formal document, PPT, report, proposal, thesis, competition, business plan, or client deliverable charts/figures may contain overly explicit, evaluator-facing, internal, salesy, or "AI-looking" labels. Trigger for Chinese phrases such as 图表太露骨, 图片说得太露骨, 评审关注点, 评审含义, 目标机会区, 让评审看到, 给评委看的, 像小抄, 不合适, 图表话术, 降露骨, 商业计划书图表, 三创赛图表, 项目书图片, or when polishing chart assets in formal deliverables.
---

# Chart Language Quality Gate

## Purpose

Formal deliverable charts should look like evidence and analysis, not like private notes telling reviewers how to score the project. This skill catches and rewrites chart text that exposes internal intent, over-explains strategy, or sounds like a pitch prompt.

## When Triggered

Use this skill before finalizing DOCX/PDF/PPTX deliverables when the user flags a chart or when chart assets contain labels such as:

- `评审关注点`, `评审含义`, `评委只需要判断`, `让评审看到`, `现场展示重点`
- `目标机会区`, `必答`, `加分点`, `小抄`, `不是...而是...`
- `唯一`, `吊打`, `碾压`, `领先`, `护城河`, `壁垒`, `赋能`, `抓手`
- Repeated `闭环` in large chart titles or callouts where `路径`, `流程`, `衔接`, or `服务链路` would be more natural

## Workflow

1. Locate chart assets and embedded media.
   - Search nearby source folders such as `_polish_assets`, `assets`, `images`, `figures`, `slides`, and generated media inside DOCX/PPTX packages.
   - Make a contact sheet for visual review when there are many chart images.
   - Search visible text in source scripts/Markdown/XML where available.

2. Classify each hit.
   - Keep normal analytical labels, axis names, captions, metrics, assumptions, and data source notes.
   - Rewrite evaluator-facing or internal coaching text.
   - Rewrite overconfident comparative language into neutral positioning language.
   - Do not remove useful evidence; change the framing.

3. Rewrite using public-facing chart language.
   - `评审关注点` -> `图表说明`, `图表解读`, `验证要点`
   - `目标机会区` -> `差异化空间`, `重点服务区`, `潜在服务空间`
   - `评委只需要判断...` -> `后续用试点数据持续跟踪...`
   - `现场展示重点` -> `流程说明`, `演示路径`, `使用流程`
   - `不是又一个...而是...` -> direct analytical description without the contrastive slogan
   - `商业模式评价三问` -> `商业模式验证要点`
   - `膳食履约闭环` -> `膳食服务衔接`, `食材服务路径`, or `测评至复测路径`

4. Keep captions synchronized.
   - If the chart title changes, update nearby figure captions and references.
   - Avoid a neutral chart image paired with an old explicit caption.

5. Verify visually.
   - Re-render the artifact to PDF or page images.
   - Inspect the affected pages at normal reading zoom and as a full-page view.
   - Check that text remains legible after scaling into the document.
   - Confirm page count and obvious layout stability.

6. Record the decision for client/reviewer feedback workflows.
   - If a project-local 修改意见记录 exists, add or update the item.
   - Note which figures were changed and what verification ran.

## Tone Rules

- Prefer neutral nouns: `说明`, `解读`, `路径`, `要点`, `材料`, `支撑`, `验证`, `衔接`.
- Avoid telling the reader how to judge the work.
- Avoid internal stage directions such as `现场`, `评审`, `评委`, `路演必答` inside deliverable figures unless the artifact is explicitly a private rehearsal script.
- Use confidence with restraint: say `相对差异`, `服务侧重点`, `可验证路径`; avoid `唯一`, `碾压`, `绝对领先`.

## Minimal QA Checklist

- No chart contains reviewer-coaching words unless it is a private Q&A/script artifact.
- Chart titles, callouts, legends, axes, and captions use the same public-facing wording.
- The revised image is actually embedded in the DOCX/PPTX/PDF, not only changed on disk.
- Final PDF/page render shows no clipped or tiny callout text.
