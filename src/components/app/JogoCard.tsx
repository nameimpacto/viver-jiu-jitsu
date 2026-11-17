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

export function JogoCard({ jogo, compacto = false }: { jogo: Jogo; compacto?: boolean }) {
  return (
    <article className={cn("placa border-l-8 p-4", BORDA[jogo.tipo])}>
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
    </article>
  );
}
