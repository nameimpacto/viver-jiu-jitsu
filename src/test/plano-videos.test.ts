import { describe, expect, it } from "vitest";

import { AULAS, DURACAO_AULA_MIN, TURMAS } from "@/data/plano";
import {
  VIDEOS,
  VIDEOS_POR_GRUPO,
  aprovacaoDe,
  somenteAprovados,
  videosDaAula,
  videosDaAulaDe,
  videosDoGrupo,
  videosDoGrupoDe,
  type Video,
} from "@/data/videos";

/** Inventário com todos os vídeos aprovados — só para testar a regra de filtro. */
const APROVADOS: Video[] = VIDEOS.map((v) => ({ ...v, aprovacao: "aprovado" as const }));

describe("planejamento de novembro", () => {
  it("mantém a grade de cada turma dentro dos 45 minutos", () => {
    for (const turma of Object.values(TURMAS)) {
      expect(turma.fases.reduce((total, fase) => total + fase.minutos, 0)).toBeLessThanOrEqual(
        DURACAO_AULA_MIN,
      );
    }
  });

  it("documenta a consolidação dos degraus 5, 6 e 7 sem criar uma aula própria para o 6", () => {
    const aula24 = AULAS.find((aula) => aula.data === "24/11");
    const aula26 = AULAS.find((aula) => aula.data === "26/11");

    expect(aula24?.observacao).toContain("sem tema novo");
    expect(aula24?.observacao).toContain("não tem aula própria");
    expect(aula26?.observacao).toContain("5 → 6 → 7");
    expect(aula26?.observacao).toContain("sem tema novo");
  });
});

describe("biblioteca de vídeos", () => {
  it("só mostra vídeos que correspondem à faixa e ao degrau, quando aprovados", () => {
    const videos1012 = videosDaAulaDe(APROVADOS, "criancas", "10-12", 2);
    expect(videos1012.filter((video) => video.titulo === "Samurai Roll")).toHaveLength(2);
    expect(
      videos1012.every((video) =>
        ["Samurai Roll", "Creating a Balled Up Posture"].includes(video.titulo),
      ),
    ).toBe(true);
    expect(videosDaAulaDe(APROVADOS, "criancas", "6-9", 2).map((video) => video.id)).toEqual(["balled"]);
  });

  it("mantém os IDs da direção adulta dentro do inventário cadastrado", () => {
    const idsCadastrados = new Set(VIDEOS.map((video) => video.id));
    const idsDeGrupos = Object.values(VIDEOS_POR_GRUPO).flat();

    expect(idsDeGrupos.every((id) => idsCadastrados.has(id))).toBe(true);
    expect(new Set(videosDoGrupoDe(VIDEOS, "adultos", "6-9").map((video) => video.id))).toEqual(
      new Set(VIDEOS.map((video) => video.id)),
    );
  });

  it("só os dois vídeos aprovados pelo professor em 26/11 entram na aula — e a aula fica sem vídeo fora deles", () => {
    // Aprovados em 26/11 para a aula de 26/11 (degrau 7): Caio Terra para 13–15, Chloe para 6–9 e 10–12.
    // Todo o resto do inventário segue "pendente".
    expect(somenteAprovados(VIDEOS).map((v) => v.id).sort()).toEqual([
      "caio-legdrag-costas",
      "chloe-costas",
    ]);
    expect(videosDaAula("criancas", "6-9", 7).map((v) => v.id)).toEqual(["chloe-costas"]);
    expect(videosDaAula("criancas", "10-12", 7).map((v) => v.id)).toEqual(["chloe-costas"]);
    expect(videosDaAula("criancas", "13-15", 7).map((v) => v.id)).toEqual(["caio-legdrag-costas"]);
    expect(videosDaAula("criancas", "10-12", 2)).toEqual([]);
    expect(videosDaAula("criancas", "13-15", 6).map((v) => v.id)).toEqual(["caio-legdrag-costas"]);
    expect(videosDaAula("adultos", "6-9", 6).map((v) => v.id)).toEqual(["caio-legdrag-costas"]);
    expect(videosDoGrupo("adultos", "6-9").map((v) => v.id)).toEqual([
      "caio-legdrag-costas",
      "chloe-costas",
    ]);
  });

  it("adultos também passam pelo filtro do degrau da aula", () => {
    // Degrau 6, Leg Drag: fora ficam os vídeos de degrau 1 e 2 (base, Samurai Roll).
    const adultos6 = videosDaAulaDe(APROVADOS, "adultos", "6-9", 6).map((v) => v.id);
    expect(adultos6).toContain("cgrip");
    expect(adultos6).toContain("toreando");
    expect(adultos6).not.toContain("hips");
    expect(adultos6).not.toContain("samurai-almiro");
    expect(adultos6).not.toContain("seatbelt");
    // Degrau 3: só o que é de costas/seatbelt.
    const adultos3 = videosDaAulaDe(APROVADOS, "adultos", "6-9", 3).map((v) => v.id);
    expect(adultos3).toContain("seatbelt");
    expect(adultos3).not.toContain("cgrip");
  });

  it("vídeo rejeitado também não entra, mesmo com degrau e faixa certos", () => {
    const lista = APROVADOS.map((v) => (v.id === "samurai-almiro" ? { ...v, aprovacao: "rejeitado" as const } : v));
    expect(videosDaAulaDe(somenteAprovados(lista), "criancas", "10-12", 2).map((v) => v.id)).toEqual([
      "balled",
      "samurai-samuel",
    ]);
  });
});
