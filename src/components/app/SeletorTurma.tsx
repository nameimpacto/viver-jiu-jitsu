import { Button } from "@/components/ui/button";
import { AULAS, FAIXAS, TURMAS, type TurmaId } from "@/data/plano";
import { useApp } from "@/lib/app-state";

export function SeletorTurma({ comAula = true }: { comAula?: boolean }) {
  const { pos, escolher } = useApp();
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {(Object.keys(TURMAS) as TurmaId[]).map((t) => (
          <Button key={t} variant="chip" size="chip" data-on={pos.turma === t} className="flex-1" onClick={() => escolher({ turma: t })}>
            {TURMAS[t].nome}
          </Button>
        ))}
      </div>
      {pos.turma === "criancas" && (
        <div className="flex gap-2">
          {FAIXAS.map((f) => (
            <Button key={f.id} variant="chip" size="chip" data-on={pos.faixa === f.id} className="flex-1 font-tabular" onClick={() => escolher({ faixa: f.id })}>
              {f.nome}
            </Button>
          ))}
        </div>
      )}
      {comAula && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {AULAS.map((a, i) => (
            <Button
              key={a.data}
              variant="chip"
              size="chip"
              data-on={pos.aula === i}
              className="shrink-0 font-tabular"
              onClick={() => escolher({ aula: i })}
            >
              {a.data}
              {a.avaliacao && <span aria-label="Avaliação">★</span>}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
