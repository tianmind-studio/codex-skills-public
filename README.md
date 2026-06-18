# Codex Skills Public

Reusable Codex skills for practical agent work: implementation review, debugging,
research, web reading, writing, document QA, frontend design, H5/mobile QA, and
WeChat Mini Program delivery.

This repository is a public-safe subset of a larger private skill library. It is
kept intentionally focused: skills here should be useful to other Codex users,
installable without private context, and free of customer or infrastructure
details.

## Included Skills

| Skill | Purpose |
|---|---|
| `check` | Post-implementation verification and review discipline |
| `hunt` | Root-cause-first debugging workflow |
| `think` | Planning before feature, design, architecture, or product work |
| `learn` | Research workflow from source collection to usable synthesis |
| `read` | Fetch URLs and PDFs into clean Markdown |
| `write` | Chinese and English prose polishing |
| `english-coach` | English practice, correction, and expression coaching |
| `design` | Visual product/UI design judgment |
| `frontend-design` | Frontend interface design guidance for real apps |
| `document-quality-gate` | Artifact-first QA gate for DOCX/PPTX/PDF deliverables |
| `chart-language-quality-gate` | Neutralize evaluator-facing or overly salesy chart labels before delivery |
| `docx-toolkit` | Add Word-native table of contents and Chinese page numbering to DOCX files |
| `h5-interaction-qa` | Playwright-based route, click, overflow, and overlap QA for static H5 demos |
| `wechat-miniapp-factory` | Generate runnable WeChat Mini Program projects from a brief |
| `wechat-miniapp-reviewer` | Pre-submission review for WeChat Mini Programs |

## Install

Install all skills into the active Codex home:

```bash
./scripts/install.sh
```

Install selected skills:

```bash
./scripts/install.sh check hunt docx-toolkit
```

By default, skills are installed into:

```text
${CODEX_HOME:-$HOME/.codex}/skills
```

## Validate

Run the basic Codex skill validator:

```bash
./scripts/validate.sh
```

The script uses Codex's bundled `quick_validate.py` when available. If the
validator is not installed, it falls back to checking that every skill directory
contains a `SKILL.md` file.

## Contribute

Contributions are welcome when they improve a public, reusable Codex workflow.
Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Public Boundary

This repository does not include private deployment runbooks, customer-specific
workflows, anti-detection writing workflows, commercial delivery operations, or
large third-party/vendored suites with separate license obligations.

See [docs/selection-policy.md](docs/selection-policy.md) for the selection and
exclusion rules.

## License

MIT, unless a specific file or subdirectory says otherwise.

---

# Codex Skills Public（中文）

这是一个可公开使用的 Codex skill 精选包，面向真实工作流：代码检查、调试、研究、网页读取、写作、正式文档 QA、前端设计、H5/mobile QA 和微信小程序生成/提审前检查。

这个仓库不是私有 skill 母库的完整公开版，而是经过筛选的公共子集：只保留别人能看懂、能安装、能复用，且不依赖私人上下文的部分。
