import type { TipoJogo } from "@/data/jogos";
import { cn } from "@/lib/utils";

const COR: Record<TipoJogo, string> = {
  inicial: "fill-tipo-inicial",
  analitico: "fill-tipo-analitico",
  situacional: "fill-tipo-situacional",
  formal: "fill-tipo-formal",
  especial: "fill-tipo-especial",
};

export function TipoIcon({ tipo, className }: { tipo: TipoJogo; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6 shrink-0", COR[tipo], className)}>
      {tipo === "inicial" && <circle cx="12" cy="12" r="10" />}
      {tipo === "analitico" && <rect x="2.5" y="2.5" width="19" height="19" rx="2" />}
      {tipo === "situacional" && <path d="M12 2.5 22 21H2z" strokeLinejoin="round" />}
      {tipo === "formal" && <path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" />}
      {tipo === "especial" && <path d="m12 1.8 3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5L7 14.3l-5.3-5 7.2-.9z" />}
    </svg>
  );
}
