import { createFileRoute } from "@tanstack/react-router";

import { SeletorTurma } from "@/components/app/SeletorTurma";
import { TipoIcon } from "@/components/app/TipoIcon";
import { Secao, Titulo } from "@/components/app/Titulo";
import { AULAS, CICLOS, DEGRAUS, TURMAS, aulaAt, publicoDe } from "@/data/plano";
import { useApp } from "@/lib/app-state";
import { chaveDegrau, chaveOverride, degrauDaAula, opcoesDaFase } from "@/lib/plano-aula";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/organizar")({
  head: () => ({
    meta: [
      { title: "Organizar — Tatame Viver" },
      { name: "description", content: "Ciclo de novembro, escala de sete degraus e plano da aula por turma e faixa." },
      { property: "og:title", content: "Organizar — Tatame Viver" },
      { property: "og:description", content: "Ciclo de novembro, escala de sete degraus e plano da aula por turma e faixa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrganizarPage,
});

function OrganizarPage() {
  const { pos, escolher, plano, overrides, setOverride } = useApp();
  const degrau = degrauDaAula(pos.aula, overrides);
  const publico = publicoDe(pos.turma, pos.faixa);
  const fases = TURMAS[pos.turma].fases;
  const total = fases.reduce((s, f) => s + f.minutos, 0);

  return (
    <div>
      <Titulo extra={<span className="text-sm font-bold text-muted-foreground">Novembro · NoGi</span>}>Organizar</Titulo>
      <SeletorTurma comAula={false} />

      <Secao titulo="Ciclos">
        {CICLOS.map((c) => (
          <div key={c.n} className="placa p-3">
            <p className="font-display text-xl font-bold leading-tight">
              <span className="mr-2 rounded-md bg-ink px-2 text-ink-foreground">{c.n}</span>
              {c.nome}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AULAS.map((a, i) =>
                a.ciclo === c.n ? (
                  <button
                    key={a.data}
                    onClick={() => escolher({ aula: i })}
                    data-on={pos.aula === i}
                    className="tap rounded-lg border border-border px-3 py-2 text-left font-tabular data-[on=true]:border-ink data-[on=true]:bg-ink data-[on=true]:text-ink-foreground"
                  >
                    <span className="block text-lg font-bold leading-none">{a.data}{a.avaliacao && " ★"}</span>
                    <span className="text-xs opacity-75">{a.dia} · D{degrauDaAula(i, overrides)}</span>
                  </button>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </Secao>

      <Secao titulo={`Escala · ${aulaAt(pos.aula).data}`}>
        <ol className="flex flex-col-reverse gap-1.5">
          {DEGRAUS.map((d) => (
            <li key={d.n}>
              <button
                onClick={() => setOverride(chaveDegrau(pos.aula), d.n === aulaAt(pos.aula).degrau ? undefined : String(d.n))}
                style={{ width: `${55 + d.n * 6.4}%` }}
                className={cn(
                  "tap flex items-center gap-3 rounded-lg border px-3 py-2 text-left",
                  d.n === degrau ? "border-ink bg-signal font-bold" : d.n < degrau ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card",
                )}
              >
                <span className="font-display text-2xl font-extrabold font-tabular">{d.n}</span>
                <span className="text-sm font-semibold leading-tight">{d.nome}</span>
              </button>
            </li>
          ))}
        </ol>
      </Secao>

      <Secao titulo={`Plano · ${total} min`}>
        <ul className="placa divide-y divide-border">
          {fases.map((f, i) => {
            const it = plano[i];
            if (!it) return null;
            const opcoes = opcoesDaFase(f.id, publico, degrau);
            const chave = chaveOverride(pos.turma, pos.faixa, pos.aula, f.id);
            return (
              <li key={f.id} className="flex items-center gap-3 px-3 py-3">
                <span className="w-10 text-right font-display text-2xl font-extrabold font-tabular">{f.minutos}′</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{f.nome}</p>
                  {opcoes.length > 0 && it.jogo ? (
                    <label className="flex items-center gap-2">
                      <TipoIcon tipo={it.jogo.tipo} className="size-5" />
                      <select
                        value={it.jogo.id}
                        onChange={(e) => setOverride(chave, e.target.value)}
                        className="w-full min-w-0 truncate bg-transparent py-1 text-base font-semibold outline-none"
                        aria-label={`Jogo de ${f.nome}`}
                      >
                        {opcoes.map((o) => (
                          <option key={o.id} value={o.id}>{o.nome}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="text-base font-semibold">{f.id === "roda-inicial" ? "Foco e competência" : "Foco · Evidência · Ajuste"}</p>
                  )}
                  {it.origem && <p className="text-xs text-muted-foreground">Vem do jogo: {it.origem.nome}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </Secao>
    </div>
  );
}
