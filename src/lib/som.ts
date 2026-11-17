// Alarme e voz. Só no navegador; tudo protegido para não quebrar sem suporte.
let ctx: AudioContext | null = null;

export function destravarAudio() {
  if (typeof window === "undefined") return;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx?.state === "suspended") void ctx.resume();
  } catch {
    /* sem áudio */
  }
}

export function bipe(longo = false) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = longo ? 660 : 880;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const dur = longo ? 0.9 : 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch {
    /* sem áudio */
  }
}

export function falar(texto: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  } catch {
    /* sem voz */
  }
}

export function mmss(seg: number): string {
  const s = Math.max(0, Math.round(Math.abs(seg)));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function desvioTxt(seg: number): string {
  if (Math.round(seg) === 0) return "0:00";
  return `${seg > 0 ? "+" : "−"}${mmss(seg)}`;
}
