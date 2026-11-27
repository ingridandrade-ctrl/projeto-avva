import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Fundo com duas manchas que respiram (nunca um chapado)
export const BgMesh: React.FC<{ base: string; a: string; b: string }> = ({ base, a, b }) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 50;
  const d2 = Math.cos(frame / 70) * 40;
  return (
    <AbsoluteFill style={{ background: base }}>
      <div style={{ position: "absolute", width: 1400, height: 1400, borderRadius: "50%", top: -600, left: -400 + d1, filter: "blur(60px)", background: `radial-gradient(circle, ${a}, transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", bottom: -500, right: -300 - d2, filter: "blur(80px)", background: `radial-gradient(circle, ${b}, transparent 65%)` }} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(212,185,154,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(212,185,154,0.07) 1px, transparent 1px)`, backgroundSize: "56px 56px", opacity: 0.8 }} />
    </AbsoluteFill>
  );
};

export const Grade: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.terra, mixBlendMode: "soft-light", opacity: dark ? 0.2 : 0.1 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.08), transparent 28%, transparent 72%, rgba(0,0,0,0.16))" }} />
  </AbsoluteFill>
);

export const Grain: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: noise, backgroundSize: "220px", backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`, opacity: 0.05, mixBlendMode: dark ? "overlay" : "multiply" }} />;
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.2) 100%)" }} />
);

// Pilha de cinco camadas: fundo, conteúdo, (gráficos vêm no conteúdo), grade, grão + vinheta
export const Stage: React.FC<{ dark?: boolean; base: string; a: string; b: string; children: React.ReactNode }> = ({ dark, base, a, b, children }) => (
  <AbsoluteFill>
    <BgMesh base={base} a={a} b={b} />
    <AbsoluteFill>{children}</AbsoluteFill>
    <Grade dark={dark} />
    <Grain dark={dark} />
    <Vignette />
  </AbsoluteFill>
);
