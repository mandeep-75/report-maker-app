export const PREVIEW_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Times New Roman', Georgia, serif;
  background: #e2e8f0;
  padding: 0;
  color: #0f172a;
}
.page {
  width: 100%;
  background: #fff;
  margin: 24px auto;
  padding: 6% 7%;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08);
  border: 1px solid rgba(15,23,42,0.05);
  border-radius: 4px;
  position: relative;
}
.page:last-child { margin-bottom: 24px; }
.page-single { aspect-ratio: 210 / 297; }
.section-block { margin-bottom: 36px; }

.cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 120px;
}
.cover .college { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.cover .dept { font-size: 15px; margin-top: 6px; color: #334155; }
.cover .rule { width: 120px; height: 2px; background: #2563eb; margin: 28px 0; }
.cover .report-on { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #64748b; }
.cover .event-title { font-size: 30px; font-weight: bold; margin-top: 12px; line-height: 1.2; }
.cover .acad { font-size: 13px; color: #64748b; text-align: center; margin-top: 8px; }
.cover .theme { font-size: 16px; font-style: italic; margin-top: 18px; color: #1d4ed8; }
.cover .event-details { text-align: center; font-size: 13px; line-height: 2; color: #334155; margin-top: 28px; }
.cover .event-details b { color: #0f172a; }
.cover .tagline { margin-top: 40px; font-style: italic; font-size: 14px; color: #475569; max-width: 560px; }

.section-title {
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 6px;
  margin-bottom: 16px;
  text-align: center;
}
.centered-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}
.prose p { font-size: 13px; line-height: 1.7; margin-bottom: 10px; text-align: justify; }
.prose h1 { font-size: 18px; font-weight: bold; margin: 14px 0 8px; }
.prose h2 { font-size: 15px; font-weight: bold; margin: 12px 0 6px; }
.prose ul, .prose ol { margin: 8px 0 8px 22px; font-size: 13px; line-height: 1.7; }
.prose strong { font-weight: bold; }
.prose em { font-style: italic; }

.outcomes-list { list-style: disc; padding-left: 24px; }
.outcomes-list li { font-size: 13px; line-height: 1.9; }

.field-row { margin: 8px 0; font-size: 13px; }
.field-row b { display: inline-block; min-width: 110px; }

.person-block { margin-bottom: 12px; font-size: 13px; line-height: 1.6; }
.person-block .name { font-weight: bold; font-size: 14px; }
.person-block .photo { float: right; width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin-left: 12px; }

.gallery-grid { display: grid; gap: 12px; margin-top: 8px; }
.gallery-grid.cols-1 { grid-template-columns: 1fr; }
.gallery-grid.cols-2 { grid-template-columns: 1fr 1fr; }
.gallery-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.gallery-grid img { width: 100%; border: 1px solid #e2e8f0; object-fit: cover; }
.gallery-grid .caption { font-size: 11px; color: #64748b; text-align: center; margin-top: 4px; }

.cert-grid { display: grid; gap: 16px; }
.cert-grid.cols-1 { grid-template-columns: 1fr; }
.cert-grid.cols-2 { grid-template-columns: 1fr 1fr; }
.cert-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.cert-grid.cols-4 { grid-template-columns: 1fr 1fr; }
.cert-grid img { width: 100%; border: 1px solid #e2e8f0; object-fit: contain; }
.cert-grid .caption { font-size: 11px; color: #64748b; text-align: center; }

.press-item { margin-bottom: 18px; }
.press-item img { width: 100%; border: 1px solid #e2e8f0; }
.press-item .pub { font-weight: bold; font-size: 13px; margin-top: 6px; }
.press-item .cap { font-size: 12px; color: #475569; }

.organized-by { text-align: center; font-weight: bold; font-size: 15px; line-height: 1.8; margin-top: 40px; }

.quote-block { border-left: 3px solid #2563eb; padding-left: 14px; font-style: italic; font-size: 14px; color: #334155; margin: 10px 0; }
`
