# AGENTS.md

## Working agreements

- Do NOT verify or QA images programmatically — no pixel analysis, PNG decoding,
  image dimension checks, thumbnail rendering, or other automated image
  inspection. Visual output must be judged by the user only.
- Never claim a PDF/DOCX page layout is correct without the user seeing it.
  Verify exports structurally (XML strings, issue arrays, file writers) and hand
  visual confirmation to the user.

## Commands

- Typecheck: `npx tsc -b`
- Lint: `npm run lint` (oxlint).
- Build: `npm run build` (= `tsc -b && vite build`)
- Dev server: `npm run dev`; preview build: `npm run preview`
- No unit test suite. Export work is verified with the node harness below.

## Export architecture

- `src/export/builder.ts` is the single source of truth: it converts a `Report`
  into a shared `DocBlock[]` model (`src/export/model.ts`). Two renderers
  consume it — `src/export/pdf/renderer.tsx` (react-pdf) and
  `src/export/docx/renderer.ts` (docx lib) — and `src/export/index.ts`
  (`exportReport`) lazy-loads them via dynamic `import()`.
- Shared layout/spacing values live in `src/export/layout.ts` (`spacing(ctx)`,
  `CONTENT` constants, `compact`). Changes there affect BOTH formats; DOCX-only
  tweaks belong in `src/export/docx/renderer.ts`, PDF-only in `pdf/renderer.tsx`.
- The user treats the PDF output as final/frozen. When touching the shared
  pipeline, keep PDF output unchanged (byte-identical `sample.pdf`) unless the
  user explicitly asks for a PDF change.
- Section layout knobs live in `src/data/templates.ts` (e.g. brochure
  `type: 'split' | 'auto' | 'overlap'`, `CERTIFICATE_LAYOUT_OPTIONS`).

## Verifying export changes (harness)

Bundle and run the node harness (esbuild ships via vite; outputs are gitignored):

```
npx esbuild test/main.mjs --bundle --platform=node --format=esm \
  --outfile=test/cjs/main.bundle.mjs --jsx=automatic --packages=external
node test/cjs/main.bundle.mjs
```

Writes `test/out/sample.pdf` + `test/out/sample.docx` and prints
`PDF issues: []` / `DOCX issues: []`. For structural DOCX checks, unzip
`test/out/sample.docx` and inspect `word/document.xml`.

## DOCX renderer quirks (`src/export/docx/renderer.ts`)

- The docx lib `spacing.before/after/line` and `indent` are raw **twips**
  (`pt * 20`); `w:sz` is half-points (`half(pt) = pt * 2`); image
  `transformation` is pixels.
- Tables need explicit `columnWidths` or the lib emits a 100-twip `gridCol` and
  the table collapses (broke the cover page).
- Emit page breaks as empty paragraphs with `pageBreakBefore: true` (tiny exact
  line spacing) — NOT paragraphs containing a `PageBreak()` run, which spills a
  blank page after a full-height element like the cover table.
- Apple Pages ignores `w:jc center` on image-only paragraphs and drops narrow
  images to the left margin. Center them with equal `w:ind left/right` set to
  `(columnWidth − imageWidth) / 2`; Word centers via `jc` inside the same
  indented box, so both programs agree.

## Routing & git

- Vite SPA with client-side routing; `vercel.json` rewrites all routes to `/`.
- Work happens directly on `master`; commit style is short single-line
  imperative messages, pushed to `origin/master`.