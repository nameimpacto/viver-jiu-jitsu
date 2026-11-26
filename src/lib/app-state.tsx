import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { AULAS, COMPETENCIAS_PADRAO, TURMAS, aulaAt, faseAt, type FaixaId, type TurmaId } from "@/data/plano";
import { montarPlano, type ItemFase, type Overrides } from "@/lib/plano-aula";
import { bipe, destravarAudio, falar } from "@/lib/som";

/** Única coisa guardada entre aberturas: a posição da aula. Nenhum dado de aluno. */
export interface Posicao {
  aba: string;
  turma: TurmaId;
  faixa: FaixaId;
  aula: number;
  fase: number;
  segundos: number;
}

const CHAVE_POSICAO = "viver.posicao";
const CHAVE_SESSAO = "viver.sessao";
/** Config (nome/local da fonte, links, competências, voz e alarme) fica no aparelho, não só na sessão. */
const CHAVE_CONFIG = "viver.config";

/** Posição depois de encerrar a aula: avança para a próxima data da grade. Na última aula, recomeça a mesma aula da fase inicial. */
export function encerrarPosicao(p: Posicao): Posicao {
  const proxima = p.aula + 1;
  const segundos = faseAt(p.turma, 0).minutos * 60;
  if (proxima >= AULAS.length) return { ...p, fase: 0, segundos };
  return { ...p, aula: proxima, fase: 0, segundos };
}

export function posicaoInicial(): Posicao {
  return { aba: "/", turma: "criancas", faixa: "6-9", aula: 0, fase: 0, segundos: faseAt("criancas", 0).minutos * 60 };
}

export interface Desvio {
  fase: string;
  planejado: number;
  real: number;
}

export interface Registro {
  competencia: string;
  foco: string;
  evidencia: string;
  ajuste: string;
}

export interface Config {
  fonteNome: string;
  fonteLocal: string;
  fonteLinks: Record<string, string>;
  competencias: string[];
  voz: boolean;
  alarme: boolean;
}

const CONFIG_PADRAO: Config = {
  fonteNome: "",
  fonteLocal: "",
  fonteLinks: {},
  competencias: COMPETENCIAS_PADRAO,
  voz: true,
  alarme: true,
};

interface SessaoGuardada {
  config: Config;
  registros: Record<string, Registro>;
}

interface AppCtx {
  pos: Posicao;
  plano: ItemFase[];
  running: boolean;
  overrides: Overrides;
  setOverride: (k: string, v: string | undefined) => void;
  escolher: (p: Partial<Pick<Posicao, "turma" | "faixa" | "aula">>) => void;
  iniciarPausar: () => void;
  ajustar: (delta: number) => void;
  proximaFase: () => void;
  irParaFase: (i: number) => void;
  /** Encerra a aula atual e avança para a próxima data. Não apaga o relatório. */
  encerrarAula: () => void;
  desvios: Desvio[];
  config: Config;
  setConfig: (c: Partial<Config>) => void;
  registros: Record<string, Registro>;
  chaveRegistro: string;
  registro: Registro;
  setRegistro: (r: Partial<Registro>) => void;
  retomada: Posicao | null;
  continuar: () => void;
  /** Fecha o diálogo e fica na página aberta, sem perder a posição salva. */
  ficarAqui: () => void;
  comecarDoZero: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp fora do AppProvider");
  return c;
}

