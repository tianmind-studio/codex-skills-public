#!/usr/bin/env python3
"""Render Office/PDF artifacts to PNG pages for visual QA."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


OFFICE_EXTS = {".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".odt", ".odp", ".ods"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render DOCX/PPTX/XLSX/PDF artifacts to PNG pages.")
    parser.add_argument("input", help="Input .docx, .pptx, .xlsx, or .pdf file")
    parser.add_argument("--out", "--output-dir", dest="out", default=None, help="Output directory")
    parser.add_argument("--dpi", type=int, default=150, help="PNG render DPI for pdftoppm")
    parser.add_argument("--keep-pdf", action="store_true", help="Keep intermediate PDF for Office inputs")
    return parser.parse_args()


def require_tool(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"Missing required tool: {name}")
    return path


def run(cmd: list[str], env: dict[str, str] | None = None) -> None:
    proc = subprocess.run(cmd, text=True, capture_output=True, env=env)
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout)
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"Command failed: {' '.join(cmd)}")


def convert_office_to_pdf(input_path: Path, out_dir: Path) -> Path:
    soffice = require_tool("soffice")
    profile_dir = Path(tempfile.mkdtemp(prefix="doc-quality-lo-"))
    env = os.environ.copy()
    env.setdefault("HOME", str(profile_dir))
    cmd = [
        soffice,
        f"-env:UserInstallation=file://{profile_dir}",
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        str(out_dir),
        str(input_path),
    ]
    run(cmd, env=env)
    pdf = out_dir / f"{input_path.stem}.pdf"
    if not pdf.exists():
        candidates = sorted(out_dir.glob("*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not candidates:
            raise RuntimeError("LibreOffice did not produce a PDF")
        pdf = candidates[0]
    return pdf


def render_pdf_to_png(pdf_path: Path, out_dir: Path, dpi: int) -> list[Path]:
    pdftoppm = require_tool("pdftoppm")
    prefix = out_dir / f"{pdf_path.stem}-page"
    run([pdftoppm, "-png", "-r", str(dpi), str(pdf_path), str(prefix)])
    pages = sorted(out_dir.glob(f"{pdf_path.stem}-page-*.png"))
    if not pages:
        raise RuntimeError("pdftoppm did not produce PNG pages")
    return pages


def main() -> int:
    args = parse_args()
    input_path = Path(args.input).expanduser().resolve()
    if not input_path.exists():
        sys.stderr.write(f"Input file not found: {input_path}\n")
        return 2

    out_dir = Path(args.out).expanduser().resolve() if args.out else input_path.with_suffix("").parent / f"{input_path.stem}_rendered"
    out_dir.mkdir(parents=True, exist_ok=True)

    ext = input_path.suffix.lower()
    try:
        if ext == ".pdf":
            pdf_path = input_path
        elif ext in OFFICE_EXTS:
            pdf_path = convert_office_to_pdf(input_path, out_dir)
        else:
            raise RuntimeError(f"Unsupported extension: {ext}")

        pages = render_pdf_to_png(pdf_path, out_dir, args.dpi)
        if ext != ".pdf" and not args.keep_pdf and pdf_path.exists():
            pdf_path.unlink()

        manifest = {
            "input": str(input_path),
            "output_dir": str(out_dir),
            "dpi": args.dpi,
            "pages": [str(page) for page in pages],
        }
        manifest_path = out_dir / "render_manifest.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(manifest, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:
        sys.stderr.write(f"render_artifact.py: {exc}\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
