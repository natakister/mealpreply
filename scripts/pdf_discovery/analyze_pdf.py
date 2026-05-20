#!/usr/bin/env python3
"""
Multi-PDF structural discovery for MealPreply recipe books.

Scans all PDFs in materials/, extracts candidate category headers,
samples rich-text pages, and writes per-book + aggregate JSON reports.
"""

from __future__ import annotations

import json
import random
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PDF_DIR = Path(__file__).resolve().parents[2] / "materials"
SAMPLES_DIR = Path(__file__).resolve().parent / "samples"
MAX_PAGES = 250          # safety cap per book
SAMPLE_COUNT = 5         # rich-text pages to sample per book
MIN_CHARS = 400          # minimum chars to qualify as "rich text"
MAX_CATEGORIES = 50      # unique candidate category headers per book

TITLE_BY_SLUG: dict[str, str] = {
    "book-of-bowls.pdf": "Книга боулов",
    "12-sauces.pdf": "12 соусов",
    "sauces-and-rations.pdf": "Соусы и рационы",
    "granola-icecream-toppings.pdf": "Гранола, мороленое, топинги",
    "10-smoothies.pdf": "10 смузи",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(filename: str) -> str:
    """Return the PDF stem as a safe directory name."""
    return Path(filename).stem


def is_candidate_category(line: str) -> bool:
    """
    Heuristic: uppercase-only lines of 2–10 words, under 60 chars.
    Typical for cookbook section headers ('CHICKEN BOWLS', 'GRAIN BASES', etc.)
    """
    stripped = line.strip()
    return (
        stripped.isupper()
        and 2 <= len(stripped.split()) <= 10
        and len(stripped) < 60
    )


def extract_book(pdf_path: Path, book_index: int) -> dict:
    """Parse one PDF and return its discovery dict; write sample files."""

    slug = slugify(pdf_path.name)
    original_title = TITLE_BY_SLUG.get(pdf_path.name)
    if original_title is None:
        print(f"  [WARN] {pdf_path.name} not in TITLE_BY_SLUG — using stem as title")
        original_title = slug

    book_dir = SAMPLES_DIR / slug
    book_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)
    pages_to_scan = min(total_pages, MAX_PAGES)

    page_texts: list[tuple[int, str]] = []   # (1-based page number, text)
    candidate_categories: list[str] = []
    seen_categories: set[str] = set()

    for i in range(pages_to_scan):
        raw = reader.pages[i].extract_text()
        text = raw if raw else ""
        page_texts.append((i + 1, text))

        if len(candidate_categories) < MAX_CATEGORIES:
            for line in text.splitlines():
                header = line.strip()
                if is_candidate_category(header) and header not in seen_categories:
                    seen_categories.add(header)
                    candidate_categories.append(header)
                    if len(candidate_categories) >= MAX_CATEGORIES:
                        break

    # Select rich-text pages for sampling
    rich_pages = [(pno, txt) for pno, txt in page_texts if len(txt) > MIN_CHARS]
    rng = random.Random(42 + book_index)
    sampled = rng.sample(rich_pages, min(SAMPLE_COUNT, len(rich_pages)))
    sampled.sort(key=lambda x: x[0])   # ascending page order

    sample_page_numbers: list[int] = []
    for n, (pno, txt) in enumerate(sampled, start=1):
        out_file = book_dir / f"recipe_sample_{n}_page_{pno}.txt"
        out_file.write_text(txt, encoding="utf-8")
        sample_page_numbers.append(pno)

    # Image-heavy warning
    nonempty = sum(1 for _, t in page_texts if len(t) > 50)
    image_heavy = nonempty < pages_to_scan * 0.3

    discovery = {
        "pdf_path": str(pdf_path),
        "book_slug": slug,
        "original_title_ru": original_title,
        "page_count": total_pages,
        "pages_scanned": pages_to_scan,
        "rich_text_pages": len(rich_pages),
        "image_heavy_warning": image_heavy,
        "candidate_categories": candidate_categories,
        "sample_recipe_pages": sample_page_numbers,
    }

    (book_dir / "discovery.json").write_text(
        json.dumps(discovery, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return discovery


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"ERROR: no PDFs found in {PDF_DIR}")
        return

    print(f"Found {len(pdfs)} PDFs in {PDF_DIR}\n")

    books: list[dict] = []
    for idx, pdf_path in enumerate(pdfs):
        print(f"[{idx + 1}/{len(pdfs)}] {pdf_path.name}")
        disc = extract_book(pdf_path, idx)
        books.append(disc)
        warn = " [IMAGE-HEAVY!]" if disc["image_heavy_warning"] else ""
        print(
            f"    pages={disc['page_count']}  rich_text={disc['rich_text_pages']}  "
            f"categories={len(disc['candidate_categories'])}  "
            f"samples={len(disc['sample_recipe_pages'])}{warn}"
        )

    aggregate = {
        "books": books,
        "total_pages": sum(b["page_count"] for b in books),
        "total_sample_recipes": sum(len(b["sample_recipe_pages"]) for b in books),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    report_path = SAMPLES_DIR / "discovery_report.json"
    report_path.write_text(
        json.dumps(aggregate, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\nSummary: {len(books)} books | {aggregate['total_pages']} total pages | "
          f"{aggregate['total_sample_recipes']} samples")
    print(f"Aggregate report: {report_path}")


if __name__ == "__main__":
    main()
