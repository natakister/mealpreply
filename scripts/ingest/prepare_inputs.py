"""Prepare per-page input files for the subagent-driven ingestion run.

For each text book: extract pypdf text per page → /tmp/ingest-full/<book-slug>/page-NN.txt
For book-of-bowls (image-only): render each page to PNG via pdftoppm → page-NN.png

Outputs are gitignored (under /tmp); only the script itself is checked in.

Usage:
    python scripts/ingest/prepare_inputs.py
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from pypdf import PdfReader

ROOT = Path("/home/nata/Work/projects/mealpreply")
MATERIALS = ROOT / "materials"
OUTPUT_ROOT = Path("/tmp/ingest-full")

TEXT_BOOKS = [
    "10-smoothies",
    "12-sauces",
    "sauces-and-rations",
    "granola-icecream-toppings",
]
VISION_BOOK = "book-of-bowls"


def prepare_text_book(slug: str) -> int:
    pdf_path = MATERIALS / f"{slug}.pdf"
    out_dir = OUTPUT_ROOT / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(pdf_path))
    written = 0
    for i, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if not text:
            continue
        out_file = out_dir / f"page-{i:02d}.txt"
        out_file.write_text(text, encoding="utf-8")
        written += 1
    print(f"[{slug}] {written}/{len(reader.pages)} pages with text → {out_dir}")
    return written


def prepare_vision_book(slug: str) -> int:
    pdf_path = MATERIALS / f"{slug}.pdf"
    out_dir = OUTPUT_ROOT / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)

    cmd = [
        "pdftoppm",
        "-png",
        "-r", "110",
        "-f", "1",
        "-l", str(total_pages),
        str(pdf_path),
        str(out_dir / "page"),
    ]
    subprocess.run(cmd, check=True)

    # pdftoppm with -l 253 names files page-001.png ... page-253.png — already what we want.
    rendered = sorted(out_dir.glob("page-*.png"))
    print(f"[{slug}] {len(rendered)} pages rendered → {out_dir}")
    return len(rendered)


def main() -> None:
    if not MATERIALS.exists():
        raise SystemExit(f"Materials dir not found: {MATERIALS}")
    if not shutil.which("pdftoppm"):
        raise SystemExit("pdftoppm not on PATH; install poppler-utils")

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    total_text = 0
    for slug in TEXT_BOOKS:
        total_text += prepare_text_book(slug)

    total_vision = prepare_vision_book(VISION_BOOK)

    print()
    print(f"Total text pages:   {total_text}")
    print(f"Total vision pages: {total_vision}")
    print(f"Output root:        {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
