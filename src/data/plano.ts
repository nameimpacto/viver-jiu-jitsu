// Planejamento do ciclo de novembro — professor Marcelo, Associação Viver.
// Toda aula tem 45 minutos. Nada aqui é dado de aluno.

export type TurmaId = "criancas" | "adultos";
export type FaixaId = "6-9" | "10-12" | "13-15";
export type Publico = "kids" | "teen" | "adult";
export type FaseId = "roda-inicial" | "jogo-inicial" | "especial" | "tecnica" | "luta" | "roda-final";

export interface Fase {
  id: FaseId;
  nome: string;
  minutos: number;
}

const NOMES_FASE: Record<FaseId, string> = {
  "roda-inicial": "Roda inicial",
  "jogo-inicial": "Jogo inicial",
  especial: "Jogo especial",
  tecnica: "Técnica",
  luta: "Luta",
  "roda-final": "Roda final",
};

const ORDEM: FaseId[] = ["roda-inicial", "jogo-inicial", "especial", "tecnica", "luta", "roda-final"];

function fases(minutos: number[]): Fase[] {
  return ORDEM.map((id, i) => ({ id, nome: NOMES_FASE[id], minutos: minutos[i] ?? 0 }));
}

export const DURACAO_AULA_MIN = 45;

export const TURMAS: Record<TurmaId, { nome: string; fases: Fase[] }> = {
  criancas: { nome: "Crianças", fases: fases([2, 6, 5, 16, 14, 2]) },
  adultos: { nome: "Adultos", fases: fases([3, 7, 5, 18, 10, 2]) },
};

export const FAIXAS: { id: FaixaId; nome: string }[] = [
  { id: "6-9", nome: "6–9" },
  { id: "10-12", nome: "10–12" },
  { id: "13-15", nome: "13–15" },
];

export function publicoDe(turma: TurmaId, faixa: FaixaId): Publico {
  if (turma === "adultos") return "adult";
  return faixa === "13-15" ? "teen" : "kids";
}

export interface Degrau {
  n: number;
  nome: string;
}

export const DEGRAUS: Degrau[] = [
  { n: 1, nome: "Base e lateralidade" },
  { n: 2, nome: "Samurai Roll e Berimbolo" },
  { n: 3, nome: "Tomada de costas e seatbelt" },
  { n: 4, nome: "Mata-leão" },
  { n: 5, nome: "Passagem e preparar a entrada" },
  { n: 6, nome: "Sistema de Leg Drag" },
  { n: 7, nome: "Cadeia completa e situação aberta" },
];

export interface Ciclo {
  n: number;
  nome: string;
}

export const CICLOS: Ciclo[] = [
  { n: 1, nome: "Samurai Roll dos dois lados para as costas" },
  { n: 2, nome: "Costas com seatbelt e decisão" },
  { n: 3, nome: "Cadeia completa em situação aberta" },
];

export interface Aula {
  data: string; // dd/mm
  dia: "Ter" | "Qui";
  ciclo: number;
  degrau: number;
  foco: string;
  avaliacao?: boolean;
}

export const AULAS: Aula[] = [
  { data: "03/11", dia: "Ter", ciclo: 1, degrau: 1, foco: "Base firme, lado direito e esquerdo" },
  { data: "05/11", dia: "Qui", ciclo: 1, degrau: 2, foco: "Samurai Roll pelo lado forte até as costas" },
  { data: "10/11", dia: "Ter", ciclo: 1, degrau: 2, foco: "Samurai Roll pelo lado fraco até as costas" },
  { data: "12/11", dia: "Qui", ciclo: 2, degrau: 3, foco: "Chegar nas costas e fechar o seatbelt" },
  { data: "17/11", dia: "Ter", ciclo: 2, degrau: 3, foco: "Nas costas: decidir o lado e manter" },
  { data: "19/11", dia: "Qui", ciclo: 2, degrau: 4, foco: "Do seatbelt ao mata-leão" },
  { data: "24/11", dia: "Ter", ciclo: 3, degrau: 6, foco: "Passar, preparar a entrada e Leg Drag até as costas" },
  { data: "26/11", dia: "Qui", ciclo: 3, degrau: 7, foco: "Cadeia completa em situação aberta", avaliacao: true },
];

export const COMPETENCIAS_PADRAO = [
  "Respeito",
  "Cooperação",
  "Autocontrole",
  "Persistência",
  "Atenção",
  "Confiança",
  "Responsabilidade",
  "Empatia",
];

export function aulaAt(i: number): Aula {
  return AULAS[Math.min(Math.max(0, i), AULAS.length - 1)]!;
}

export function faseAt(turma: TurmaId, i: number): Fase {
  const f = TURMAS[turma].fases;
  return f[Math.min(Math.max(0, i), f.length - 1)]!;
}

export function degrauNome(n: number): string {
  return DEGRAUS.find((d) => d.n === n)?.nome ?? "";
}
