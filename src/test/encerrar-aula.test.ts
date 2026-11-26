import { describe, expect, it } from "vitest";

import { AULAS, faseAt } from "@/data/plano";
import { encerrarPosicao, posicaoInicial, type Posicao } from "@/lib/app-state";

function posicao(aula: number, turma: Posicao["turma"] = "criancas"): Posicao {
  return { ...posicaoInicial(), turma, aula, fase: 5, segundos: 0 };
}

describe("encerrar aula", () => {
  it("avança da aula de 17/11 para a de 19/11, na fase inicial", () => {
    const antes = posicao(4);
    expect(AULAS[antes.aula]?.data).toBe("17/11");
    const depois = encerrarPosicao(antes);
    expect(depois.aula).toBe(5);
    expect(AULAS[depois.aula]?.data).toBe("19/11");
    expect(depois.fase).toBe(0);
    expect(depois.segundos).toBe(faseAt("criancas", 0).minutos * 60);
  });

  it("avança da aula de 19/11 para a de 24/11 (degrau 6)", () => {
    const depois = encerrarPosicao(posicao(5));
    expect(depois.aula).toBe(6);
    expect(AULAS[depois.aula]?.data).toBe("24/11");
    expect(depois.fase).toBe(0);
  });

  it("na última aula (26/11) recomeça a mesma aula da fase inicial", () => {
    const antes = posicao(7);
    expect(AULAS[antes.aula]?.data).toBe("26/11");
    const depois = encerrarPosicao(antes);
    expect(depois.aula).toBe(7);
    expect(depois.fase).toBe(0);
    expect(depois.segundos).toBe(faseAt("criancas", 0).minutos * 60);
  });

  it("respeita a duração da primeira fase dos adultos", () => {
    const depois = encerrarPosicao(posicao(0, "adultos"));
    expect(depois.aula).toBe(1);
    expect(depois.segundos).toBe(faseAt("adultos", 0).minutos * 60);
  });
});
