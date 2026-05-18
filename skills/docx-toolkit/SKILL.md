---
name: docx-toolkit
description: 给已有的 docx 文件加 Word 原生「自动目录字段（TOC field）」和/或「中文页脚页码（第 X 页 / 共 Y 页）」。任何场景里用户拿到一份 docx 想补目录、补页码、补正式排版（论文/学位论文/标书/合同/工作报告/项目报告/课程作业），尤其是说到「F9 更新目录」「自动目录」「让目录能跟着标题刷新」「页脚加上第几页共几页」，都应触发本 skill。注意：不用于从 0 创建新内容（那是 docx skill），也不用于 PDF 加目录或 PPT。
---

# docx-toolkit

把 Word 原生的 TOC 字段和中文页码页脚塞进任何已有的 docx 里，用户在 Word 里 Ctrl+A → F9 就能生成真实目录，页脚自动显示「第 X 页 / 共 Y 页」。

## 何时用

- 用户给出一个 .docx 文件，提到任何一个：「加目录」「自动目录」「TOC」「F9 更新目录」「让目录跟着标题走」。
- 用户说要「加页码」「页脚加页码」「第几页共几页」「中文页码」。
- 论文 / 学位论文 / 期刊投稿 / 标书 / 合同 / 工作报告 / 项目报告 / 课程作业 这类需要正式排版的 docx 后处理。
- 关键判断：**输入是已有的 docx，输出还是 docx**，只是加了排版字段。

## 何时不用

- 从 0 创建 docx 内容（写论文段落、生成模板）→ `anthropic-skills:docx`。
- PDF 加目录、加页码 → `anthropic-skills:pdf`。
- PPT / xlsx → 各自对应的 skill。
- 用户只想看 docx 内容、做 find-and-replace、改字体颜色 → 不是这个 skill 的事。

## 工具

`scripts/docx_toolkit.py` 是单文件 CLI，依赖 `python-docx`：

```bash
python3 scripts/docx_toolkit.py <input.docx> [-o output.docx] [--toc] [--pagenum]
```

- `--toc`：在文档最开头插入「目录」标题（Heading1）→ TOC 字段（带占位文字 `[请在 Word 中按 Ctrl+A 全选后按 F9 更新目录]`）→ 分页符。
- `--pagenum`：在所有 section 的页脚插入居中的「第 X 页 / 共 Y 页」（PAGE / NUMPAGES 字段 + 中文静态文本）。
- 至少要指定 `--toc` 或 `--pagenum` 之一。
- 不指定 `-o` 时输出 `<input>_processed.docx`。
- 跑完打印输出文件的绝对路径。

## 标准流程

1. **确认依赖**：先 `python3 -c "import docx"`，缺了就 `pip3 install --user python-docx`。
2. **找 skill 脚本绝对路径**：脚本在 `${CODEX_HOME:-$HOME/.codex}/skills/docx-toolkit/scripts/docx_toolkit.py`。直接用绝对路径调用，不要 cd 进 skill 目录。
3. **跑工具**：根据用户要的项（目录 / 页码 / 都要）传 flag。如果用户只说「加目录」，就只 `--toc`；只说「加页码」就只 `--pagenum`；说「正式排版一下」之类的笼统话，默认两个都加。
4. **告诉用户三件事**：
   - 输出文件的绝对路径（脚本 stdout 那行）
   - 要在 Word 里打开后按 **Ctrl+A → F9** 才会生成真正的目录条目（这是 Word 的字段机制，python-docx 不能在文件里直接渲染目录树）
   - 页脚是中文「第 X 页 / 共 Y 页」，居中

## 为什么是 Word 字段而不是写死的目录文本

如果直接把当前各级标题文本拼成一个静态目录段落，正文一旦增删改，目录就过时。Word 的 TOC 字段和 PAGE/NUMPAGES 字段是文档原生的「占位计算」，每次打开 / F9 都会重新扫描标题样式和分页结果，跟正文自动同步。这就是用户说「自动目录」「F9」时真正想要的东西。

## 常见追加需求

- **目录层级要超过 H3**：脚本里 TOC 指令是 `TOC \o "1-3" \h \z \u`，把 `1-3` 改成 `1-4` 就支持到 Heading4。如果用户明确要更深层级，直接改 `scripts/docx_toolkit.py` 里 `_insert_toc_field` 的 `it.text` 行。
- **页码格式想换**（比如「- 1 -」「Page 1 of 10」「1/N」）：改 `_add_page_number_footer` 里那几个 `_make_text_run("...")` 的字符串即可，PAGE / NUMPAGES 两个字段不要动。
- **想加奇偶页不同 / 首页不同**：当前实现只覆盖每个 section 默认页脚（不区分首页和奇偶页）。如果用户要这个，需要改脚本，改 `section.different_first_page_header_footer = True` 然后写 `section.first_page_footer` / `section.even_page_footer`。先告诉用户这是工具的局限再决定动不动手。

## 验证方法（用户怀疑没生效时）

```bash
unzip -p <output.docx> word/document.xml | grep -o 'TOC \\\\o[^<]*'   # 看 TOC 指令
unzip -p <output.docx> word/footer1.xml | grep -E 'PAGE|NUMPAGES|第|共'  # 看页脚
```

`document.xml` 里有 `TOC \o "1-3"` 就说明目录字段在；`footer1.xml` 里同时有 `PAGE`、`NUMPAGES`、「第」、「共」就说明中文页码字段在。
