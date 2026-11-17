import { useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Toque = passo grande. Toque longo = ajuste fino repetido. */
export function BotaoAjuste({
  passo,
  passoFino,
  onAjuste,
  children,
  rotulo,
  className,
}: {
  passo: number;
  passoFino: number;
  onAjuste: (d: number) => void;
  children: ReactNode;
  rotulo: string;
  className?: string;
}) {
  const timer = useRef<number | null>(null);
  const repete = useRef<number | null>(null);
  const longo = useRef(false);

  const parar = () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (repete.current) window.clearInterval(repete.current);
    timer.current = null;
    repete.current = null;
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="tile"
      aria-label={rotulo}
      className={cn("tap font-tabular", className)}
      onPointerDown={() => {
        longo.current = false;
        timer.current = window.setTimeout(() => {
          longo.current = true;
          onAjuste(passoFino);
          repete.current = window.setInterval(() => onAjuste(passoFino), 180);
        }, 450);
      }}
      onPointerUp={parar}
      onPointerLeave={parar}
      onPointerCancel={parar}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        if (longo.current) {
          longo.current = false;
          return;
        }
        onAjuste(passo);
      }}
    >
      {children}
    </Button>
  );
}
