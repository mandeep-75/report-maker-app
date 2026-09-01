/**
 * PDF renderer — maps shared blocks to @react-pdf/renderer primitives.
 *
 * Pagination is continuous: one flowing page for the body, with only the
 * cover and explicit page-breaks starting new pages. Keep-together rules
 * (heading + content, image + caption, grid rows) come from the shared model.
 */

import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import {
  DocBlock,
  DocParagraph,
  DocHeading,
  DocImage,
  DocImageGrid,
  DocTable,
  DocCover,
} from '../model'
import {
  CONTENT,
  LayoutContext,
  GRID_GAP_MM,
  HEADING_KEEP_PT,
  mmToPt,
  spacing,
} from '../layout'
import { COLOR, FONT_FAMILY, TYPE } from '../typography'

const contentWidthPt = mmToPt(CONTENT.widthMm)
const pt = mmToPt

export interface PdfContextData {
  compact: boolean
}

export function PdfDocumentView({ blocks, ctx }: { blocks: DocBlock[]; ctx: PdfContextData }) {
  // Split on explicit page breaks so the cover and any forced breaks produce
  // their own pages, while ALL normal content flows within one page.
  const chunks: DocBlock[][] = []
  let current: DocBlock[] = []
  for (const b of blocks) {
    if (b.kind === 'pageBreak') {
      if (current.length) chunks.push(current)
      current = []
    } else {
      current.push(b)
    }
  }
  if (current.length) chunks.push(current)

  return (
    <Document
      title="Event Report"
      author="Report Maker"
      subject="Institutional Event Report"
      producer="Report Maker"
    >
      {chunks.map((chunk, i) => (
        <Page key={i} size="A4" style={styles.page} wrap>
          <View fixed style={styles.footer}>
            <Text style={styles.footerText} render={({ pageNumber }) => pageNumber} />
          </View>
          {chunk.map((block) => renderBlock(block, ctx, block.id))}
        </Page>
      ))}
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    paddingTop: mmToPt(19),
    paddingBottom: mmToPt(19),
    paddingLeft: mmToPt(20),
    paddingRight: mmToPt(20),
    fontFamily: FONT_FAMILY.pdf,
    color: COLOR.text,
    fontSize: TYPE.body,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: COLOR.muted,
  },
})

function renderBlock(block: DocBlock, ctx: PdfContextData, key: string): React.ReactNode {
  switch (block.kind) {
    case 'cover':
      return <CoverView key={key} cover={block} />
    case 'heading':
      return <HeadingView key={key} heading={block} ctx={ctx} />
    case 'paragraph':
      return <ParagraphView key={key} p={block} ctx={ctx} />
    case 'list':
      return <ListView key={key} list={block} ctx={ctx} />
    case 'image':
      return <ImageView key={key} image={block} ctx={ctx} />
    case 'grid':
      return <GridView key={key} grid={block} ctx={ctx} />
    case 'quote':
      return <QuoteView key={key} block={block} />
    case 'table':
      return <TableView key={key} table={block} ctx={ctx} />
    default:
      return null
  }
}

/* ------------------------------- cover -------------------------------- */

const coverBase = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: 700 },
})

function coverLineStyle(style: DocCover['lines'][number]['style']): Style {
  switch (style) {
    case 'college':
      return {
        fontSize: TYPE.coverCollege,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        textAlign: 'center',
        color: COLOR.heading,
      }
    case 'dept':
      return { fontSize: TYPE.coverDept, textAlign: 'center', color: COLOR.muted, marginTop: 6 }
    case 'rule':
      return { height: 2, width: 120, marginVertical: 24, backgroundColor: COLOR.accent }
    case 'reportOn':
      return {
        fontSize: TYPE.coverReportOn,
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
        color: COLOR.muted,
      }
    case 'eventTitle':
      return {
        fontSize: TYPE.coverEventTitle,
        fontWeight: 700,
        textAlign: 'center',
        marginTop: 10,
        color: COLOR.heading,
      }
    case 'acad':
      return { fontSize: TYPE.coverAcad, textAlign: 'center', color: COLOR.muted, marginTop: 6 }
    case 'theme':
      return {
        fontSize: TYPE.coverTheme,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 14,
        color: COLOR.accent,
      }
    case 'detail':
      return { fontSize: TYPE.coverDetail, textAlign: 'center', color: COLOR.text, marginTop: 3 }
    case 'tagline':
      return {
        fontSize: TYPE.coverTagline,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 32,
        color: COLOR.muted,
      }
    default:
      return {}
  }
}

function CoverView({ cover }: { cover: DocCover }) {
  return (
    <View style={coverBase.wrap} wrap={false}>
      {cover.lines.map((line, i) => (
        <Text key={i} style={coverLineStyle(line.style)}>
          {line.label ? (
            <>
              <Text style={coverBase.label}>{line.label}: </Text>
              {line.text}
            </>
          ) : (
            line.text
          )}
        </Text>
      ))}
    </View>
  )
}

/* ------------------------------ headings ------------------------------ */

