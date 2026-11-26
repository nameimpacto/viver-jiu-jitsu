import type { Publico, FaixaId, TurmaId } from "./plano";

/**
 * Vídeos. Regra: só IDs verificados pelo professor. Nenhum ID inventado.
 * `fonte: true` = título da Fonte (nome editável na Config). Sem `youtubeId` = só a referência da Fonte.
 */
export type AprovacaoVideo = "cadastrado" | "pendente" | "aprovado" | "rejeitado";

/**
 * Aprovação pedagógica do vídeo, decidida pelo professor.
 * Sem `aprovacao` = "pendente": o vídeo existe no inventário, mas não entra
 * na aula. Nenhum vídeo é aprovado por código — só o professor aprova.
 */
export interface Video {
  id: string;
  titulo: string;
  fonte: boolean;
  autor?: string;
  data?: string;
  duracao?: string;
  youtubeId?: string;
  ressalva?: string;
  aprovacao?: AprovacaoVideo;
}

export function aprovacaoDe(video: Video): AprovacaoVideo {
  return video.aprovacao ?? "pendente";
}

export function videoAprovado(video: Video): boolean {
  return aprovacaoDe(video) === "aprovado";
}

/** Só vídeos aprovados entram na aula. Sem aprovação, o console fica sem vídeo. */
export function somenteAprovados(videos: Video[]): Video[] {
  return videos.filter(videoAprovado);
}

export const VIDEOS: Video[] = [
  { id: "hips", titulo: "Turn Their Hips to the Side", fonte: true, data: "25/05", duracao: "1:30", youtubeId: "dUnQurAT6XE" },
  { id: "balled", titulo: "Creating a Balled Up Posture", fonte: true, data: "25/05", duracao: "1:29", youtubeId: "yThocKL8Iak" },
  { id: "entry", titulo: "The Need to Set Up Your Entry", fonte: true, data: "25/05", duracao: "0:55", youtubeId: "iOrp05xwWus" },
  { id: "toreando", titulo: "02 Toreando to Leg Drag", fonte: true, data: "27/05", duracao: "7:56", youtubeId: "1l5WTjjtrF4" },
  { id: "hq", titulo: "03 Headquarters to Leg Drag", fonte: true, data: "27/05", duracao: "7:18", youtubeId: "RZ9cDa-7s1o" },
  { id: "cgrip", titulo: "01 C-Grip Leg Drag", fonte: true, data: "25/05", duracao: "5:17", youtubeId: "SN6BECP65BE", ressalva: "Leg Drag completo; a pegada C não está no título." },
  { id: "throwby", titulo: "04 Throw-By", fonte: true, data: "27/05", duracao: "6:45", youtubeId: "_cKr7TKwI3M" },
  { id: "kneecut", titulo: "08 Knee Cut to Leg Drag", fonte: true, data: "27/05", duracao: "5:12", youtubeId: "xtG30HgfhiM" },
  { id: "dblankle", titulo: "Double Ankle Stack to Leg Drag", fonte: true, data: "27/05", duracao: "5:55", youtubeId: "oyK_nzc_SSU", ressalva: "Pegada diferente da variante double ankle." },
  { id: "5050", titulo: "50/50 Entry", fonte: true, data: "27/05", duracao: "7:38", youtubeId: "ogefeZ72vlk" },
  { id: "ashi", titulo: "Outside Ashi", fonte: true, data: "27/05", duracao: "10:29", youtubeId: "XLE_9QwSnnw" },
  { id: "crabgi", titulo: "Crab Ride Gi", fonte: true, data: "27/05", duracao: "8:31", youtubeId: "lZ_yaF30Q04" },
  { id: "crabnogi", titulo: "Crab Ride No Gi", fonte: true, data: "27/05", duracao: "5:50", youtubeId: "2JD6AsOdRxQ" },
  { id: "finishing", titulo: "Finishing", fonte: true, data: "27/05", duracao: "13:58", youtubeId: "9CkRlTtnYOk", ressalva: "Finalização contra a defesa." },
  { id: "turtle", titulo: "Turtle and Leg Entries to Leg Drag", fonte: true },
  { id: "cgripsides", titulo: "07 C-Grip Changing Sides", fonte: true },
  { id: "tireflip", titulo: "Tire Flip", fonte: true },
  { id: "northsouth", titulo: "North South to Leg Drag", fonte: true },
  { id: "samurai-almiro", titulo: "Samurai Roll", autor: "Almiro Barros", fonte: false, youtubeId: "m5mW745Zt98" },
  { id: "samurai-samuel", titulo: "Samurai Roll", autor: "Samuel Braga", fonte: false, youtubeId: "zjhWL5Sqd9k" },
  { id: "chairsit", titulo: "Chair Sit", fonte: false, youtubeId: "i4TXQkbjlcQ" },
  { id: "lowhook", titulo: "Low Hook", fonte: false, youtubeId: "UpAR7ArE-vI" },
  { id: "seatbelt", titulo: "Seatbelt", fonte: false, youtubeId: "z9GwS9IgDWk" },
  { id: "rnc", titulo: "Mata-leão", autor: "Kesting e Yip", fonte: false, youtubeId: "KH6qCjgLXJA" },
  // Aprovados pelo professor em 26/11 para a aula de 26/11 (degrau 7, avaliação):
  // Caio Terra para 13–15; Chloe para 6–9 e 10–12.
  { id: "caio-legdrag-costas", titulo: "Leg Drag até as costas — Caio Terra", autor: "Caio Terra", fonte: false, youtubeId: "_VtvkxzfyXE", aprovacao: "aprovado" },
  { id: "chloe-costas", titulo: "Pegar as costas — Chloe", autor: "Chloe", fonte: true, aprovacao: "aprovado" },
];

