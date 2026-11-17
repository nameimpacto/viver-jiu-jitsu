// Exportação do relatório: Word (.docx) de verdade e PDF. Roda só no navegador.

export interface Foto {
  id: string;
  dataUrl: string;
  largura: number;
  altura: number;
  legenda: string;
}

export interface Secao {
  titulo: string;
  texto: string;
  /** Fotos entram logo depois deste título. */
  fotos?: boolean;
}

export interface Documento {
  titulo: string;
  identificacao: [string, string][];
  secoes: Secao[];
  fotos: Foto[];
}

const LADO_MAX_PX = 1400;

/** Reduz a foto antes de embutir, respeitando a orientação (foto em pé sai em pé). */
export async function reduzirFoto(arquivo: File): Promise<Omit<Foto, "id" | "legenda">> {
  let fonte: CanvasImageSource;
  let w: number;
  let h: number;
  try {
    const bmp = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    fonte = bmp;
    w = bmp.width;
    h = bmp.height;
  } catch {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.src = url;
    await img.decode();
    fonte = img;
    w = img.naturalWidth;
    h = img.naturalHeight;
    URL.revokeObjectURL(url);
  }
  const escala = Math.min(1, LADO_MAX_PX / Math.max(w, h));
  const largura = Math.round(w * escala);
  const altura = Math.round(h * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const c = canvas.getContext("2d")!;
  c.drawImage(fonte, 0, 0, largura, altura);
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.82), largura, altura };
}

/** Encaixa sem distorcer: mantém a proporção dentro da caixa. */
export function encaixar(w: number, h: number, maxW: number, maxH: number) {
  const e = Math.min(maxW / w, maxH / h);
  return { w: Math.round(w * e), h: Math.round(h * e) };
}

function dataUrlParaBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function paragrafos(texto: string): string[] {
  return texto.split(/\n/).map((l) => l.trimEnd());
}

export async function gerarDocx(doc: Documento): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } = await import("docx");
  const filhos: InstanceType<typeof Paragraph>[] = [];

  filhos.push(new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun({ text: doc.titulo, bold: true })] }));
  for (const [rot, val] of doc.identificacao) {
    if (!val.trim()) continue;
    filhos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `${rot}: `, bold: true }), new TextRun(val)] }));
  }

  for (const s of doc.secoes) {
    filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: s.titulo, bold: true })] }));
    for (const linha of paragrafos(s.texto)) {
      filhos.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun(linha)] }));
    }
    if (s.fotos) {
      for (const f of doc.fotos) {
        const { w, h } = encaixar(f.largura, f.altura, 450, 560);
        filhos.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120 },
            children: [new ImageRun({ type: "jpg", data: dataUrlParaBytes(f.dataUrl), transformation: { width: w, height: h } })],
          }),
        );
        if (f.legenda.trim()) {
          filhos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: f.legenda, italics: true, size: 20 })] }));
        }
      }
    }
  }

  const d = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children: filhos }],
  });
  return Packer.toBlob(d);
}

export async function gerarPdf(doc: Documento): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const M = 20;
  const W = 210 - 2 * M;
  const H = 297;
  let y = M;

  const garantir = (alt: number) => {
    if (y + alt > H - M) {
      pdf.addPage();
      y = M;
    }
  };
  const escrever = (texto: string, tam: number, estilo: "normal" | "bold" | "italic", alinh: "left" | "center" | "justify" = "left") => {
    pdf.setFont("helvetica", estilo);
    pdf.setFontSize(tam);
    const linhas = pdf.splitTextToSize(texto, W) as string[];
    const lh = tam * 0.45;
    for (const l of linhas) {
      garantir(lh);
      if (alinh === "center") pdf.text(l, 105, y, { align: "center" });
      else pdf.text(l, M, y);
      y += lh;
    }
  };

  escrever(doc.titulo, 18, "bold", "center");
  y += 4;
  for (const [rot, val] of doc.identificacao) {
    if (!val.trim()) continue;
    escrever(`${rot}: ${val}`, 11, "normal");
    y += 1;
  }
  for (const s of doc.secoes) {
    y += 5;
    garantir(10);
    escrever(s.titulo, 14, "bold");
    y += 1;
    for (const linha of paragrafos(s.texto)) {
      escrever(linha || " ", 11, "normal");
      y += 1.5;
    }
    if (s.fotos) {
      for (const f of doc.fotos) {
        const { w, h } = encaixar(f.largura, f.altura, W, 190);
        garantir(h + 10);
        pdf.addImage(f.dataUrl, "JPEG", 105 - w / 2, y, w, h);
        y += h + 3;
        if (f.legenda.trim()) escrever(f.legenda, 9, "italic", "center");
        y += 4;
      }
    }
  }
  return pdf.output("blob");
}

export function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export interface Modelo {
  titulo: string;
  secoes: string[];
}

/**
 * Lê o modelo .docx do professor e extrai só a estrutura: título e títulos de seção.
 * Nenhum texto de corpo do modelo é aproveitado — nada do conteúdo antigo vaza.
 */
export async function lerModelo(arquivo: File): Promise<Modelo> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await arquivo.arrayBuffer());
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Arquivo sem conteúdo Word.");
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  const ps = Array.from(dom.getElementsByTagName("w:p"));
  let titulo = "";
  const secoes: string[] = [];
  for (const p of ps) {
    const texto = Array.from(p.getElementsByTagName("w:t")).map((t) => t.textContent ?? "").join("").trim();
    if (!texto) continue;
    const estilo = p.getElementsByTagName("w:pStyle")[0]?.getAttribute("w:val") ?? "";
    const ehTitulo = /^(title|t[ií]?tulo|ttulo)$/i.test(estilo);
    const ehSecao = /heading|t[ií]?tulo|ttulo|subt/i.test(estilo);
    const runs = Array.from(p.getElementsByTagName("w:r")).filter((r) => (r.getElementsByTagName("w:t")[0]?.textContent ?? "").trim());
    const negrito =
      runs.length > 0 &&
      runs.every((r) => {
        const b = r.getElementsByTagName("w:b")[0];
        if (!b) return false;
        const v = b.getAttribute("w:val");
        return v !== "0" && v !== "false";
      });
    const curto = texto.length <= 80 && !/[.;!?]$/.test(texto);
    const limpo = texto.replace(/[:\s]+$/, "");
    if (ehTitulo && !titulo) titulo = limpo;
    else if ((ehSecao || negrito) && curto) {
      if (!titulo && secoes.length === 0 && /relat/i.test(limpo)) titulo = limpo;
      else if (!secoes.includes(limpo)) secoes.push(limpo);
    }
  }
  if (!secoes.length) throw new Error("Nenhum título de seção encontrado no modelo.");
  return { titulo: titulo || "Relatório", secoes };
}
