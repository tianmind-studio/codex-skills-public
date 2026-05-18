# Format Playbook

## Strategy

The best document workflows reduce freedom before styling begins:

- Use templates, reference documents, or a constrained layout system.
- Keep source artifacts rebuildable: Markdown plus reference DOCX, JS/JSX/YAML for slides, or structured data for tables/charts.
- Render early. Rendering after everything is finished makes every fix expensive.
- Treat QA as bug hunting. If the first render has no issues, inspect again more critically.

## DOCX

Prefer `documents:documents` for serious DOCX creation/editing. It already has strong rules for Word-compatible tables, lists, page furniture, and PNG render verification.

Use these routing rules:

- New professional DOCX: define page geometry, typography, heading ladder, table treatment, headers/footers, and list styles before writing content.
- Existing DOCX small edits: preserve the original structure and make local changes.
- Existing DOCX formalization: first preserve content, then normalize styles, add native TOC/page fields if requested, and render-check.
- Markdown-to-DOCX: use Pandoc with `--reference-doc`. The reference file should usually be a modified Pandoc reference document, not an arbitrary Word file.
- Style preservation from source DOCX: consider `pandoc -f docx+styles` when extracting/reusing existing styles.
- Tracked changes/comments: use document-specific tooling; do not flatten unless the user asks for finalization.

DOCX danger signs:

- Manual bullets or numbered lists typed as plain text.
- Tables without explicit width/grid/cell widths.
- Fixed row heights that can clip text.
- Headings simulated with direct formatting instead of styles.
- Wide tables pushed beyond page margins.
- Chinese text rendered with missing or substituted fonts.

## PPTX

Prefer Presentations or a PptxGenJS/OpenAI-slides-style workflow for high-polish editable decks.

Use these rules:

- Set aspect ratio and theme fonts before slide creation.
- Keep text editable. Use native PowerPoint charts for simple charts.
- Use generated SVG/raster only for visuals PowerPoint cannot represent cleanly.
- Preserve or provide authoring source: `.js`, JSX, YAML, or Markdown.
- Render slides to PNG and optionally create a contact sheet for quick scanning.
- Run overflow/out-of-bounds/font diagnostics when available.
- For dense consulting-style table slides, prefer a constrained YAML/table-slide workflow over freeform layouts.

PPTX danger signs:

- Text-only title-and-bullet slides.
- Low contrast, missing fonts, or titles wrapping into decorative lines.
- Inconsistent margins or slide-to-slide rhythm.
- Placeholder text, repeated generic card grids, or random accent colors.
- Rasterized text that should remain editable.

## PDF

PDF is usually the final inspection surface. Even if the source file looks structurally fine, render or inspect the PDF pages before delivery.

Check:

- Page count and order.
- Cropping, margins, headers/footers, page numbers.
- Font embedding/substitution when visible.
- Image resolution and chart readability.
- No accidental blank pages or stale tracked-change/comment artifacts.

## Quality Levels

Use this matrix to avoid both under-checking and over-processing:

- `quick`: internal or draft output. Structural check plus render if easy.
- `standard`: user-facing output. Template/reference, full render, visible defect fixes.
- `strict`: client/academic/business handoff. Specialized skill, full render, critical inspection, fix/re-render loop, source preservation, final path plus verification note.

## Sources To Prefer

- OpenAI DOCX skill pattern: `python-docx` or structured tooling plus `render_docx.py`/LibreOffice/Poppler visual checks.
- OpenAI Slides skill pattern: PptxGenJS, explicit theme fonts, render utilities, overflow/font diagnostics, and source `.js` delivery.
- Anthropic DOCX/PPTX skill pattern: unpack/edit/repack for existing Office files, Pandoc/MarkItDown extraction, and PNG visual verification.
- Pandoc pattern: `reference.docx` / `reference.pptx`, custom styles, Lua filters, and style-preserving extraction when needed.
- Clean Slides pattern: constrain dense strategy slides to structured YAML/table specs so layout is consistent and editable.