function lerJSON<T>(storage: Storage | undefined, chave: string): T | null {
  try {
    const raw = storage?.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function posicaoValida(p: Posicao | null): p is Posicao {
  return (
    !!p &&
    (p.turma === "criancas" || p.turma === "adultos") &&
    ["6-9", "10-12", "13-15"].includes(p.faixa) &&
    p.aula >= 0 && p.aula < AULAS.length &&
    p.fase >= 0 && p.fase < TURMAS[p.turma].fases.length &&
    Number.isFinite(p.segundos)
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [pos, setPos] = useState<Posicao>(posicaoInicial);
  const [running, setRunning] = useState(false);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [desvios, setDesvios] = useState<Desvio[]>([]);
  const [config, setConfigState] = useState<Config>(CONFIG_PADRAO);
  const [registros, setRegistros] = useState<Record<string, Registro>>({});
  const [retomada, setRetomada] = useState<Posicao | null>(null);
  const [pronto, setPronto] = useState(false);

  const posRef = useRef(pos);
  posRef.current = pos;
  const endAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const elapsedMsRef = useRef(0);
  /** "Ficar nesta página" não pode sobrescrever a posição salva com a inicial. */
  const pularSalvarRef = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;

  const plano = useMemo(() => montarPlano(pos.turma, pos.faixa, pos.aula, overrides), [pos.turma, pos.faixa, pos.aula, overrides]);
  const planoRef = useRef(plano);
  planoRef.current = plano;

  // Abertura: lê a config salva no aparelho (links da fonte inclusos), os
  // registros da sessão, e pergunta se continua de onde parou.
  useEffect(() => {
    const sess = lerJSON<SessaoGuardada>(window.sessionStorage, CHAVE_SESSAO);
    const configSalva = lerJSON<Config>(window.localStorage, CHAVE_CONFIG) ?? sess?.config;
    if (configSalva) {
      setConfigState({ ...CONFIG_PADRAO, ...configSalva });
    }
    if (sess) {
      setRegistros(sess.registros ?? {});
    }
    const salva = lerJSON<Posicao>(window.localStorage, CHAVE_POSICAO);
    const ini = posicaoInicial();
    if (posicaoValida(salva) && (salva.fase !== ini.fase || salva.segundos !== ini.segundos || salva.aula !== ini.aula || salva.turma !== ini.turma || salva.faixa !== ini.faixa)) {
      setRetomada(salva);
    } else {
      setPronto(true);
    }
  }, []);

  // Guarda só a posição.
  useEffect(() => {
    if (!pronto) return;
    if (pularSalvarRef.current) {
      pularSalvarRef.current = false;
      return;
    }
    try {
      window.localStorage.setItem(CHAVE_POSICAO, JSON.stringify({ ...pos, aba: pathname }));
    } catch {
      /* sem armazenamento */
    }
  }, [pos, pathname, pronto]);

  // Guarda a config no aparelho (links da fonte não se perdem ao fechar a aba).
  useEffect(() => {
    if (!pronto) return;
    try {
      window.localStorage.setItem(CHAVE_CONFIG, JSON.stringify(config));
    } catch {
      /* sem armazenamento */
    }
  }, [config, pronto]);

  useEffect(() => {
    if (!pronto) return;
    try {
      window.sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ config, registros } satisfies SessaoGuardada));
    } catch {
      /* sem armazenamento */
    }
  }, [config, registros, pronto]);

  const registrarDesvio = useCallback((faseIdx: number, turma: TurmaId) => {
    const real = Math.round(elapsedMsRef.current / 1000);
    elapsedMsRef.current = 0;
    if (real < 5) return;
    const f = faseAt(turma, faseIdx);
    setDesvios((d) => [...d, { fase: f.nome, planejado: f.minutos * 60, real }]);
  }, []);

  const anunciarAgora = useCallback((faseIdx: number) => {
    const p = posRef.current;
    const f = faseAt(p.turma, faseIdx);
    const jogo = planoRef.current[faseIdx]?.jogo;
    if (configRef.current.voz) falar(`Agora: ${f.nome}${jogo ? `. ${jogo.nome}` : ""}`);
  }, []);

  const avancar = useCallback(
    (auto: boolean) => {
      const p = posRef.current;
      const fases = TURMAS[p.turma].fases;
      registrarDesvio(p.fase, p.turma);
      if (p.fase >= fases.length - 1) {
        setRunning(false);
        setPos({ ...p, segundos: 0 });
        if (configRef.current.alarme) bipe(true);
        if (configRef.current.voz) falar("Fim da aula");
        return;
      }
      const prox = p.fase + 1;
      const segundos = faseAt(p.turma, prox).minutos * 60;
      endAtRef.current = Date.now() + segundos * 1000;
      setPos({ ...p, fase: prox, segundos });
      if (auto && configRef.current.alarme) bipe(true);
      anunciarAgora(prox);
    },
    [registrarDesvio, anunciarAgora],
  );

  // Motor do cronômetro.
  useEffect(() => {
    if (!running) return;
    lastTickRef.current = Date.now();
    endAtRef.current = Date.now() + posRef.current.segundos * 1000;
    const id = window.setInterval(() => {
      const now = Date.now();
      elapsedMsRef.current += now - lastTickRef.current;
      lastTickRef.current = now;
      const rem = Math.max(0, Math.ceil((endAtRef.current - now) / 1000));
      const p = posRef.current;
      if (rem === p.segundos) return;
      const cfg = configRef.current;
      if (rem === 10) {
        const fases = TURMAS[p.turma].fases;
        const prox = fases[p.fase + 1];
        const jogo = planoRef.current[p.fase + 1]?.jogo;
        if (prox && cfg.voz) falar(`Próxima: ${prox.nome}${jogo ? `. ${jogo.nome}` : ""}`);
      }
      if (rem >= 1 && rem <= 5) {
        if (cfg.alarme) bipe();
        if (cfg.voz) falar(String(rem));
      }
      if (rem === 0) {
        avancar(true);
      } else {
        setPos((q) => ({ ...q, segundos: rem }));
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, avancar]);

  const iniciarPausar = useCallback(() => {
    destravarAudio();
    setRunning((r) => {
      if (!r && posRef.current.segundos <= 0) return false;
      return !r;
    });
  }, []);

  const ajustar = useCallback((delta: number) => {
    setPos((p) => {
      const segundos = Math.max(0, Math.min(99 * 60, p.segundos + delta));
      endAtRef.current += (segundos - p.segundos) * 1000;
      return { ...p, segundos };
    });
  }, []);

  const proximaFase = useCallback(() => {
    destravarAudio();
    avancar(false);
  }, [avancar]);

  const encerrarAula = useCallback(() => {
    setRunning(false);
    elapsedMsRef.current = 0;
    setDesvios([]);
    setPos((p) => encerrarPosicao(p));
  }, []);

  const irParaFase = useCallback(
    (i: number) => {
      const p = posRef.current;
      if (i === p.fase) return;
      registrarDesvio(p.fase, p.turma);
      const segundos = faseAt(p.turma, i).minutos * 60;
      endAtRef.current = Date.now() + segundos * 1000;
      setPos({ ...p, fase: i, segundos });
    },
    [registrarDesvio],
  );

  const escolher = useCallback((n: Partial<Pick<Posicao, "turma" | "faixa" | "aula">>) => {
    setRunning(false);
    elapsedMsRef.current = 0;
    setPos((p) => {
      const turma = n.turma ?? p.turma;
      return { ...p, ...n, turma, fase: 0, segundos: faseAt(turma, 0).minutos * 60 };
    });
  }, []);

  const setOverride = useCallback((k: string, v: string | undefined) => {
    setOverrides((o) => {
      const n = { ...o };
      if (v) n[k] = v;
      else delete n[k];
      return n;
    });
  }, []);

  const setConfig = useCallback((c: Partial<Config>) => setConfigState((o) => ({ ...o, ...c })), []);

  const chaveRegistro = `${pos.turma}|${pos.turma === "adultos" ? "-" : pos.faixa}|${pos.aula}`;
  const registro: Registro = registros[chaveRegistro] ?? {
    competencia: "",
    foco: aulaAt(pos.aula).foco,
    evidencia: "",
    ajuste: "",
  };
  const setRegistro = useCallback(
    (r: Partial<Registro>) =>
      setRegistros((all) => {
        const atual = all[chaveRegistro] ?? { competencia: "", foco: aulaAt(posRef.current.aula).foco, evidencia: "", ajuste: "" };
        return { ...all, [chaveRegistro]: { ...atual, ...r } };
      }),
    [chaveRegistro],
  );

  const continuar = useCallback(() => {
    if (!retomada) return;
    const { aba, ...resto } = retomada;
    setPos({ ...resto, aba });
    setRetomada(null);
    setPronto(true);
    const destino = ["/", "/jogos", "/organizar", "/relatorio", "/config", "/rings"].includes(aba) ? aba : "/";
    void navigate({ to: destino as "/" });
  }, [retomada, navigate]);

  const ficarAqui = useCallback(() => {
    // Fica na página que foi aberta pelo link, sem apagar a posição salva:
    // a próxima gravação da posição é pulada uma vez.
    pularSalvarRef.current = true;
    setRetomada(null);
    setPronto(true);
  }, []);

  const comecarDoZero = useCallback(() => {
    try {
      window.localStorage.removeItem(CHAVE_POSICAO);
    } catch {
      /* ok */
    }
    setRunning(false);
    elapsedMsRef.current = 0;
    setDesvios([]);
    setPos(posicaoInicial());
    setRetomada(null);
    setPronto(true);
  }, []);

  const value: AppCtx = {
    pos,
    plano,
    running,
    overrides,
    setOverride,
    escolher,
    iniciarPausar,
    ajustar,
    proximaFase,
    irParaFase,
    encerrarAula,
    desvios,
    config,
    setConfig,
    registros,
    chaveRegistro,
    registro,
    setRegistro,
    retomada,
    continuar,
    ficarAqui,
    comecarDoZero,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Aceita só http(s). Evita qualquer outro esquema em link colado. */
export function linkSeguro(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}
