import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useState } from "react";

import { BotaoAjuste } from "@/components/app/BotaoAjuste";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LANCES } from "@/lib/placar";
import { FAIXAS_RING, NIVEIS_RING, useRings, type Atleta, type Ring } from "@/lib/rings-state";
import { mmss } from "@/lib/som";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rings")({
  head: () => ({
    meta: [
      { title: "Rings — Tatame Viver" },
      { name: "description", content: "Vários rings ao mesmo tempo com placar oficial e cronômetro próprio." },
      { property: "og:title", content: "Rings — Tatame Viver" },
      { property: "og:description", content: "Vários rings ao mesmo tempo com placar oficial e cronômetro próprio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RingsPage,
});

const DURACOES = [120, 180, 240, 300];

function RingsPage() {
  const { rings, adicionar } = useRings();
  const [ativoId, setAtivoId] = useState(rings[0]?.id ?? 1);
  const ring = rings.find((r) => r.id === ativoId) ?? rings[0];
  if (!ring) return null;

  return (
    <div className="flex h-[calc(100dvh-7rem-env(safe-area-inset-bottom))] flex-col gap-2 pt-3 pb-2">
      <div className="flex h-10 items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
          {rings.map((r, i) => (
            <Button
              key={r.id}
              variant="chip"
              size="chip"
              data-on={r.id === ring.id}
              onClick={() => setAtivoId(r.id)}
              className="relative shrink-0 font-tabular"
            >
              R{i + 1}
              {r.running && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-success" aria-label="Rodando" />}
            </Button>
          ))}
        </div>
        <Button variant="signal" size="icon" className="size-10 rounded-full" aria-label="Novo ring" onClick={() => setAtivoId(adicionar())}>
          <Plus />
        </Button>
      </div>
      <RingCard key={ring.id} ring={ring} numero={rings.indexOf(ring) + 1} aoRemover={() => setAtivoId(rings.find((r) => r.id !== ring.id)?.id ?? ring.id)} />
    </div>
  );
}

function RingCard({ ring, numero, aoRemover }: { ring: Ring; numero: number; aoRemover: () => void }) {
  const { alternarTempo, ajustarTempo, definirDuracao, desfazer, zerar, remover, rings } = useRings();
  const [confirmar, setConfirmar] = useState(false);
  const acabou = ring.segundos === 0;

  return (
    <section className="placa flex min-h-0 flex-1 flex-col gap-2 p-2.5">
      <div className="flex items-center gap-2">
        <BotaoAjuste passo={-60} passoFino={-5} onAjuste={(d) => ajustarTempo(ring.id, d)} rotulo="Menos um minuto" className="h-14 w-14">−</BotaoAjuste>
        <button
          onClick={() => {
            const i = DURACOES.indexOf(ring.duracao);
            if (!ring.running) definirDuracao(ring.id, DURACOES[(i + 1) % DURACOES.length] ?? 180);
          }}
          aria-label="Trocar duração"
          className={cn("tap flex-1 text-center font-display text-6xl font-extrabold leading-none font-tabular", acabou && "text-destructive", ring.running && ring.segundos <= 10 && "animate-pulso text-destructive")}
        >
          {mmss(ring.segundos)}
        </button>
        <BotaoAjuste passo={60} passoFino={5} onAjuste={(d) => ajustarTempo(ring.id, d)} rotulo="Mais um minuto" className="h-14 w-14">+</BotaoAjuste>
        <Button variant="signal" className="h-14 w-14 rounded-2xl [&_svg]:size-7" onClick={() => alternarTempo(ring.id)} aria-label={ring.running ? "Pausar" : "Iniciar"}>
          {ring.running ? <Pause /> : <Play />}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        <Lado ring={ring} lado="a" />
        <Lado ring={ring} lado="b" />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="h-11 flex-1 text-base" onClick={() => desfazer(ring.id)} disabled={!ring.hist.length}>
          <Undo2 /> Desfazer
        </Button>
        <Button variant="outline" className="h-11 flex-1 text-base" onClick={() => setConfirmar(true)}>
          <RotateCcw /> Zerar
        </Button>
      </div>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-3xl">Zerar o Ring {numero}?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-12">Voltar</AlertDialogCancel>
            {rings.length > 1 && (
              <Button
                variant="outline"
                className="h-12"
                onClick={() => {
                  setConfirmar(false);
                  aoRemover();
                  remover(ring.id);
                }}
              >
                Remover ring
              </Button>
            )}
            <AlertDialogAction className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => zerar(ring.id)}>
              Zerar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function Lado({ ring, lado }: { ring: Ring; lado: "a" | "b" }) {
  const { atualizar, lancar } = useRings();
  const atleta = ring[lado];
  const set = (n: Partial<Atleta>) => atualizar(ring.id, (r) => ({ ...r, [lado]: { ...r[lado], ...n } }));

  return (
    <div className={cn("flex min-h-0 flex-col gap-1.5 rounded-xl border-t-8 bg-muted p-2", lado === "a" ? "border-t-atleta-a" : "border-t-atleta-b")}>
      <input
        value={atleta.nome}
        onChange={(e) => set({ nome: e.target.value })}
        aria-label="Nome do atleta"
        className="h-8 w-full min-w-0 rounded-md bg-card px-2 text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-1">
        <select value={atleta.faixa} onChange={(e) => set({ faixa: e.target.value as Atleta["faixa"] })} aria-label="Faixa etária" className="h-7 min-w-0 flex-1 rounded-md bg-card px-1 text-xs font-semibold">
          {FAIXAS_RING.map((f) => <option key={f}>{f}</option>)}
        </select>
        <select value={atleta.nivel} onChange={(e) => set({ nivel: e.target.value as Atleta["nivel"] })} aria-label="Nível" className="h-7 min-w-0 flex-1 rounded-md bg-card px-1 text-xs font-semibold">
          {NIVEIS_RING.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex items-end justify-between px-1">
        <span className="font-display text-5xl font-extrabold leading-none font-tabular">{atleta.placar.pontos}</span>
        <span className="text-right text-xs font-bold leading-tight font-tabular">
          V {atleta.placar.vantagens}
          <br />
          P {atleta.placar.punicoes}
        </span>
      </div>
      <div className="grid flex-1 grid-rows-5 gap-1">
        {LANCES.map((l) => (
          <button
            key={l.tipo}
            onClick={() => lancar(ring.id, lado, l.tipo)}
            className={cn(
              "tap flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-left active:scale-[0.97]",
              l.tipo === "p" ? "bg-card text-destructive" : l.tipo === "v" ? "bg-card" : "bg-ink text-ink-foreground",
            )}
          >
            <span className="w-7 font-display text-xl font-extrabold">{l.rotulo}</span>
            <span className="text-[10px] font-semibold leading-tight">{l.detalhe}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
