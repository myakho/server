import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import type { ApplicationData } from "./email";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateApplicationPdf(data: ApplicationData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 60,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── 배경색 ──
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#fff8f5");

    // ── 장식 도형 (멤피스 스타일) ──
    // 왼쪽 상단 원
    doc.circle(40, 40, 28).fillAndStroke("#b5ead7", "#222");
    // 오른쪽 상단 삼각형
    doc
      .moveTo(doc.page.width - 30, 10)
      .lineTo(doc.page.width - 10, 50)
      .lineTo(doc.page.width - 50, 50)
      .closePath()
      .fillAndStroke("#c9b1ff", "#222");
    // 오른쪽 하단 원
    doc
      .circle(doc.page.width - 40, doc.page.height - 40, 22)
      .fillAndStroke("#ffd6a5", "#222");
    // 왼쪽 하단 사각형
    doc.rect(20, doc.page.height - 60, 36, 36).fillAndStroke("#fdffb6", "#222");
    // 중간 오른쪽 작은 원
    doc.circle(doc.page.width - 20, 200, 10).fillAndStroke("#ffb3c1", "#222");
    // 중간 왼쪽 다이아몬드
    const dx = 30, dy = 300;
    doc
      .moveTo(dx, dy - 12)
      .lineTo(dx + 12, dy)
      .lineTo(dx, dy + 12)
      .lineTo(dx - 12, dy)
      .closePath()
      .fillAndStroke("#a0c4ff", "#222");

    // ── 헤더 바 ──
    doc.rect(0, 0, doc.page.width, 90).fill("#222222");

    // ── 헤더 텍스트 ──
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("PSYCHOLOGY TEST APPLICATION", 60, 28, { align: "left" });
    doc
      .fillColor("#aaaaaa")
      .font("Helvetica")
      .fontSize(11)
      .text("심리검사 신청서", 60, 56, { align: "left" });

    // ── 신청일시 ──
    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    doc
      .fillColor("#888888")
      .font("Helvetica")
      .fontSize(9)
      .text(`신청일시: ${now}`, 60, 110, { align: "right" });

    // ── 구분선 ──
    doc
      .moveTo(60, 125)
      .lineTo(doc.page.width - 60, 125)
      .lineWidth(2)
      .stroke("#222222");

    // ── 필드 렌더 함수 ──
    const genderLabel =
      data.gender === "male" ? "남성" : data.gender === "female" ? "여성" : data.gender;

    const fields: { label: string; value: string }[] = [
      { label: "신청 계기", value: data.motive },
      { label: "성명", value: data.name },
      { label: "나이", value: `${data.age}세` },
      { label: "성별", value: genderLabel },
      { label: "신청 사유", value: data.reason },
    ];

    let y = 145;
    const labelX = 60;
    const valueX = 200;
    const rowWidth = doc.page.width - 60 - valueX;

    fields.forEach((field, idx) => {
      const isEven = idx % 2 === 0;
      // 배경 줄
      const textHeight = doc.heightOfString(field.value, {
        width: rowWidth,
        lineGap: 4,
      });
      const rowHeight = Math.max(textHeight + 24, 44);

      if (isEven) {
        doc.rect(60, y - 6, doc.page.width - 120, rowHeight).fill("#fef3ee");
      }

      // 라벨
      doc
        .fillColor("#222222")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(field.label, labelX, y, { width: 120 });

      // 값
      doc
        .fillColor("#444444")
        .font("Helvetica")
        .fontSize(11)
        .text(field.value, valueX, y, { width: rowWidth, lineGap: 4 });

      // 구분선
      doc
        .moveTo(60, y + rowHeight - 4)
        .lineTo(doc.page.width - 60, y + rowHeight - 4)
        .lineWidth(0.5)
        .stroke("#dddddd");

      y += rowHeight + 8;
    });

    // ── 하단 안내 ──
    doc
      .moveTo(60, doc.page.height - 80)
      .lineTo(doc.page.width - 60, doc.page.height - 80)
      .lineWidth(1.5)
      .stroke("#222222");

    doc
      .fillColor("#555555")
      .font("Helvetica")
      .fontSize(9)
      .text(
        "본 신청서는 심리검사 신청을 위한 공식 문서입니다. 개인정보는 상담 목적으로만 활용됩니다.",
        60,
        doc.page.height - 65,
        { align: "center" }
      );

    doc.end();
  });
}
