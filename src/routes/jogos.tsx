import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { JogoCard } from "@/components/app/JogoCard";
import { TipoIcon } from "@/components/app/TipoIcon";
import { Titulo } from "@/components/app/Titulo";
import { Button } from "@/components/ui/button";
import { JOGOS, ORDEM_TIPOS, TIPOS, type TipoJogo } from "@/data/jogos";
import type { Publico } from "@/data/plano";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos — Tatame Viver" },
      { name: "description", content: "Os 39 jogos do jiu-jítsu em cinco tipos: inicial, analítico, situacional, formal e especial." },
      { property: "og:title", content: "Jogos — Tatame Viver" },
      { property: "og:description", content: "Os 39 jogos do jiu-jítsu em cinco tipos: inicial, analítico, situacional, formal e especial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JogosPage,
});

const PUBLICOS: { id: Publico | "todos"; nome: string }[] = [
  { id: "todos", nome: "Todos" },
  { id: "kids", nome: "6–12" },
  { id: "teen", nome: "13–15" },
  { id: "adult", nome: "Adultos" },
];

function JogosPage() {
  const [tipo, setTipo] = useState<TipoJogo | null>(null);
  const [publico, setPublico] = useState<Publico | "todos">("todos");
  const lista = JOGOS.filter((j) => (!tipo || j.tipo === tipo) && (publico === "todos" || j.publico.includes(publico)));

  return (
    <div>
      <Titulo extra={<span className="font-display text-2xl font-bold font-tabular">{lista.length}</span>}>Jogos</Titulo>
      <div className="grid grid-cols-5 gap-2">
        {ORDEM_TIPOS.map((t) => (
          <button
            key={t}
            onClick={() => setTipo(tipo === t ? null : t)}
            data-on={tipo === t}
            className="tap placa flex flex-col items-center gap-1 py-2 text-[11px] font-bold data-[on=true]:border-ink data-[on=true]:ring-2 data-[on=true]:ring-ink"
          >
            <TipoIcon tipo={t} className="size-8" />
            {TIPOS[t].nome}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {PUBLICOS.map((p) => (
          <Button key={p.id} variant="chip" size="chip" data-on={publico === p.id} className="flex-1 px-2" onClick={() => setPublico(p.id)}>
            {p.nome}
          </Button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {lista.map((j) => (
          <JogoCard key={j.id} jogo={j} compacto />
        ))}
      </div>
    </div>
  );
}