export const VIDEOS_POR_GRUPO: Record<"6-9" | "10-12" | "13-15" | "adultos", string[]> = {
  "6-9": ["hips", "balled", "chloe-costas"],
  "10-12": ["samurai-almiro", "samurai-samuel", "chloe-costas"],
  "13-15": ["chairsit", "lowhook", "seatbelt", "caio-legdrag-costas"],
  adultos: [
    "hips", "balled", "samurai-almiro", "samurai-samuel", "chairsit", "lowhook", "seatbelt", "rnc",
    "entry", "cgrip", "toreando", "hq", "throwby", "kneecut", "dblankle", "turtle", "northsouth",
    "cgripsides", "tireflip", "5050", "ashi", "crabgi", "crabnogi", "finishing",
    "caio-legdrag-costas", "chloe-costas",
  ],
};

export function videosDoGrupoDe(lista: Video[], turma: TurmaId, faixa: FaixaId): Video[] {
  const key = turma === "adultos" ? "adultos" : faixa;
  return VIDEOS_POR_GRUPO[key].map((id) => lista.find((v) => v.id === id)!).filter(Boolean);
}

export function videosDoGrupo(turma: TurmaId, faixa: FaixaId): Video[] {
  return videosDoGrupoDe(somenteAprovados(VIDEOS), turma, faixa);
}

/**
 * Vídeo da aula: precisa casar as DUAS coisas — a faixa etária E o objetivo
 * (degrau) da aula que está na tela. A regra antiga escolhia só pela faixa:
 * a faixa 10–12 recebia Samurai Roll (degrau 2) em todas as aulas, inclusive
 * na de 17/11 (degrau 3 — costas com seatbelt), e a faixa 6–9 recebia
 * "Turn Their Hips" e "Balled Up" (degrau 1) em todas as aulas. Agora o
 * vídeo é filtrado pelo degrau da aula E pela faixa. Sem vídeo verificado
 * para faixa + objetivo, nada entra no lugar errado: a tela avisa
 * "vídeo a gravar/buscar". Adultos usam o inventário próprio da turma,
 * mas também filtrado pelo degrau da aula — sem aprovação, nada entra.
 * Só vídeos com aprovacao "aprovado" entram; os demais ficam pendentes
 * até o professor decidir, e a aula funciona sem vídeo.
 */
export const VIDEO_DEGRAUS: Record<string, number[]> = {
  hips: [1],
  balled: [1, 2],
  entry: [5],
  toreando: [5, 6],
  hq: [5, 6],
  cgrip: [6, 7],
  throwby: [5],
  kneecut: [5, 6],
  dblankle: [6],
  "5050": [7],
  ashi: [7],
  crabgi: [6],
  crabnogi: [6],
  finishing: [6, 7],
  turtle: [3],
  cgripsides: [6],
  tireflip: [6],
  northsouth: [6],
  "samurai-almiro": [2],
  "samurai-samuel": [2],
  chairsit: [3],
  lowhook: [3],
  seatbelt: [3, 4],
  rnc: [4],
  "caio-legdrag-costas": [6, 7],
  "chloe-costas": [3, 7],
};

export const VIDEO_FAIXAS: Record<string, ("6-9" | "10-12" | "13-15")[]> = {
  hips: ["6-9", "10-12", "13-15"],
  balled: ["6-9", "10-12", "13-15"],
  entry: ["13-15"],
  toreando: ["13-15"],
  hq: ["13-15"],
  cgrip: ["13-15"],
  throwby: ["13-15"],
  kneecut: ["13-15"],
  dblankle: ["13-15"],
  "5050": ["13-15"],
  ashi: ["13-15"],
  crabgi: ["13-15"],
  crabnogi: ["13-15"],
  finishing: ["13-15"],
  turtle: ["6-9", "10-12", "13-15"],
  cgripsides: ["13-15"],
  tireflip: ["13-15"],
  northsouth: ["13-15"],
  "samurai-almiro": ["10-12", "13-15"],
  "samurai-samuel": ["10-12", "13-15"],
  chairsit: ["10-12", "13-15"],
  lowhook: ["10-12", "13-15"],
  seatbelt: ["10-12", "13-15"],
  rnc: ["13-15"],
  "caio-legdrag-costas": ["13-15"],
  "chloe-costas": ["6-9", "10-12"],
};

export function videosDaAulaDe(lista: Video[], turma: TurmaId, faixa: FaixaId, degrau: number): Video[] {
  if (turma === "adultos") {
    return videosDoGrupoDe(lista, turma, faixa).filter((v) => VIDEO_DEGRAUS[v.id]?.includes(degrau));
  }
  return lista.filter((v) => {
    const degraus = VIDEO_DEGRAUS[v.id];
    const faixas = VIDEO_FAIXAS[v.id];
    return !!degraus && degraus.includes(degrau) && !!faixas && faixas.includes(faixa);
  });
}

export function videosDaAula(turma: TurmaId, faixa: FaixaId, degrau: number): Video[] {
  return videosDaAulaDe(somenteAprovados(VIDEOS), turma, faixa, degrau);
}

export function youtubeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export type { Publico };
