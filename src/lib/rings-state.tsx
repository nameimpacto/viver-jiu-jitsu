import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { aplicarLance, PLACAR_ZERO, type Lance, type Placar } from "@/lib/placar";
import { bipe, destravarAudio } from "@/lib/som";

// Rings só na memória: nomes de atletas nunca são guardados.
export const FAIXAS_RING = ["6–9", "10–12", "13–15", "Adulto"] as const;
export const NIVEIS_RING = ["Iniciante", "Intermediário", "Avançado"] as const;

export interface Atleta {
  nome: string;
  faixa: (typeof FAIXAS_RING)[number];
  nivel: (typeof NIVEIS_RING)[number];
  placar: Placar;
}

export interface Ring {
  id: number;
  duracao: number;
  segundos: number;
  running: boolean;
  endAt: number;
  a: Atleta;
  b: Atleta;
  hist: { lado: "a" | "b"; lance: Lance }[];
}

function novoAtleta(nome: string): Atleta {
  return { nome, faixa: "10–12", nivel: "Iniciante", placar: { ...PLACAR_ZERO } };
}

function novoRing(id: number): Ring {
  return { id, duracao: 180, segundos: 180, running: false, endAt: 0, a: novoAtleta("Atleta 1"), b: novoAtleta("Atleta 2"), hist: [] };
}

interface RingsCtx {
  rings: Ring[];
  algumRodando: boolean;
  adicionar: () => number;
  remover: (id: number) => void;
  atualizar: (id: number, fn: (r: Ring) => Ring) => void;
  lancar: (id: number, lado: "a" | "b", lance: Lance) => void;
  desfazer: (id: number) => void;
  zerar: (id: number) => void;
  alternarTempo: (id: number) => void;
  ajustarTempo: (id: number, delta: number) => void;
  definirDuracao: (id: number, seg: number) => void;
}

const Ctx = createContext<RingsCtx | null>(null);

export function useRings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRings fora do RingsProvider");
  return c;
}

export function RingsProvider({ children }: { children: ReactNode }) {
  const [rings, setRings] = useState<Ring[]>([novoRing(1)]);
  const proxId = useRef(2);
  const algumRodando = rings.some((r) => r.running);

  useEffect(() => {
    if (!algumRodando) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      let acabou = false;
      setRings((rs) =>
        rs.map((r) => {
          if (!r.running) return r;
          const seg = Math.max(0, Math.ceil((r.endAt - now) / 1000));
          if (seg === r.segundos) return r;
          if (seg === 0) {
            acabou = true;
            return { ...r, segundos: 0, running: false };
          }
          return { ...r, segundos: seg };
        }),
      );
      if (acabou) bipe(true);
    }, 250);
    return () => window.clearInterval(id);
  }, [algumRodando]);

  const atualizar = useCallback((id: number, fn: (r: Ring) => Ring) => {
    setRings((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));
  }, []);

  const adicionar = useCallback(() => {
    const id = proxId.current++;
    setRings((rs) => [...rs, novoRing(id)]);
    return id;
  }, []);

  const remover = useCallback((id: number) => setRings((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs)), []);

  const lancar = useCallback(
    (id: number, lado: "a" | "b", lance: Lance) =>
      atualizar(id, (r) => ({
        ...r,
        [lado]: { ...r[lado], placar: aplicarLance(r[lado].placar, lance, 1) },
        hist: [...r.hist, { lado, lance }],
      })),
    [atualizar],
  );

  const desfazer = useCallback(
    (id: number) =>
      atualizar(id, (r) => {
        const ultimo = r.hist[r.hist.length - 1];
        if (!ultimo) return r;
        return {
          ...r,
          [ultimo.lado]: { ...r[ultimo.lado], placar: aplicarLance(r[ultimo.lado].placar, ultimo.lance, -1) },
          hist: r.hist.slice(0, -1),
        };
      }),
    [atualizar],
  );

  const zerar = useCallback(
    (id: number) =>
      atualizar(id, (r) => ({
        ...r,
        running: false,
        segundos: r.duracao,
        a: { ...r.a, placar: { ...PLACAR_ZERO } },
        b: { ...r.b, placar: { ...PLACAR_ZERO } },
        hist: [],
      })),
    [atualizar],
  );

  const alternarTempo = useCallback(
    (id: number) => {
      destravarAudio();
      atualizar(id, (r) => {
        if (r.running) return { ...r, running: false };
        const segundos = r.segundos > 0 ? r.segundos : r.duracao;
        return { ...r, running: true, segundos, endAt: Date.now() + segundos * 1000 };
      });
    },
    [atualizar],
  );

  const ajustarTempo = useCallback(
    (id: number, delta: number) =>
      atualizar(id, (r) => {
        const segundos = Math.max(0, Math.min(30 * 60, r.segundos + delta));
        return { ...r, segundos, endAt: r.endAt + (segundos - r.segundos) * 1000 };
      }),
    [atualizar],
  );

  const definirDuracao = useCallback(
    (id: number, seg: number) => atualizar(id, (r) => ({ ...r, duracao: seg, segundos: seg, running: false })),
    [atualizar],
  );

  return (
    <Ctx.Provider value={{ rings, algumRodando, adicionar, remover, atualizar, lancar, desfazer, zerar, alternarTempo, ajustarTempo, definirDuracao }}>
      {children}
    </Ctx.Provider>
  );
}
