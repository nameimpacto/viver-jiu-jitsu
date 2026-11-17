import type { ReactNode } from "react";

export function Titulo({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 pt-5 pb-3">
      <h1 className="text-4xl font-extrabold uppercase leading-none">{children}</h1>
      {extra}
    </header>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-6 space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{titulo}</h2>
      {children}
    </section>
  );
}