function HeadingView({ heading, ctx }: { heading: DocHeading; ctx: PdfContextData }) {
  const sp = spacing(ctx as LayoutContext)
  const isLevel1 = heading.level === 1
  const before = heading.precededByMedia ? sp.headingAfterImage : sp.headingBefore
  return (
    <View
      style={{
        marginTop: before,
        marginBottom: sp.headingAfter,
        borderBottomWidth: isLevel1 && heading.rule ? 1 : 0,
        borderBottomColor: COLOR.heading,
        paddingBottom: isLevel1 && heading.rule ? 4 : 0,
        alignItems: isLevel1 ? 'center' : 'flex-start',
      }}
      minPresenceAhead={HEADING_KEEP_PT}
    >
      <Text
        style={{
          fontSize: isLevel1 ? TYPE.heading1 : TYPE.heading2,
          fontWeight: 700,
          color: COLOR.heading,
          textTransform: isLevel1 ? 'uppercase' : 'none',
          letterSpacing: isLevel1 ? 0.8 : 0,
          textAlign: isLevel1 ? 'center' : 'left',
        }}
      >
        {isLevel1 ? heading.text.toUpperCase() : heading.text}
      </Text>
    </View>
  )
}

/* ----------------------------- paragraphs ----------------------------- */

function paragraphAlign(p: DocParagraph): Style['textAlign'] {
  if (p.align) return p.align
  if (p.role === 'caption') return 'center'
  if (p.role === 'centered' || p.role === 'centeredBold' || p.role === 'theme') return 'center'
  return 'justify'
}

function ParagraphView({ p, ctx }: { p: DocParagraph; ctx: PdfContextData }) {
  const sp = spacing(ctx as LayoutContext)
  const isTheme = p.role === 'theme'
  const isCaption = p.role === 'caption'
  return (
    <Text
      style={{
        marginTop: p.spacingBefore,
        marginBottom: p.spacingAfter ?? sp.bodyAfter,
        fontSize: isTheme ? TYPE.theme : isCaption ? TYPE.caption : TYPE.body,
        color: isTheme ? COLOR.accent : isCaption ? COLOR.caption : COLOR.text,
        fontStyle: isTheme ? 'italic' : 'normal',
        fontWeight: p.role === 'centeredBold' ? 700 : 400,
        lineHeight: sp.bodyLineHeight,
        textAlign: paragraphAlign(p),
      }}
      orphans={2}
      widows={2}
      wrap
    >
      {p.label ? (
        <>
          <Text style={{ fontWeight: 700 }}>{p.label}: </Text>
          {p.runs.map((r, i) => (
            <RunNode key={i} {...r} />
          ))}
        </>
      ) : (
        p.runs.map((r, i) => <RunNode key={i} {...r} />)
      )}
    </Text>
  )
}

function RunNode(r: DocParagraph['runs'][number]) {
  return (
    <React.Fragment>
      <Text style={runStyle(r)}>{r.text}</Text>
    </React.Fragment>
  )
}

function runStyle(r: DocParagraph['runs'][number]): Style {
  return {
    fontWeight: r.bold ? 700 : 400,
    fontStyle: r.italic ? 'italic' : 'normal',
    textDecoration: r.underline ? 'underline' : 'none',
  }
}

/* -------------------------------- lists ------------------------------- */

