/**
 * Generates public/portfolio.pdf — a minimal branded placeholder deck.
 * Drop your real portfolio over public/portfolio.pdf when ready; this is just
 * so the site never 404s on the Portfolio button. Run: node scripts/generate-portfolio-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "public", "portfolio.pdf");

const objects = [];
let counter = 1;
const add = (body) => {
  const id = counter++;
  objects.push({ id, body });
  return id;
};

// Catalog, Pages, Page (595x842 = A4 portrait), Content stream, Font
add("<< /Type /Catalog /Pages 2 0 R >>");
add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
add(
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>"
);

const contentStream = [
  "q",
  // dark background
  "0.043 0.043 0.063 rg 0 0 595 842 re f",
  // pink accent bar (createwithflow #FD0178)
  "0.992 0.004 0.471 rg 60 620 120 10 re f",
  // blue accent bar (#0000FF)
  "0 0 1 rg 60 604 60 10 re f",
  "Q",
  "BT",
  "0 0 1 rg",
  "/F1 15 Tf",
  "60 766 Td",
  "(HKH AGENCY - PORTFOLIO) Tj",
  "1 1 1 rg",
  "/F1 40 Tf",
  "60 640 Td",
  "(Digital Marketing) Tj",
  "0 0.992 0.992 rg 60 596 Td",
  "0 0 1 rg",
  "/F1 40 Tf",
  "60 596 Td",
  "(& Development) Tj",
  "0.992 0.004 0.471 rg",
  "/F1 18 Tf",
  "60 530 Td",
  "(This placeholder will be replaced with the real) Tj",
  "0 0.992 0.992 rg",
  "60 506 Td",
  "(HKH portfolio deck - drop your PDF at public/portfolio.pdf) Tj",
  "0.6 0.6 0.7 rg",
  "/F1 12 Tf",
  "60 430 Td",
  "(hasanshahirconnect@gmail.com) Tj",
  "60 412 Td",
  "(+92 333 0405008) Tj",
  "60 394 Td",
  "(https://hasanshahir.github.io/Digivolve/) Tj",
  "ET",
].join("\n");

add(`stream\n${contentStream}\nendstream`);
add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

let pdf = "%PDF-1.4\n";
const offsets = [];
for (const obj of objects) {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
}

const xrefStart = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${counter}\n0000000000 65535 f \n`;
for (const off of offsets) {
  pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${counter} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, pdf, "latin1");
console.log(`Wrote ${outPath} (${Buffer.byteLength(pdf, "latin1")} bytes)`);
