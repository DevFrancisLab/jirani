import { jsPDF } from "jspdf";
import { dashboardService } from "@/services/dashboardService";
import type { ReportPacket } from "@/types";
import { formatDate, formatNumber, topConcern } from "@/utils/format";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = 286;

const FOREST: [number, number, number] = [18, 60, 42];
const AMBER: [number, number, number] = [232, 176, 74];
const MUTED: [number, number, number] = [111, 143, 122];
const INK: [number, number, number] = [23, 26, 24];
const PAPER: [number, number, number] = [247, 245, 239];
const LINE: [number, number, number] = [210, 214, 208];

export async function downloadReportPdf(reportId: string): Promise<string> {
  const packet = await dashboardService.getReportPacket(reportId);
  if (!packet) {
    throw new Error("This report is not available in the current dataset.");
  }
  const doc = buildReportPdf(packet);
  const filename = reportFilename(packet);
  doc.save(filename);
  return filename;
}

export function reportFilename(packet: ReportPacket): string {
  return `jirani-${slug(packet.report.area)}-${slug(packet.report.period)}.pdf`;
}

export function buildReportPdf(packet: ReportPacket): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ctx = { doc, packet, y: 0, page: 1 };

  drawChrome(ctx, false);
  drawCover(ctx);
  drawMetrics(ctx);
  drawCategories(ctx);
  drawPatterns(ctx);
  drawInsight(ctx);

  doc.addPage();
  ctx.page += 1;
  ctx.y = 0;
  drawChrome(ctx, false);
  drawDevelopments(ctx);
  drawSpatialSketch(ctx);
  drawSampleConcerns(ctx);
  drawClosing(ctx);

  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    ctx.page = page;
    drawChrome(ctx, true);
  }

  return doc;
}

interface PdfCtx {
  doc: jsPDF;
  packet: ReportPacket;
  y: number;
  page: number;
}

function drawCover(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  ctx.y = 36;
  setInk(doc);
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(packet.report.title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, ctx.y);
  ctx.y += titleLines.length * 9 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setMuted(doc);
  doc.text(
    `${packet.report.area}  ·  ${packet.report.period}  ·  Team Urbana`,
    MARGIN,
    ctx.y,
  );
  ctx.y += 8;

  setInk(doc);
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  const summary = doc.splitTextToSize(packet.report.summary, CONTENT_WIDTH);
  doc.text(summary, MARGIN, ctx.y);
  ctx.y += summary.length * 5.4 + 5;

  doc.setFillColor(...PAPER);
  doc.rect(MARGIN, ctx.y, CONTENT_WIDTH, 16, "F");
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, ctx.y, MARGIN, ctx.y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setInk(doc);
  const note = doc.splitTextToSize(
    "This document is aggregated community feedback for planning evidence. It is not an official planning determination, and it does not prove that a development caused an infrastructure problem.",
    CONTENT_WIDTH - 8,
  );
  doc.text(note, MARGIN + 4, ctx.y + 6);
  ctx.y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setMuted(doc);
  doc.text(
    "Developments  →  Participation  →  Concerns  →  AI clustering  →  Spatial patterns  →  Planning evidence",
    MARGIN,
    ctx.y,
  );
  ctx.y += 10;
}

