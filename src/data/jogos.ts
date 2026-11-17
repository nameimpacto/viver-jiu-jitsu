import type { Publico } from "./plano";

export type TipoJogo = "inicial" | "analitico" | "situacional" | "formal" | "especial";

export const TIPOS: Record<TipoJogo, { nome: string; forma: string }> = {
  inicial: { nome: "Inicial", forma: "Círculo" },
  analitico: { nome: "Analítico", forma: "Quadrado" },
  situacional: { nome: "Situacional", forma: "Triângulo" },
  formal: { nome: "Formal", forma: "Octógono" },
  especial: { nome: "Especial", forma: "Estrela" },
};

export const ORDEM_TIPOS: TipoJogo[] = ["inicial", "analitico", "situacional", "formal", "especial"];

export interface Jogo {
  id: string;
  nome: string;
  tipo: TipoJogo;
  /** Degraus que o jogo trabalha. Jogo especial não avança degrau: lista vazia. */
  degraus: number[];
  publico: Publico[];
  objetivo: string;
  regra: string;
  /** Técnica que nasce do jogo (crianças: a técnica vem como consequência). */
  tecnica?: string;
  placar?: boolean;
}

const TODOS: Publico[] = ["kids", "teen", "adult"];

export const JOGOS: Jogo[] = [
  // Inicial — círculo verde
  { id: "i1", tipo: "inicial", nome: "Pega-rabo", degraus: [1], publico: ["kids"], objetivo: "Base e deslocamento", regra: "Pano no short. Pegue o do outro sem cair.", tecnica: "Base e lateralidade" },
  { id: "i2", tipo: "inicial", nome: "Espelho", degraus: [1], publico: TODOS, objetivo: "Lateralidade", regra: "Dupla imita o lado. Professor troca: direita, esquerda.", tecnica: "Base e lateralidade" },
  { id: "i3", tipo: "inicial", nome: "Siga a direção", degraus: [1, 2], publico: ["kids"], objetivo: "Direção", regra: "Professor aponta. Todos rolam para o lado indicado.", tecnica: "Samurai Roll" },
  { id: "i4", tipo: "inicial", nome: "Rolo de lado", degraus: [2], publico: TODOS, objetivo: "Coordenação", regra: "Fila. Rolamento pelo ombro direito, volta pelo esquerdo.", tecnica: "Samurai Roll" },
  { id: "i5", tipo: "inicial", nome: "Mochila", degraus: [3], publico: ["kids"], objetivo: "Chegar nas costas", regra: "Parceiro em quatro apoios. Suba e segure 5 segundos.", tecnica: "Seatbelt" },
  { id: "i6", tipo: "inicial", nome: "Tartaruga e caçador", degraus: [3], publico: TODOS, objetivo: "Tomada de costas", regra: "Tartaruga protege. Caçador tenta chegar nas costas.", tecnica: "Tomada de costas" },
  { id: "i7", tipo: "inicial", nome: "Pega-joelho", degraus: [5], publico: ["teen", "adult"], objetivo: "Postura e entrada", regra: "Em pé. Toque o joelho do outro, proteja o seu.", tecnica: "Preparar a entrada" },
  { id: "i8", tipo: "inicial", nome: "Empurra-base", degraus: [1, 5], publico: TODOS, objetivo: "Base", regra: "Mãos nos ombros. Quem sai do quadrado perde.", tecnica: "Base e lateralidade" },

  // Analítico — quadrado azul
  { id: "a1", tipo: "analitico", nome: "Samurai Roll lado forte", degraus: [2], publico: TODOS, objetivo: "Rolar até as costas", regra: "10 repetições. Termina com mão no peito do parceiro.", tecnica: "Samurai Roll" },
  { id: "a2", tipo: "analitico", nome: "Samurai Roll lado fraco", degraus: [2], publico: TODOS, objetivo: "Lado fraco", regra: "10 repetições pelo lado que menos usa.", tecnica: "Samurai Roll" },
  { id: "a3", tipo: "analitico", nome: "Berimbolo guiado", degraus: [2], publico: ["teen", "adult"], objetivo: "Inverter e chegar", regra: "Parceiro colabora. Inverte e pega as costas.", tecnica: "Berimbolo" },
  { id: "a4", tipo: "analitico", nome: "Seatbelt e ganchos", degraus: [3], publico: TODOS, objetivo: "Fechar as costas", regra: "Seatbelt, primeiro gancho, segundo gancho.", tecnica: "Seatbelt" },
  { id: "a5", tipo: "analitico", nome: "Chair Sit", degraus: [3], publico: ["teen", "adult"], objetivo: "Sentar e pegar", regra: "Da tartaruga, senta atrás e puxa para as costas.", tecnica: "Chair Sit" },
  { id: "a6", tipo: "analitico", nome: "Low Hook", degraus: [3], publico: ["teen", "adult"], objetivo: "Gancho baixo", regra: "Gancho baixo, quadril cola, vira para as costas.", tecnica: "Low Hook" },
  { id: "a7", tipo: "analitico", nome: "Mata-leão em etapas", degraus: [4], publico: TODOS, objetivo: "Finalizar das costas", regra: "Braço no pescoço, mão no bíceps, cabeça cola.", tecnica: "Mata-leão" },
  { id: "a8", tipo: "analitico", nome: "Toreando para Leg Drag", degraus: [5, 6], publico: ["teen", "adult"], objetivo: "Passar para o Leg Drag", regra: "Toreando, perna cruza, quadril de lado.", tecnica: "Leg Drag" },
  { id: "a9", tipo: "analitico", nome: "Quadril de lado", degraus: [6], publico: ["teen", "adult"], objetivo: "Prender o Leg Drag", regra: "Gire o quadril do parceiro. Segure 5 segundos.", tecnica: "Leg Drag" },

  // Situacional — triângulo âmbar
  { id: "s1", tipo: "situacional", nome: "Rola e pega", degraus: [2, 3], publico: ["kids"], objetivo: "Rolar e chegar nas costas", regra: "Sentados frente a frente. Quem chega nas costas pontua.", tecnica: "Samurai Roll", placar: true },
  { id: "s2", tipo: "situacional", nome: "Costas em 30 segundos", degraus: [3], publico: TODOS, objetivo: "Tomada de costas", regra: "30 segundos para pegar as costas. Troca.", tecnica: "Tomada de costas", placar: true },
  { id: "s3", tipo: "situacional", nome: "Defende o pescoço", degraus: [4], publico: TODOS, objetivo: "Mata-leão e defesa", regra: "Começa nas costas. Um ataca, outro defende as mãos.", tecnica: "Mata-leão" },
  { id: "s4", tipo: "situacional", nome: "Decisão: costas ou montada", degraus: [3, 7], publico: ["teen", "adult"], objetivo: "Decidir", regra: "Costas vale 4, montada vale 4. Escolha o caminho livre.", tecnica: "Tomada de costas", placar: true },
  { id: "s5", tipo: "situacional", nome: "Passa e prepara", degraus: [5], publico: ["teen", "adult"], objetivo: "Preparar a entrada", regra: "Passador só pontua se preparar antes de entrar.", tecnica: "Preparar a entrada", placar: true },
  { id: "s6", tipo: "situacional", nome: "Cadeia de Leg Drag", degraus: [6], publico: ["teen", "adult"], objetivo: "Leg Drag até as costas", regra: "Leg Drag 2, costas 4. Pontos somam na cadeia.", tecnica: "Leg Drag", placar: true },
  { id: "s7", tipo: "situacional", nome: "Lado certo", degraus: [1, 2], publico: ["kids"], objetivo: "Lateralidade", regra: "Professor diz o lado. Só vale rolar por ele.", tecnica: "Samurai Roll" },
  { id: "s8", tipo: "situacional", nome: "Tartaruga gira", degraus: [3], publico: ["kids"], objetivo: "Tomada de costas", regra: "Tartaruga gira devagar. Parceiro acompanha e cola.", tecnica: "Tomada de costas" },
  { id: "s9", tipo: "situacional", nome: "Situação aberta", degraus: [7], publico: TODOS, objetivo: "Cadeia completa", regra: "Começa em pé. Cada etapa da cadeia pontua.", tecnica: "Cadeia completa", placar: true },

  // Formal — octógono vermelho
  { id: "f1", tipo: "formal", nome: "Luta com desvantagem", degraus: [3, 6, 7], publico: ["teen", "adult"], objetivo: "Virar o placar", regra: "Um começa perdendo por 4. Tem que buscar.", placar: true },
  { id: "f2", tipo: "formal", nome: "King of the Mat", degraus: [5, 6, 7], publico: ["teen", "adult"], objetivo: "Ficar no tatame", regra: "Quem pontua fica. Próximo entra.", placar: true },
  { id: "f3", tipo: "formal", nome: "Luta de costas", degraus: [3, 4], publico: TODOS, objetivo: "Manter e finalizar", regra: "Começa nas costas. Escapou, troca." },
  { id: "f4", tipo: "formal", nome: "Luta por pontos", degraus: [7], publico: TODOS, objetivo: "Placar oficial", regra: "Placar oficial no Ring.", placar: true },
  { id: "f5", tipo: "formal", nome: "Luta do Samurai", degraus: [1, 2, 3], publico: ["kids"], objetivo: "Rolar e chegar", regra: "Começa sentado. Costas vale ponto.", placar: true },
  { id: "f6", tipo: "formal", nome: "Rola livre", degraus: [7], publico: ["adult"], objetivo: "Aplicar a cadeia", regra: "Luta livre controlada." },

  // Especial — estrela rosa. Marca um momento: não avança degrau, não é avaliação.
  { id: "e1", tipo: "especial", nome: "Pique-tartaruga", degraus: [], publico: ["kids"], objetivo: "Momento lúdico", regra: "Pego vira tartaruga. Outro passa por cima e salva." },
  { id: "e2", tipo: "especial", nome: "Corrente humana", degraus: [], publico: TODOS, objetivo: "Trabalho em equipe", regra: "De mãos dadas, a corrente pega os soltos." },
  { id: "e3", tipo: "especial", nome: "Estátua do tatame", degraus: [], publico: ["kids"], objetivo: "Autocontrole", regra: "Música para, todos em base. Mexeu, faz 5 polichinelos." },
  { id: "e4", tipo: "especial", nome: "Carrinho de mão", degraus: [], publico: ["kids", "teen"], objetivo: "Coordenação", regra: "Dupla atravessa o tatame. Troca na volta." },
  { id: "e5", tipo: "especial", nome: "Cabo de guerra de dupla", degraus: [], publico: TODOS, objetivo: "Força e equipe", regra: "Equipes de mãos dadas puxam até a linha." },
  { id: "e6", tipo: "especial", nome: "Bola de lado", degraus: [], publico: TODOS, objetivo: "Lateralidade", regra: "Passa a bola pela direita. Apito, troca o lado." },
  { id: "e7", tipo: "especial", nome: "Siga o mestre", degraus: [], publico: ["kids"], objetivo: "Atenção", regra: "Todos copiam o líder. Errou, vira líder." },
];

export function jogoPorId(id: string | undefined): Jogo | undefined {
  return JOGOS.find((j) => j.id === id);
}
