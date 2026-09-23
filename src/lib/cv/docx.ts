import "server-only";
import { AlignmentType, BorderStyle, Document, Packer, Paragraph, TabStopType, TextRun } from "docx";
import type { CvData } from "./data";

const FONT = "Calibri";
const RIGHT_TAB = 9638; // lebar area tulis A4 (twip) untuk rata kanan tanggal

export async function renderCvDocx(data: CvData) {
  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: data.name, bold: true, size: 40, font: FONT })] }),
  ];
  if (data.title) children.push(new Paragraph({ children: [new TextRun({ text: data.title, size: 23, font: FONT })] }));
  if (data.contacts.length)
    children.push(new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: data.contacts.join("  |  "), size: 19, font: FONT })] }));

  for (const sec of data.sections) {
    children.push(
      new Paragraph({
        spacing: { before: 280, after: 100 },
        keepNext: true,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "111111", space: 2 } },
        children: [new TextRun({ text: sec.label.toUpperCase(), bold: true, size: 22, font: FONT })],
      }),
    );
    if (sec.text) children.push(new Paragraph({ children: [new TextRun({ text: sec.text, size: 20, font: FONT })] }));
    for (const l of sec.lines ?? []) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: l, size: 20, font: FONT })] }));
    for (const it of sec.items ?? []) {
      children.push(
        new Paragraph({
          keepNext: true,
          spacing: { before: 120 },
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          children: [
            new TextRun({ text: it.heading, bold: true, size: 21, font: FONT }),
            ...(it.meta ? [new TextRun({ text: `\t${it.meta}`, size: 19, font: FONT })] : []),
          ],
        }),
      );
      if (it.sub) children.push(new Paragraph({ keepNext: it.bullets.length > 0, children: [new TextRun({ text: it.sub, size: 19, font: FONT })] }));
      for (const b of it.bullets)
        children.push(new Paragraph({ bullet: { level: 0 }, spacing: { before: 20 }, children: [new TextRun({ text: b, size: 20, font: FONT })] }));
    }
  }

  const doc = new Document({
    creator: data.name,
    title: `CV - ${data.name}`,
    styles: { default: { document: { run: { font: FONT, size: 20 }, paragraph: { alignment: AlignmentType.LEFT } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1134, right: 1134 } } }, children }],
  });
  return Packer.toBuffer(doc);
}
