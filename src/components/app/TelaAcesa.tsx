import { useEffect } from "react";

import { useApp } from "@/lib/app-state";
import { useRings } from "@/lib/rings-state";

/** Mantém a tela acesa enquanto algum cronômetro roda. */
export function TelaAcesa() {
  const { running } = useApp();
  const { algumRodando } = useRings();
  const ativo = running || algumRodando;

  useEffect(() => {
    if (!ativo || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let vivo = true;
    const pedir = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (!vivo) void lock.release();
      } catch {
        /* sem permissão */
      }
    };
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void pedir();
    };
    void pedir();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", aoVoltar);
      void lock?.release();
    };
  }, [ativo]);

  return null;
}
