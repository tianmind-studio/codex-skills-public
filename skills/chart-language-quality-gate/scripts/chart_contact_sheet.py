#!/usr/bin/env python3
"""Create a contact sheet for quick chart-language review."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image_dir")
    parser.add_argument("--out", default="chart_contact_sheet.png")
    parser.add_argument("--cols", type=int, default=2)
    args = parser.parse_args()

    root = Path(args.image_dir)
    images = [
        p
        for p in sorted(root.iterdir())
        if p.suffix.lower() in {".png", ".jpg", ".jpeg"} and "备份" not in p.name
    ]
    if not images:
        raise SystemExit("No chart images found.")

    thumb_w, thumb_h = 380, 270
    try:
        font = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 16)
    except Exception:
        font = None

    thumbs = []
    for path in images:
        im = Image.open(path).convert("RGB")
        im.thumbnail((360, 220))
        canvas = Image.new("RGB", (thumb_w, thumb_h), "white")
        canvas.paste(im, ((thumb_w - im.width) // 2, 10))
        draw = ImageDraw.Draw(canvas)
        draw.text((10, 235), path.name[:34], fill=(20, 20, 20), font=font)
        thumbs.append(canvas)

    cols = max(1, args.cols)
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb_w, rows * thumb_h), (245, 245, 245))
    for i, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((i % cols) * thumb_w, (i // cols) * thumb_h))

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    print(out)


if __name__ == "__main__":
    main()
