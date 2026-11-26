import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileDown, FileText, ImagePlus, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Secao, Titulo } from "@/components/app/Titulo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AULAS, CICLOS } from "@/data/plano";
import { useApp } from "@/lib/app-state";
import { baixar, gerarDocx, gerarPdf, lerModelo, reduzirFoto, type Documento, type Foto, type Secao as SecaoDoc } from "@/lib/relatorio-export";
import { ID_VIVER, SECOES_VIVER, useRelatorio, type EstadoRelatorio } from "@/lib/relatorio-state";

export const Route = createFileRoute("/relatorio")({
  head: () => ({
    meta: [
      { title: "Relatório — Tatame Viver" },
      { name: "description", content: "Relatório da Associação Viver com fotos, exportado em Word e PDF." },
      { property: "og:title", content: "Relatório — Tatame Viver" },
      { property: "og:description", content: "Relatório da Associação Viver com fotos, exportado em Word e PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RelatorioPage,
});

const FOTO_SECAO = /foto|imagem|registro fotogr/i;

export function montarDocumento(st: EstadoRelatorio): Documento {
  if (st.modeloViver || !st.modelo) {
    return {
      titulo: "Relatório de Atividades",
      identificacao: ID_VIVER.map((k) => [k, st.identificacao[k] ?? ""]),
      secoes: SECOES_VIVER.map((t) => ({ titulo: t, texto: st.textosViver[t] ?? "", fotos: t === "Registro fotográfico" })),
      fotos: st.fotos,
    };
  }
  const secoes: SecaoDoc[] = st.modelo.secoes.map((t) => ({ titulo: t, texto: st.textosModelo[t] ?? "" }));
  const iFoto = secoes.findIndex((s) => FOTO_SECAO.test(s.titulo));
  const sf = secoes[iFoto];
  if (sf) sf.fotos = true;
  else if (st.fotos.length) secoes.splice(Math.max(0, secoes.length - 1), 0, { titulo: "Registro fotográfico", texto: "", fotos: true });
  return { titulo: st.modelo.titulo, identificacao: [], secoes, fotos: st.fotos };
}

function RelatorioPage() {
  const [st, setSt] = useRelatorio();
  const { registros, pos, encerrarAula } = useApp();
  const navigate = useNavigate();
  const [ocupado, setOcupado] = useState<"docx" | "pdf" | "foto" | "modelo" | null>(null);
  const usandoModelo = !st.modeloViver;
  const proximaAula = AULAS[pos.aula + 1];

  const encerrar = () => {
    encerrarAula();
    toast.success(proximaAula ? `Aula encerrada. Próxima: ${proximaAula.data}.` : "Aula encerrada.");
    void navigate({ to: "/" });
  };

  const exportar = async (tipo: "docx" | "pdf") => {
    if (usandoModelo && !st.modelo) {
      toast.error("Envie o modelo primeiro.");
      return;
    }
    setOcupado(tipo);
    try {
      const doc = montarDocumento(st);
      const blob = tipo === "docx" ? await gerarDocx(doc) : await gerarPdf(doc);
      baixar(blob, `relatorio-viver-novembro-2026.${tipo}`);
    } catch (e) {
      console.error(e);
      toast.error("Não deu para gerar o arquivo.");
    } finally {
      setOcupado(null);
    }
  };

  const addFotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setOcupado("foto");
    try {
      const novas: Foto[] = [];
      for (const f of Array.from(files)) {
        const r = await reduzirFoto(f);
        novas.push({ ...r, id: crypto.randomUUID(), legenda: "" });
      }
      setSt((s) => ({ ...s, fotos: [...s.fotos, ...novas] }));
    } catch {
      toast.error("Foto não suportada.");
    } finally {
      setOcupado(null);
    }
  };

  const carregarModelo = async (file: File | undefined) => {
    if (!file) return;
    setOcupado("modelo");
    try {
      const modelo = await lerModelo(file);
      setSt((s) => ({ ...s, modelo, textosModelo: {} }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Modelo inválido.");
    } finally {
      setOcupado(null);
    }
  };

  const trazerAulas = () => {
    const linhas = AULAS.map((a, i) => {
      const regs = Object.entries(registros).filter(([k]) => k.endsWith(`|${i}`)).map(([, r]) => r);
      const r = regs.find((x) => x.evidencia || x.ajuste) ?? regs[0];
      const partes = [`${a.data} — ${r?.foco || a.foco}`];
      if (a.observacao) partes.push(a.observacao);
      if (r?.competencia) partes.push(`Competência: ${r.competencia}`);
      if (r?.evidencia) partes.push(`Evidência: ${r.evidencia}`);
      if (r?.ajuste) partes.push(`Ajuste: ${r.ajuste}`);
      return partes.join(". ") + ".";
    });
    const cab = CICLOS.map((c) => `Ciclo ${c.n}: ${c.nome}.`).join(" ");
    setSt((s) => ({ ...s, textosViver: { ...s.textosViver, "Atividades desenvolvidas": [cab, ...linhas].join("\n") } }));
  };

  const secoes = usandoModelo ? (st.modelo?.secoes ?? []) : SECOES_VIVER.filter((t) => t !== "Registro fotográfico");
  const textos = usandoModelo ? st.textosModelo : st.textosViver;
  const setTexto = (t: string, v: string) =>
    setSt((s) => (usandoModelo ? { ...s, textosModelo: { ...s.textosModelo, [t]: v } } : { ...s, textosViver: { ...s.textosViver, [t]: v } }));

  return (
    <div>
      <Titulo>Relatório</Titulo>

      <label className="placa flex items-center justify-between p-4">
        <span className="text-lg font-bold">Modelo da Viver</span>
        <Switch checked={st.modeloViver} onCheckedChange={(v) => setSt((s) => ({ ...s, modeloViver: v }))} />
      </label>

      {usandoModelo && (
        <label className="placa mt-3 flex cursor-pointer items-center gap-3 p-4">
          <Upload className="size-6" />
          <span className="flex-1 font-semibold">{st.modelo ? `${st.modelo.titulo} · ${st.modelo.secoes.length} seções` : "Modelo do professor (.docx)"}</span>
          <input type="file" accept=".docx" className="sr-only" onChange={(e) => void carregarModelo(e.target.files?.[0])} />
        </label>
      )}

      {!usandoModelo && (
        <Secao titulo="Identificação">
          <div className="placa space-y-2 p-4">
            {ID_VIVER.map((k) => (
              <label key={k} className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">{k}</span>
                <Input value={st.identificacao[k] ?? ""} onChange={(e) => setSt((s) => ({ ...s, identificacao: { ...s.identificacao, [k]: e.target.value } }))} />
              </label>
            ))}
          </div>
        </Secao>
      )}

      {secoes.map((t) => (
        <Secao key={t} titulo={t}>
          {!usandoModelo && t === "Atividades desenvolvidas" && (
            <Button variant="outline" size="sm" onClick={trazerAulas}>Trazer aulas e registros</Button>
          )}
          <Textarea rows={t === "Atividades desenvolvidas" ? 8 : 4} value={textos[t] ?? ""} onChange={(e) => setTexto(t, e.target.value)} className="bg-card text-base" />
        </Secao>
      ))}

      <Secao titulo="Fotos">
        <div className="grid grid-cols-2 gap-2">
          {st.fotos.map((f) => (
            <figure key={f.id} className="placa relative overflow-hidden p-1.5">
              <div className="flex aspect-square items-center justify-center bg-muted">
                <img src={f.dataUrl} alt={f.legenda || "Foto da aula"} className="max-h-full max-w-full object-contain" />
              </div>
              <Input
                value={f.legenda}
                placeholder="Legenda"
                onChange={(e) => setSt((s) => ({ ...s, fotos: s.fotos.map((x) => (x.id === f.id ? { ...x, legenda: e.target.value } : x)) }))}
                className="mt-1.5 h-9 text-sm"
              />
              <button
                aria-label="Remover foto"
                className="tap absolute top-2 right-2 rounded-full bg-ink p-1.5 text-ink-foreground"
                onClick={() => setSt((s) => ({ ...s, fotos: s.fotos.filter((x) => x.id !== f.id) }))}
              >
                <X className="size-4" />
              </button>
            </figure>
          ))}
          <label className="placa flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 border-dashed text-muted-foreground">
            <ImagePlus className="size-9" />
            <span className="text-sm font-semibold">{ocupado === "foto" ? "Reduzindo…" : "Fotos"}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addFotos(e.target.files)} />
          </label>
        </div>
      </Secao>

      <div className="mt-6 space-y-2">
        <Button variant="signal" size="xl" className="w-full" onClick={encerrar}>
          Encerrar aula e avançar
        </Button>
        <p className="text-center text-xs font-semibold text-muted-foreground">
          {proximaAula
            ? "Encerrar a aula salva o relatório e avança para a próxima data."
            : "Última aula da grade — encerrar recomeça do início."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="fonte" size="xl" onClick={() => void exportar("docx")} disabled={!!ocupado}>
          <FileText /> {ocupado === "docx" ? "…" : "Word"}
        </Button>
        <Button variant="youtube" size="xl" onClick={() => void exportar("pdf")} disabled={!!ocupado}>
          <FileDown /> {ocupado === "pdf" ? "…" : "PDF"}
        </Button>
      </div>
    </div>
  );
}