function ListView({ list, ctx }: { list: Extract<DocBlock, { kind: 'list' }>; ctx: PdfContextData }) {
  const sp = spacing(ctx as LayoutContext)
  return (
    <View wrap style={{ marginTop: sp.listGapBefore, marginBottom: sp.bodyAfter }}>
      {list.items.map((item, idx) => {
        const marker = list.ordered ? `${idx + 1}.` : '•'
        return (
          <View key={item.id} style={{ flexDirection: 'row', marginBottom: sp.listItemAfter }}>
            <Text style={{ width: list.ordered ? 20 : 14, fontWeight: 700 }}>{marker}</Text>
            <Text style={{ flex: 1, lineHeight: sp.bodyLineHeight }} orphans={2} widows={2}>
              {item.runs.map((r, i) => (
                <Text key={i} style={runStyle(r)}>
                  {r.text}
                </Text>
              ))}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

/* -------------------------------- quotes ------------------------------- */

function QuoteView({ block }: { block: Extract<DocBlock, { kind: 'quote' }> }) {
  return (
    <View
      style={{
        borderLeftWidth: 3,
        borderLeftColor: COLOR.accent,
        paddingLeft: 10,
        marginTop: 4,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: TYPE.quote, fontStyle: 'italic', color: COLOR.text, lineHeight: 1.25 }}>
        {block.runs.map((r, i) => (
          <Text key={i} style={runStyle(r)}>
            {r.text}
          </Text>
        ))}
      </Text>
    </View>
  )
}

/* -------------------------------- images ------------------------------- */

function ImageView({ image, ctx }: { image: DocImage; ctx: PdfContextData }) {
  const sp = spacing(ctx as LayoutContext)
  const w = image.widthMm != null ? pt(image.widthMm) : contentWidthPt
  const h = image.heightMm != null ? pt(image.heightMm) : undefined
  return (
    <View
      wrap={false}
      style={{
        marginTop: sp.imageBefore,
        marginBottom: sp.imageAfter,
        alignItems: image.align === 'left' ? 'flex-start' : 'center',
      }}
    >
      <Image
        src={image.src}
        style={[
          { width: w, maxWidth: contentWidthPt },
          h ? { height: h } : undefined,
          image.border ? { borderWidth: 0.5, borderColor: COLOR.border } : undefined,
        ]}
      />
      {image.caption ? (
        <Text
          style={{
            fontSize: TYPE.caption,
            color: COLOR.caption,
            marginTop: sp.captionGap,
            textAlign: 'center',
          }}
        >
          {image.caption}
        </Text>
      ) : null}
    </View>
  )
}

/* -------------------------------- grids ------------------------------- */

function GridView({ grid, ctx }: { grid: DocImageGrid; ctx: PdfContextData }) {
  const sp = spacing(ctx as LayoutContext)
  const gap = pt(GRID_GAP_MM)
  return (
    <View style={{ marginTop: sp.imageBefore, marginBottom: sp.imageAfter }} wrap>
      {grid.rows.map((row, ri) => {
        const cells = row.cells
        if (cells.length === 0) return null
        const featured = cells.length >= 2 && cells[0].slotWidthMm > cells[1].slotWidthMm * 1.5
        if (featured) {
          const big = cells[0]
          const smalls = cells.slice(1)
          const smallColWidth = smalls[0]?.slotWidthMm ?? big.slotWidthMm / 2
          return (
            <View key={ri} style={{ flexDirection: 'row', marginBottom: gap, gap }} wrap={false}>
              <View style={{ width: pt(big.slotWidthMm), alignItems: 'center' }} wrap={false}>
                <GridImage cell={big} sp={sp} />
              </View>
              <View style={{ width: pt(smallColWidth), gap }} wrap={false}>
                {smalls.map((cell) => (
                  <GridViewItem key={cell.id} cell={cell} sp={sp} />
                ))}
              </View>
            </View>
          )
        }
        return (
          <View key={ri} style={{ flexDirection: 'row', marginBottom: gap, gap }} wrap={false}>
            {cells.map((cell) => (
              <GridViewItem key={cell.id} cell={cell} sp={sp} />
            ))}
          </View>
        )
      })}
    </View>
  )
}

function GridImage({ cell, sp }: { cell: DocImageGrid['rows'][number]['cells'][number]; sp: ReturnType<typeof spacing> }) {
  return (
    <ImageViewish
      src={cell.src}
      w={cell.widthMm}
      h={cell.heightMm}
      caption={cell.caption}
      captionGap={sp.captionGap}
    />
  )
}

function GridViewItem({ cell, sp }: { cell: DocImageGrid['rows'][number]['cells'][number]; sp: ReturnType<typeof spacing> }) {
  return (
    <View wrap={false} style={{ flex: 1, alignItems: 'center' }}>
      <ImageViewish
        src={cell.src}
        w={cell.widthMm}
        h={cell.heightMm}
        caption={cell.caption}
        captionGap={sp.captionGap}
      />
    </View>
  )
}

function ImageViewish({
  src,
  w,
  h,
  caption,
  captionGap,
}: {
  src: string
  w: number
  h: number
  caption?: string
  captionGap: number
}) {
  return (
    <View wrap={false} style={{ alignItems: 'center' }}>
      <Image
        src={src}
        style={{
          width: pt(w),
          height: pt(h),
          maxWidth: contentWidthPt,
          borderWidth: 0.5,
          borderColor: COLOR.border,
        }}
      />
      {caption ? (
        <Text style={{ fontSize: TYPE.caption, color: COLOR.caption, marginTop: captionGap, textAlign: 'center' }}>
          {caption}
        </Text>
      ) : null}
    </View>
  )
}

/* -------------------------------- tables ------------------------------- */

function TableView({ table, ctx }: { table: DocTable; ctx: PdfContextData }) {
  const sp = spacing(ctx as LayoutContext)
  const cellStyle: Style = {
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderWidth: 0.5,
    borderColor: COLOR.border,
    fontSize: TYPE.table,
  }
  const headers = table.headers ?? []
  const colCount = headers.length || (table.rows[0]?.length ?? 0) || 1
  const colWidth = contentWidthPt / colCount

  return (
    <View style={{ marginTop: 8, marginBottom: sp.tableGapAfter }} wrap>
      {headers.length ? (
        <View style={{ flexDirection: 'row' }} wrap={false}>
          {headers.map((h, i) => (
            <Text
              key={i}
              style={{ ...cellStyle, width: colWidth - 1, fontWeight: 700, backgroundColor: COLOR.tableHeaderBg }}
            >
              {h}
            </Text>
          ))}
        </View>
      ) : null}
      {table.rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }} wrap={false}>
          {row.map((cell, ci) => (
            <Text key={ci} style={{ ...cellStyle, width: colWidth - 1 }}>
              {cell.map((r, k) => (
                <Text key={k} style={runStyle(r)}>
                  {r.text}
                </Text>
              ))}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}