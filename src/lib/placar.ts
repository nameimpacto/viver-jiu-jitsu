// Placar oficial por atleta.
export type Lance = "p4" | "p3" | "p2" | "v" | "p";

export const LANCES: { tipo: Lance; rotulo: string; detalhe: string }[] = [
  { tipo: "p4", rotulo: "+4", detalhe: "Montada · Costas" },
  { tipo: "p3", rotulo: "+3", detalhe: "Passagem" },
  { tipo: "p2", rotulo: "+2", detalhe: "Queda · Raspagem · Joelho" },
  { tipo: "v", rotulo: "V", detalhe: "Vantagem" },
  { tipo: "p", rotulo: "P", detalhe: "Punição" },
];

export const PONTOS: Record<Lance, number> = { p4: 4, p3: 3, p2: 2, v: 0, p: 0 };

export interface Placar {
  pontos: number;
  vantagens: number;
  punicoes: number;
}

export const PLACAR_ZERO: Placar = { pontos: 0, vantagens: 0, punicoes: 0 };

/** sinal = 1 lança; sinal = -1 desfaz. */
export function aplicarLance(p: Placar, lance: Lance, sinal: 1 | -1 = 1): Placar {
  if (lance === "v") return { ...p, vantagens: Math.max(0, p.vantagens + sinal) };
  if (lance === "p") return { ...p, punicoes: Math.max(0, p.punicoes + sinal) };
  return { ...p, pontos: Math.max(0, p.pontos + sinal * PONTOS[lance]) };
}
