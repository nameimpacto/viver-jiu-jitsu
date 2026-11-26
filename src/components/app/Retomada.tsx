import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { FAIXAS, TURMAS, aulaAt, faseAt } from "@/data/plano";
import { useApp } from "@/lib/app-state";
import { mmss } from "@/lib/som";

export function Retomada() {
  const { retomada, continuar, ficarAqui, comecarDoZero } = useApp();
  if (!retomada) return null;
  const turma = TURMAS[retomada.turma];
  const faixa = retomada.turma === "criancas" ? ` ${FAIXAS.find((f) => f.id === retomada.faixa)?.nome}` : "";
  return (
    <AlertDialog open>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-3xl">Continuar de onde parou?</AlertDialogTitle>
          <AlertDialogDescription className="text-base font-tabular">
            {turma.nome}
            {faixa} · {aulaAt(retomada.aula).data} · {faseAt(retomada.turma, retomada.fase).nome} · {mmss(retomada.segundos)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogCancel onClick={comecarDoZero} className="h-12">Começar do zero</AlertDialogCancel>
          <AlertDialogCancel onClick={ficarAqui} className="h-12">Ficar nesta página</AlertDialogCancel>
          <AlertDialogAction onClick={continuar} className="h-12 bg-signal text-signal-foreground hover:bg-signal/90">Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
