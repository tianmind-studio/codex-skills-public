---
name: document-quality-gate
description: Use whenever the user asks Codex to create, edit, convert, review, polish, format, typeset, or deliver a formal document artifact where layout quality matters. Trigger for Word/DOCX, PPT/PPTX, slide decks, presentations, PDF deliverables, Markdown-to-DOCX, reports, memos, proposals, contracts, bids, theses, papers, coursework, client-ready files, and Chinese requests such as 文档, Word, DOCX, PPT, PPTX, PDF, 报告, 论文, 标书, 合同, 排版, 格式, 页码, 目录, 正式文档, 交付文件, 格式检查, or 美化. Use as a strict quality router alongside specialized skills such as documents, docx-toolkit, ppt-master, Presentations, Spreadsheets, Pandoc, LibreOffice, Poppler, and OpenAI/Anthropic-style document skills. Do not use for ordinary code comments, README edits, or prose-only chat unless the user wants a file or rendered deliverable.
---

# Document Quality Gate

## Purpose

Make formal document work artifact-first, template-aware, and render-verified. The gate exists because chat-formatted text and structural XML checks miss the failures users actually see: broken spacing, clipped text, bad page breaks, unreadable tables, missing fonts, and AI-looking default styling.

## Default Quality Level

Use `strict` for client-ready files, academic/business deliverables, and any Chinese request containing "正式", "排版", "格式", "美化", "交付", "论文", "标书", or "报告".

- `quick`: create/edit the artifact, run structural checks, render if cheap.
- `standard`: use a template/reference where available, render all pages/slides, fix visible defects.
- `strict`: route through the strongest specialized skill, use template/reference assets, render all pages/slides, make at least one critical inspection pass, fix defects, re-render affected pages/slides, and keep a rebuildable source when possible.

## Routing

Use the most specific available skill first, then return to this gate for QA.

- New or heavily rewritten DOCX: use `documents:documents` when available; otherwise use `python-docx`, `docx-js`, or Pandoc with `reference.docx`.
- Existing DOCX needing automatic TOC or Chinese page numbering: use `docx-toolkit`, then render-check.
- Markdown to DOCX: prefer Pandoc with a maintained `reference.docx`; use custom styles or filters when the target style needs more than default headings/tables.
- PPTX/decks: use Presentations, `ppt-master`, or an OpenAI-slides-style PptxGenJS workflow. Keep authoring source (`.js`, JSX, YAML, or Markdown) when a deck is generated.
- Dense consulting/table slides: consider a constrained YAML/table-slide workflow rather than freeform slide generation.
- PDF final deliverables: render PDF pages to PNG and inspect final pages, even if the source DOCX/PPTX passed.
- Spreadsheets intended for client delivery: use the spreadsheet workflow, export or render the relevant sheets, and check page setup/print area.

For detailed standards, read `references/format-playbook.md` when the task is substantial, high-stakes, or when a prior format pass was unsatisfactory.

## Required Workflow

1. Identify the artifact type, source materials, template/reference files, and target quality level.
2. Create or edit an actual file. Do not treat a chat answer as the final document.
3. Preserve real document semantics: Word styles, heading outline levels, native lists, table grids, slide masters, speaker notes, formulas, page fields, and editable charts where practical.
4. Use explicit templates and styles. For DOCX from Markdown, prefer `--reference-doc=...`; for PPTX, set slide size, theme fonts, and layout system up front.
5. Render the output before delivery whenever possible.
6. Inspect rendered pages or slides for layout defects, not just textual correctness.
7. Fix defects and re-render affected pages/slides. For `strict`, do at least one fix-and-verify loop if any defect is found.
8. In the final response, provide the final artifact path and say what verification ran. If render QA was impossible, state the missing dependency and residual layout risk.

## Render Helper

Use specialized renderers first when a skill provides them. Generic fallback:

```bash
python3 ${CODEX_HOME:-$HOME/.codex}/skills/document-quality-gate/scripts/render_artifact.py /path/to/file.docx --out /tmp/doc_quality_render
```

The helper supports `.docx`, `.pptx`, `.xlsx`, and `.pdf` when LibreOffice/Poppler are installed. It prints the rendered page/slide PNG paths and creates a simple manifest.

Manual fallback:

```bash
soffice -env:UserInstallation=file:///tmp/lo_profile_$$ --headless --convert-to pdf --outdir "$OUTDIR" "$INPUT"
pdftoppm -png -r 150 "$PDF" "$OUT_PREFIX"
```

## Visual Checklist

Inspect every rendered page or slide at normal reading zoom.

- No clipped, overlapped, missing, or boundary-hugging text.
- Tables fit margins, use intentional column widths, readable padding, and repeated headers where needed.
- Lists use native bullets/numbering, consistent indentation, and readable spacing.
- Headings use a coherent hierarchy and do not float too far from their content.
- Page breaks, figure/table captions, footers, page numbers, citations, charts, and images do not collide.
- Fonts render correctly, especially Chinese fonts and math/symbol glyphs.
- PPTX slides have explicit theme fonts, stable margins, readable title/body scale, and no placeholder residue.
- Output does not look like default-template AI output: no generic blue-only styling, random cards, cramped walls of text, or decorative filler.

## Delivery Rules

- Keep final artifacts near the source or requested output directory; keep QA renders in a clearly named review folder or temp workspace.
- For generated decks, deliver the `.pptx` and retain/deliver the rebuildable source when useful.
- For Word TOC fields, remind the user only when necessary that Word may require `Ctrl+A` then `F9` to update fields.
- Do not quote private raw source/session content in QA notes unless the user asks.
