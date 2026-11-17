import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

import type { Foto, Modelo } from "@/lib/relatorio-export";

// Relatório só na memória da sessão. Nada de aluno é guardado.
export const SECOES_VIVER = [
  "Objetivo do período",
  "Atividades desenvolvidas",
  "Metodologia",
  "Resultados observados",
  "Desafios e ajustes",
  "Registro fotográfico",
  "Considerações finais",
] as const;

export const ID_VIVER = ["Projeto", "Modalidade", "Professor", "Local", "Período", "Público atendido"] as const;

export interface EstadoRelatorio {
  modeloViver: boolean;
  identificacao: Record<string, string>;
  textosViver: Record<string, string>;
  modelo: Modelo | null;
  textosModelo: Record<string, string>;
  fotos: Foto[];
}

const INICIAL: EstadoRelatorio = {
  modeloViver: true,
  identificacao: {
    Projeto: "Projeto Social de Jiu-Jítsu",
    Modalidade: "Jiu-jítsu NoGi",
    Professor: "Marcelo",
    Local: "Associação Viver",
    Período: "Novembro de 2026",
    "Público atendido": "120 alunos, de 6 a 15 anos",
  },
  textosViver: {},
  modelo: null,
  textosModelo: {},
  fotos: [],
};

const Ctx = createContext<[EstadoRelatorio, Dispatch<SetStateAction<EstadoRelatorio>>] | null>(null);

export function RelatorioProvider({ children }: { children: ReactNode }) {
  const st = useState<EstadoRelatorio>(INICIAL);
  return <Ctx.Provider value={st}>{children}</Ctx.Provider>;
}

export function useRelatorio() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRelatorio fora do RelatorioProvider");
  return c;
}
