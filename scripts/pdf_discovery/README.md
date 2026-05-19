# PDF Discovery — MealPreply

Structural analysis of all recipe book PDFs before schema design.

## What it does

For each PDF in `Original Materials/`:
- Reads page count and extracts text (up to 250 pages).
- Detects **candidate category headers** using a heuristic: all-uppercase lines, 2–10 words, under 60 characters. These are typical cookbook section headers like `GRAIN BASES` or `CHICKEN BOWLS`.
- Samples 5 random pages with more than 400 characters of text (seeded per book for reproducibility).
- Writes per-book output to `samples/<book-slug>/`.

Produces an aggregate `samples/discovery_report.json` summarising all books.

## How to run

```bash
cd /home/nata/Work/projects/mealpreply
source scripts/.venv/bin/activate
python scripts/pdf_discovery/analyze_pdf.py
```

## Outputs (gitignored)

```
scripts/pdf_discovery/samples/
  discovery_report.json                 # aggregate
  <book-slug>/
    discovery.json                      # per-book stats + categories
    recipe_sample_<n>_page_<p>.txt      # 5 sampled rich-text pages
```

`samples/` is excluded from git because sample files contain copyrighted book content.

## Candidate category heuristic

A line qualifies when:
1. `line.strip().isupper()` — entirely uppercase
2. `2 ≤ word count ≤ 10` — not a lone word, not a sentence
3. `len < 60` — short enough to be a header, not body copy

An `image_heavy_warning` flag is set when fewer than 30% of scanned pages yield >50 characters — useful signal that pypdf can't extract text and Task 5 ingestion may need OCR or vision input.
