import { ExternalLink, Play } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { youtubeUrl, type Video } from "@/data/videos";
import { linkSeguro, useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

/**
 * Regra fixa: link externo é <a target="_blank"> comum.
 * Sem onClick, sem iframe, sem window.open, sem intent.
 */
export function VideoCard({ video }: { video: Video }) {
  const { config } = useApp();
  const nomeFonte = config.fonteNome.trim() || "Fonte";
  const linkFonte = video.fonte ? linkSeguro(config.fonteLinks[video.id]) : undefined;
  const meta = [video.fonte ? nomeFonte : video.autor, video.data, video.duracao].filter(Boolean).join(" · ");

  return (
    <article className="placa p-4">
      <h3 className="text-xl font-bold leading-tight">{video.titulo}</h3>
      {meta && <p className="text-sm text-muted-foreground font-tabular">{meta}</p>}
      {video.ressalva && <p className="mt-1 text-sm font-medium text-destructive">{video.ressalva}</p>}
      {!video.youtubeId && !linkFonte && (
        <p className="mt-2 text-sm font-semibold">
          Vídeo a gravar/buscar — sem vídeo com aprovação pedagógica.
          {config.fonteLocal.trim() && ` · ${nomeFonte}: ${config.fonteLocal.trim()}`}
        </p>
      )}
      {(video.youtubeId || linkFonte) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {video.youtubeId && (
            <a href={youtubeUrl(video.youtubeId)} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "youtube", size: "lg" }), "flex-1 px-4")}>
              <Play /> Abrir no YouTube
            </a>
          )}
          {linkFonte && (
            <a href={linkFonte} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "fonte", size: "lg" }), "flex-1 px-4")}>
              <ExternalLink /> Abrir na fonte
            </a>
          )}
        </div>
      )}
    </article>
  );
}
