import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./components/Fonts";
import { Hook, Colecoes, Filtro, Analise, Ferramenta, Semana, Fim } from "./scenes/Scenes";

// Roteiro (30 fps): gancho 2,5s · coleções 5s · filtro 4s · análise 5,5s · ferramenta 5,5s · semana 3s · fim 2,5s
const CENAS: { c: React.FC; d: number }[] = [
  { c: Hook, d: 75 },
  { c: Colecoes, d: 150 },
  { c: Filtro, d: 120 },
  { c: Analise, d: 165 },
  { c: Ferramenta, d: 165 },
  { c: Semana, d: 90 },
  { c: Fim, d: 75 },
];
export const TOTAL_FRAMES = CENAS.reduce((n, s) => n + s.d, 0);

export const PorDentro: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      {CENAS.map(({ c: Cena, d }, i) => {
        const el = <Sequence key={i} from={from} durationInFrames={d}><Cena /></Sequence>;
        from += d;
        return el;
      })}
    </AbsoluteFill>
  );
};
