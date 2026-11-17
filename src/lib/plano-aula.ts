import { JOGOS, jogoPorId, type Jogo, type TipoJogo } from "@/data/jogos";
import { TURMAS, aulaAt, publicoDe, degrauNome, type FaixaId, type FaseId, type Publico, type TurmaId } from "@/data/plano";

export type Overrides = Record<string, string>;

export interface ItemFase {
  faseId: FaseId;
  jogo?: Jogo | undefined;
  /** Técnica do dia (fase Técnica). */
  tecnica?: string | undefined;
  /** Crianças 6–12: jogo de onde a técnica nasce. */
  origem?: Jogo | undefined;
}

/** Tipos aceitos em cada fase, por público. */
export function tiposDaFase(faseId: FaseId, publico: Publico): TipoJogo[] {
  switch (faseId) {
    case "jogo-inicial":
      return ["inicial"];
    case "especial":
      return ["especial"];
    case "tecnica":
      return publico === "teen" ? ["situacional"] : publico === "kids" ? ["situacional", "analitico"] : ["analitico"];
    case "luta":
      return publico === "teen" ? ["formal", "situacional"] : ["formal", "situacional"];
    default:
      return [];
  }
}

export function opcoesDaFase(faseId: FaseId, publico: Publico, degrau: number): Jogo[] {
  const tipos = tiposDaFase(faseId, publico);
  const lista = JOGOS.filter((j) => tipos.includes(j.tipo) && j.publico.includes(publico));
  if (faseId === "especial") return lista;
  if (faseId === "luta" && publico === "teen") {
    // 13–15: luta com desvantagem, King of the Mat e cadeia de Leg Drag sempre à mão.
    const fixos = ["f1", "f2", "s6"];
    return [...lista.filter((j) => fixos.includes(j.id)), ...lista.filter((j) => !fixos.includes(j.id))];
  }
  if (publico === "teen" && faseId === "tecnica") {
    const placar = lista.filter((j) => j.placar);
    return ordenarPorDegrau(placar.length ? placar : lista, degrau);
  }
  return ordenarPorDegrau(lista, degrau);
}

function ordenarPorDegrau(lista: Jogo[], degrau: number): Jogo[] {
  const dist = (j: Jogo) => (j.degraus.length ? Math.min(...j.degraus.map((d) => Math.abs(d - degrau))) : 99);
  return [...lista].sort((a, b) => dist(a) - dist(b));
}

export function chaveOverride(turma: TurmaId, faixa: FaixaId, aula: number, fase: FaseId) {
  return `${publicoDe(turma, faixa)}|${aula}|${fase}`;
}

export function chaveDegrau(aula: number) {
  return `degrau|${aula}`;
}

export function degrauDaAula(aula: number, overrides: Overrides): number {
  const o = overrides[chaveDegrau(aula)];
  return o ? Number(o) : aulaAt(aula).degrau;
}

export function montarPlano(turma: TurmaId, faixa: FaixaId, aula: number, overrides: Overrides): ItemFase[] {
  const publico = publicoDe(turma, faixa);
  const degrau = degrauDaAula(aula, overrides);
  const escolher = (faseId: FaseId): Jogo | undefined => {
    const o = jogoPorId(overrides[chaveOverride(turma, faixa, aula, faseId)]);
    if (o) return o;
    const opcoes = opcoesDaFase(faseId, publico, degrau);
    if (!opcoes.length) return undefined;
    if (faseId === "especial" || (faseId === "luta" && publico === "teen")) {
      return opcoes[aula % Math.min(opcoes.length, faseId === "luta" ? 3 : opcoes.length)];
    }
    return opcoes[0];
  };

  return TURMAS[turma].fases.map((f) => {
    if (f.id === "roda-inicial" || f.id === "roda-final") return { faseId: f.id };
    const jogo = escolher(f.id);
    if (f.id === "tecnica") {
      const inicial = escolher("jogo-inicial");
      return {
        faseId: f.id,
        jogo,
        tecnica: degrauNome(degrau),
        origem: publico === "kids" ? inicial : undefined,
      };
    }
    return { faseId: f.id, jogo };
  });
}
