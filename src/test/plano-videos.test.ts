import { describe, expect, it } from "vitest";

import { AULAS, DURACAO_AULA_MIN, TURMAS } from "@/data/plano";
import { VIDEOS, VIDEOS_POR_GRUPO, videosDaAula, videosDoGrupo } from "@/data/videos";

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
  it("só mostra vídeos que correspondem à faixa e ao degrau", () => {
    const videos1012 = videosDaAula("criancas", "10-12", 2);
    expect(videos1012.filter((video) => video.titulo === "Samurai Roll")).toHaveLength(2);
    expect(
      videos1012.every((video) =>
        ["Samurai Roll", "Creating a Balled Up Posture"].includes(video.titulo),
      ),
    ).toBe(true);
    expect(videosDaAula("criancas", "6-9", 2).map((video) => video.id)).toEqual(["balled"]);
  });

  it("mantém os IDs da direção adulta dentro do inventário cadastrado", () => {
    const idsCadastrados = new Set(VIDEOS.map((video) => video.id));
    const idsDeGrupos = Object.values(VIDEOS_POR_GRUPO).flat();

    expect(idsDeGrupos.every((id) => idsCadastrados.has(id))).toBe(true);
    expect(new Set(videosDoGrupo("adultos", "6-9").map((video) => video.id))).toEqual(
      new Set(VIDEOS.map((video) => video.id)),
    );
  });
});