function drawMetrics(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  sectionTitle(ctx, "Community participation");
  const items = [
    { label: "Active developments", value: packet.metrics.activeDevelopments },
    { label: "Community responses", value: packet.metrics.communityResponses },
    { label: "Recurring concerns", value: packet.metrics.recurringConcerns },
    { label: "Potential hotspots", value: packet.metrics.potentialHotspots },
  ];
  const gap = 4;
  const boxW = (CONTENT_WIDTH - gap * 3) / 4;
  items.forEach((item, index) => {
    const x = MARGIN + index * (boxW + gap);
    doc.setFillColor(...PAPER);
    doc.rect(x, ctx.y, boxW, 22, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setMuted(doc);
    doc.text(item.label.toUpperCase(), x + 3, ctx.y + 6.5);
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    if (index === 3) doc.setTextColor(...AMBER);
    else doc.setTextColor(...FOREST);
    doc.text(formatNumber(item.value), x + 3, ctx.y + 16.5);
  });
  ctx.y += 28;
}

function drawCategories(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  sectionTitle(ctx, "Concern categories");
  const max = Math.max(
    ...packet.concernBreakdown.map((item) => item.count),
    1,
  );
  packet.concernBreakdown.forEach((item, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setInk(doc);
    doc.text(item.category, MARGIN, ctx.y + 3.2);
    const barX = MARGIN + 38;
    const barW = CONTENT_WIDTH - 52;
    doc.setFillColor(...LINE);
    doc.rect(barX, ctx.y, barW, 4.2, "F");
    doc.setFillColor(...(index === 0 ? AMBER : FOREST));
    doc.rect(barX, ctx.y, (item.count / max) * barW, 4.2, "F");
    doc.setFont("helvetica", "bold");
    doc.text(formatNumber(item.count), PAGE_WIDTH - MARGIN, ctx.y + 3.2, {
      align: "right",
    });
    ctx.y += 8;
  });
  ctx.y += 4;
}

function drawPatterns(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  sectionTitle(ctx, "Emerging patterns");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setMuted(doc);
  doc.text(
    "Spatial clusters of related concerns. These are potential patterns, not confirmed infrastructure failures.",
    MARGIN,
    ctx.y,
  );
  ctx.y += 6;

  packet.hotspots.slice(0, 4).forEach((hotspot) => {
    needSpace(ctx, 18);
    doc.setDrawColor(...AMBER);
    doc.setLineWidth(0.9);
    doc.line(MARGIN, ctx.y, MARGIN, ctx.y + 14);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    setInk(doc);
    doc.text(hotspot.name, MARGIN + 4, ctx.y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `${hotspot.relatedConcernCount} related concerns  ·  ${hotspot.buildingCount} buildings  ·  ${hotspot.category}`,
      MARGIN + 4,
      ctx.y + 10,
    );
    ctx.y += 17;
  });
}

function drawInsight(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  needSpace(ctx, 28);
  sectionTitle(ctx, "Generated from aggregated community feedback");
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  setInk(doc);
  const lines = doc.splitTextToSize(packet.insights.aiInsight, CONTENT_WIDTH);
  doc.text(lines, MARGIN, ctx.y);
  ctx.y += lines.length * 5.5 + 4;
}

function drawDevelopments(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  sectionTitle(ctx, "Development participation");
  const rows = [...packet.developments].sort(
    (a, b) => b.responseCount - a.responseCount,
  );
  const cols = [48, 32, 24, 26, 22, 22];
  const headers = [
    "Development",
    "Location",
    "Type",
    "Stage",
    "Responses",
    "Top concern",
  ];

  doc.setFillColor(...FOREST);
  doc.rect(MARGIN, ctx.y, CONTENT_WIDTH, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(247, 245, 239);
  let x = MARGIN + 2;
  headers.forEach((header, index) => {
    const width = cols[index] ?? 22;
    doc.text(header.toUpperCase(), x, ctx.y + 4.7);
    x += width;
  });
  ctx.y += 7;

  rows.forEach((development, index) => {
    needSpace(ctx, 7);
    if (index % 2 === 0) {
      doc.setFillColor(247, 245, 239);
      doc.rect(MARGIN, ctx.y, CONTENT_WIDTH, 6.6, "F");
    }
    setInk(doc);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const values = [
      development.name,
      development.location,
      development.type,
      development.stage,
      formatNumber(development.responseCount),
      topConcern(development.concernBreakdown),
    ];
    x = MARGIN + 2;
    values.forEach((value, col) => {
      const width = cols[col] ?? 22;
      const text = doc.splitTextToSize(value, width - 2)[0] ?? value;
      if (col === 4) {
        doc.text(text, x + width - 6, ctx.y + 4.4, { align: "right" });
      } else {
        doc.text(text, x, ctx.y + 4.4);
      }
      x += width;
    });
    ctx.y += 6.6;
  });
  ctx.y += 6;
}

function drawSpatialSketch(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  needSpace(ctx, 78);
  sectionTitle(ctx, "Community map sketch");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setMuted(doc);
  doc.text(
    "Kilimani locations in this dataset. Marker size for hotspots reflects the number of related concerns, not severity.",
    MARGIN,
    ctx.y,
  );
  ctx.y += 5;

  const mapH = 52;
  const mapW = CONTENT_WIDTH;
  const mapX = MARGIN;
  const mapY = ctx.y;
  doc.setFillColor(...PAPER);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.rect(mapX, mapY, mapW, mapH, "FD");

  const points = [
    ...packet.developments.map((item) => ({
      ...item.coordinates,
      kind: "development" as const,
      size: 1.3,
    })),
    ...packet.hotspots.map((item) => ({
      ...item.coordinates,
      kind: "hotspot" as const,
      size: 1.6 + Math.min(item.relatedConcernCount / 12, 2.2),
    })),
  ];
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.0018;

  points.forEach((point) => {
    const px =
      mapX +
      6 +
      ((point.lng - (minLng - pad)) / (maxLng + pad - (minLng - pad))) *
        (mapW - 12);
    const py =
      mapY +
      6 +
      (1 - (point.lat - (minLat - pad)) / (maxLat + pad - (minLat - pad))) *
        (mapH - 12);
    if (point.kind === "development") {
      doc.setFillColor(...FOREST);
    } else {
      doc.setFillColor(...AMBER);
    }
    doc.circle(px, py, point.size, "F");
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setFillColor(...FOREST);
  doc.circle(mapX + 6, mapY + mapH + 5, 1.3, "F");
  setInk(doc);
  doc.text("Development", mapX + 10, mapY + mapH + 6.2);
  doc.setFillColor(...AMBER);
  doc.circle(mapX + 42, mapY + mapH + 5, 1.8, "F");
  doc.text("Potential hotspot", mapX + 47, mapY + mapH + 6.2);
  ctx.y += mapH + 12;
}

function drawSampleConcerns(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  needSpace(ctx, 40);
  sectionTitle(ctx, "Aggregated community concerns");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setMuted(doc);
  doc.text(
    "Anonymized excerpts. Private resident details are not included.",
    MARGIN,
    ctx.y,
  );
  ctx.y += 7;

  packet.sampleConcerns.forEach((concern) => {
    const development = packet.developments.find(
      (item) => item.id === concern.developmentId,
    );
    const quote = `“${concern.excerpt}”`;
    const lines = doc.splitTextToSize(quote, CONTENT_WIDTH - 4);
    needSpace(ctx, lines.length * 4.6 + 10);
    doc.setDrawColor(...FOREST);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, ctx.y - 1, MARGIN, ctx.y + lines.length * 4.6 + 4);
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    setInk(doc);
    doc.text(lines, MARGIN + 4, ctx.y + 3);
    ctx.y += lines.length * 4.6 + 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setMuted(doc);
    doc.text(
      `${concern.category}  ·  ${development?.name ?? "Kilimani"}  ·  ${formatDate(concern.createdAt)}  ·  ${concern.relatedConcernCount} related concerns`,
      MARGIN + 4,
      ctx.y,
    );
    ctx.y += 8;
  });
}

function drawClosing(ctx: PdfCtx) {
  const { doc, packet } = ctx;
  needSpace(ctx, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setMuted(doc);
  const closing = doc.splitTextToSize(
    `Prepared from the Jirani Kilimani dataset on ${formatDate(packet.report.generatedAt)}. Replace this mock extract with live participation data when the API is connected.`,
    CONTENT_WIDTH,
  );
  doc.text(closing, MARGIN, ctx.y);
}

function drawChrome(ctx: PdfCtx, footerOnly: boolean) {
  const { doc, packet } = ctx;
  if (!footerOnly) {
    doc.setFillColor(...FOREST);
    doc.rect(0, 0, PAGE_WIDTH, 22, "F");
    doc.setTextColor(247, 245, 239);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text("Jirani", MARGIN, 13.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Team Urbana", PAGE_WIDTH - MARGIN, 13.5, { align: "right" });
    ctx.y = 32;
  }

  doc.setFillColor(...FOREST);
  doc.rect(0, PAGE_HEIGHT - 9, PAGE_WIDTH, 9, "F");
  doc.setTextColor(247, 245, 239);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `Jirani  ·  ${packet.report.area}  ·  Planning evidence, not an official determination`,
    MARGIN,
    PAGE_HEIGHT - 3.6,
  );
  doc.text(`Page ${ctx.page}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 3.6, {
    align: "right",
  });
}

function sectionTitle(ctx: PdfCtx, title: string) {
  const { doc } = ctx;
  needSpace(ctx, 14);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  setInk(doc);
  doc.text(title, MARGIN, ctx.y);
  ctx.y += 3;
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, ctx.y, MARGIN + 18, ctx.y);
  ctx.y += 6;
}

function needSpace(ctx: PdfCtx, space: number) {
  if (ctx.y + space < FOOTER_Y - 4) return;
  ctx.doc.addPage();
  ctx.page += 1;
  drawChrome(ctx, false);
}

function setInk(doc: jsPDF) {
  doc.setTextColor(...INK);
}

function setMuted(doc: jsPDF) {
  doc.setTextColor(...MUTED);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
