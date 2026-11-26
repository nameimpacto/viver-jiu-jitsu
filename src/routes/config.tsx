import { createFileRoute } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Secao, Titulo } from "@/components/app/Titulo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { VIDEOS } from "@/data/videos";
import { linkSeguro, useApp } from "@/lib/app-state";

export const Route = createFileRoute("/config")({
  head: () => ({
    meta: [
      { title: "Config — Tatame Viver" },
      { name: "description", content: "Nome e local da fonte, links salvos no aparelho, competências, voz e alarme." },
      { property: "og:title", content: "Config — Tatame Viver" },
      { property: "og:description", content: "Nome e local da fonte, links salvos no aparelho, competências, voz e alarme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  const { config, setConfig, comecarDoZero } = useApp();
  const [nova, setNova] = useState("");
  const daFonte = VIDEOS.filter((v) => v.fonte);

  return (
    <div>
      <Titulo>Config</Titulo>

      <Secao titulo="Fonte">
        <div className="placa space-y-3 p-4">
          <Campo rotulo="Nome">
            <Input value={config.fonteNome} onChange={(e) => setConfig({ fonteNome: e.target.value })} placeholder="Fonte" />
          </Campo>
          <Campo rotulo="Local">
            <Input value={config.fonteLocal} onChange={(e) => setConfig({ fonteLocal: e.target.value })} />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Links da fonte · salvos neste aparelho">
        <div className="placa divide-y divide-border">
          {daFonte.map((v) => {
            const valor = config.fonteLinks[v.id] ?? "";
            const invalido = valor.trim() !== "" && !linkSeguro(valor);
            return (
              <label key={v.id} className="block px-4 py-3">
                <span className="text-sm font-semibold">{v.titulo}</span>
                <Input
                  type="url"
                  inputMode="url"
                  value={valor}
                  aria-invalid={invalido}
                  onChange={(e) => setConfig({ fonteLinks: { ...config.fonteLinks, [v.id]: e.target.value } })}
                  placeholder="https://"
                  className="mt-1 aria-[invalid=true]:border-destructive"
                />
              </label>
            );
          })}
        </div>
      </Secao>

      <Secao titulo="Competências">
        <div className="flex flex-wrap gap-2">
          {config.competencias.map((c) => (
            <span key={c} className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card pl-4 pr-1 text-sm font-semibold">
              {c}
              <button aria-label={`Remover ${c}`} className="tap rounded-full p-2" onClick={() => setConfig({ competencias: config.competencias.filter((x) => x !== c) })}>
                <X className="size-4" />
              </button>
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const t = nova.trim();
            if (t && !config.competencias.includes(t)) setConfig({ competencias: [...config.competencias, t] });
            setNova("");
          }}
        >
          <Input value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Nova competência" className="h-12" />
          <Button type="submit" size="tile" variant="signal" className="h-12 w-12" aria-label="Adicionar"><Plus /></Button>
        </form>
      </Secao>

      <Secao titulo="Cronômetro">
        <div className="placa divide-y divide-border">
          <Chave rotulo="Voz" valor={config.voz} onChange={(v) => setConfig({ voz: v })} />
          <Chave rotulo="Alarme" valor={config.alarme} onChange={(v) => setConfig({ alarme: v })} />
        </div>
      </Secao>

      <Secao titulo="Aula">
        <Button variant="outline" size="xl" className="w-full" onClick={comecarDoZero}>Começar do zero</Button>
      </Secao>
    </div>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold uppercase">{rotulo}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Chave({ rotulo, valor, onChange }: { rotulo: string; valor: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between px-4 py-4">
      <span className="text-lg font-semibold">{rotulo}</span>
      <Switch checked={valor} onCheckedChange={onChange} />
    </label>
  );
}
