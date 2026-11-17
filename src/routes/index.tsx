import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Pause, Play, SkipForward } from "lucide-react";

import { BotaoAjuste } from "@/components/app/BotaoAjuste";
import { JogoCard } from "@/components/app/JogoCard";
import { SeletorTurma } from "@/components/app/SeletorTurma";
import { TipoIcon } from "@/components/app/TipoIcon";
import { Secao } from "@/components/app/Titulo";
import { VideoCard } from "@/components/app/VideoCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CICLOS, TURMAS, aulaAt, degrauNome, faseAt } from "@/data/plano";
import { videosDaAula } from "@/data/videos";
import { useApp } from "@/lib/app-state";
import { degrauDaAula } from "@/lib/plano-aula";
import { desvioTxt, mmss } from "@/lib/som";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aula — Tatame Viver" },
      { name: "description", content: "Cronômetro da aula de 45 minutos com fases, jogos, foco do dia e vídeos por faixa." },
      { property: "og:title", content: "Aula — Tatame Viver" },
      { property: "og:description", content: "Cronômetro da aula de 45 minutos com fases, jogos, foco do dia e vídeos por faixa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AulaPage,
});

function AulaPage() {
  const { pos, plano, running, iniciarPausar, ajustar, proximaFase, irParaFase, desvios, overrides, config, registro, setRegistro } = useApp();
  const turma = TURMAS[pos.turma];
  const aula = aulaAt(pos.aula);
  const degrau = degrauDaAula(pos.aula, overrides);
  const fase = faseAt(pos.turma, pos.fase);
  const prox = turma.fases[pos.fase + 1];
  const item = plano[pos.fase];
  const proxJogo = plano[pos.fase + 1]?.jogo;
  const fim = pos.segundos <= 10 && running;
  const mediaDesvio = desvios.length ? desvios.reduce((s, d) => s + (d.real - d.planejado), 0) / desvios.length : 0;

  return (
    <div className="space-y-4 pt-4">
      <SeletorTurma />

      {/* Foco do dia */}
      <section className="placa overflow-hidden">
        <div className="flex items-center justify-between bg-ink px-4 py-2 text-ink-foreground">
          <span className="font-display text-lg font-bold uppercase">Degrau {degrau} · {degrauNome(degrau)}</span>
          <span className="text-xs font-semibold opacity-80">C{aula.ciclo}</span>
        </div>
        <div className="space-y-3 p-4">
          <p className="font-display text-3xl font-bold leading-tight">{registro.foco || aula.foco}</p>
          {aula.avaliacao && <p className="text-sm font-bold uppercase text-destructive">★ Avaliação prática final</p>}
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="radiogroup" aria-label="Competência do dia">
            {config.competencias.map((c) => (
              <Button key={c} variant="chip" size="chip" data-on={registro.competencia === c} className="shrink-0" onClick={() => setRegistro({ competencia: registro.competencia === c ? "" : c })}>
                {c}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Cronômetro */}
      <section className="placa p-4">
        <div className="flex h-3 gap-1" aria-label="Fases da aula">
          {turma.fases.map((f, i) => (
            <button
              key={f.id}
              aria-label={f.nome}
              onClick={() => irParaFase(i)}
              style={{ flexGrow: f.minutos }}
              className={cn("tap h-full rounded-full", i < pos.fase ? "bg-ink" : i === pos.fase ? "bg-signal" : "bg-muted")}
            />
          ))}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold uppercase">{fase.nome}</h2>
          <span className="text-sm font-semibold text-muted-foreground font-tabular">{fase.minutos} min · aula 45</span>
        </div>
        <p className={cn("text-center font-display text-[7rem] font-extrabold leading-none font-tabular", fim && "animate-pulso text-destructive")}>
          {mmss(pos.segundos)}
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-muted-foreground">
          {prox ? <>Próxima: {prox.nome}{proxJogo && ` · ${proxJogo.nome}`}</> : "Última fase"}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <BotaoAjuste passo={-60} passoFino={-5} onAjuste={ajustar} rotulo="Menos um minuto">−1</BotaoAjuste>
          <Button variant="signal" className="h-16 flex-1 rounded-2xl text-xl [&_svg]:size-7" onClick={iniciarPausar} aria-label={running ? "Pausar" : "Iniciar"}>
            {running ? <Pause /> : <Play />}
          </Button>
          <BotaoAjuste passo={60} passoFino={5} onAjuste={ajustar} rotulo="Mais um minuto">+1</BotaoAjuste>
          <Button variant="outline" size="tile" onClick={proximaFase} aria-label="Próxima fase">
            <SkipForward />
          </Button>
        </div>
      </section>

      {/* O que fazer agora */}
      {faseAgora(item)}

      {desvios.length > 0 && (
        <Secao titulo="Desvios">
          <ul className="placa divide-y divide-border">
            {desvios.map((d, i) => (
              <li key={i} className="flex justify-between px-4 py-2 font-tabular">
                <span>{d.fase}</span>
                <span className={cn("font-bold", d.real > d.planejado ? "text-destructive" : "text-success")}>{desvioTxt(d.real - d.planejado)}</span>
              </li>
            ))}
            <li className="flex justify-between bg-muted px-4 py-2 font-bold font-tabular">
              <span>Média</span>
              <span>{desvioTxt(mediaDesvio)}</span>
            </li>
          </ul>
        </Secao>
      )}

      <Secao titulo="Vídeos">
        {videosDaAula(pos.turma, pos.faixa, degrau).map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
        {videosDaAula(pos.turma, pos.faixa, degrau).length === 0 && (
          <p className="placa p-4 text-sm font-semibold">Vídeo a gravar/buscar — sem vídeo verificado para esta faixa e este objetivo.</p>
        )}
      </Secao>

      <p className="pt-2 text-center text-xs text-muted-foreground">Ciclo {aula.ciclo} · {CICLOS[aula.ciclo - 1]?.nome} · NoGi</p>
    </div>
  );

  function faseAgora(it: typeof item) {
    if (!it) return null;
    if (it.faseId === "roda-inicial") {
      return (
        <div className="placa flex items-center gap-3 p-4">
          <Megaphone className="size-9 shrink-0" aria-hidden />
          <p className="font-display text-2xl font-bold">Anunciar foco e competência</p>
        </div>
      );
    }
    if (it.faseId === "roda-final") {
      return (
        <section className="placa space-y-3 p-4">
          <h2 className="text-2xl font-bold uppercase">Registro</h2>
          {registro.competencia && <p className="text-sm font-semibold text-muted-foreground">{registro.competencia}</p>}
          <Linha rotulo="Foco" valor={registro.foco} onChange={(v) => setRegistro({ foco: v })} />
          <Linha rotulo="Evidência" valor={registro.evidencia} onChange={(v) => setRegistro({ evidencia: v })} />
          <Linha rotulo="Ajuste" valor={registro.ajuste} onChange={(v) => setRegistro({ ajuste: v })} />
        </section>
      );
    }
    if (it.faseId === "tecnica") {
      return (
        <div className="space-y-3">
          <div className="placa p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Técnica</p>
            <p className="font-display text-3xl font-bold leading-tight">{it.tecnica}</p>
            {it.origem && (
              <p className="mt-2 flex items-center gap-2 text-base font-semibold">
                <TipoIcon tipo={it.origem.tipo} className="size-5" /> Vem do jogo: {it.origem.nome}
              </p>
            )}
          </div>
          {it.jogo && <JogoCard jogo={it.jogo} compacto />}
        </div>
      );
    }
    return it.jogo ? <JogoCard jogo={it.jogo} /> : null;
  }
}

function Linha({ rotulo, valor, onChange }: { rotulo: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-bold uppercase">{rotulo}</span>
      <Textarea rows={2} value={valor} onChange={(e) => onChange(e.target.value)} className="mt-1 bg-background text-base" />
    </label>
  );
}
