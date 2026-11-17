import { Link } from "@tanstack/react-router";
import { CalendarDays, FileText, Settings, Shapes, Timer, Trophy } from "lucide-react";

const ABAS = [
  { to: "/", rotulo: "Aula", Icone: Timer },
  { to: "/jogos", rotulo: "Jogos", Icone: Shapes },
  { to: "/organizar", rotulo: "Organizar", Icone: CalendarDays },
  { to: "/relatorio", rotulo: "Relatório", Icone: FileText },
  { to: "/config", rotulo: "Config", Icone: Settings },
  { to: "/rings", rotulo: "Rings", Icone: Trophy },
] as const;

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {ABAS.map(({ to, rotulo, Icone }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="tap flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground data-[status=active]:text-foreground"
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "rounded-full bg-signal px-3 py-1" : "px-3 py-1"}>
                    <Icone className="size-5" />
                  </span>
                  {rotulo}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
