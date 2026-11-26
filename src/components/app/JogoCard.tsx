import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { TIPOS, type Jogo } from "@/data/jogos";
import { cn } from "@/lib/utils";
import { TipoIcon } from "./TipoIcon";

const BORDA = {
  inicial: "border-l-tipo-inicial",
  analitico: "border-l-tipo-analitico",
  situacional: "border-l-tipo-situacional",
  formal: "border-l-tipo-formal",
  especial: "border-l-tipo-especial",
} as const;

/** Toque abre o detalhe (objetivo, técnica e degraus) — antes o cartão não fazia nada. */
export function JogoCard({ jogo, compacto = false }: { jogo: Jogo; compacto?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const alternar = () => setAberto((a) => !a);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={aberto}
      aria-label={`${jogo.nome} — toque para ver o detalhe`}
      onClick={alternar}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          alternar();
        }
      }}
      className={cn("placa cursor-pointer border-l-8 p-4 tap", BORDA[jogo.tipo])}
    >
      <div className="flex items-start gap-3">
        <TipoIcon tipo={jogo.tipo} className="mt-0.5 size-7" />
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold leading-tight">{jogo.nome}</h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {TIPOS[jogo.tipo].nome} · {jogo.objetivo}
          </p>
        </div>
      </div>
      <p className={cn("mt-3 font-medium", compacto ? "text-base" : "text-lg")}>{jogo.regra}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {jogo.tipo === "especial" ? (
          <Badge variant="outline">Momento · fora da escala</Badge>
        ) : (
          jogo.degraus.map((d) => (
            <Badge key={d} variant="secondary" className="font-tabular">
              Degrau {d}
            </Badge>
          ))
        )}
        {jogo.placar && <Badge className="bg-signal text-signal-foreground hover:bg-signal">Placar</Badge>}
      </div>
      {aberto && (
        <div className="mt-3 space-y-1 border-t border-border pt-3">
          <p className="text-sm">
            <span className="font-bold">Objetivo: </span>
            {jogo.objetivo}
          </p>
          {jogo.tecnica && (
            <p className="text-sm">
              <span className="font-bold">Técnica que nasce do jogo: </span>
              {jogo.tecnica}
            </p>
          )}
          <p className="text-sm">
            <span className="font-bold">Degraus: </span>
            {jogo.degraus.length ? jogo.degraus.join(", ") : "nenhum — momento fora da escala"}
          </p>
          {jogo.placar && <p className="text-sm font-semibold">Com placar.</p>}
        </div>
      )}
      <p className="mt-2 text-xs font-semibold text-muted-foreground">{aberto ? "Toque para fechar" : "Toque para ver o detalhe"}</p>
    </article>
  );
}
