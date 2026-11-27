import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Entrada: opacidade + subida + escala, sempre em mola
export const Entrance: React.FC<{ delay?: number; from?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, from = 40, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  return (
    <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [from, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`, ...style }}>
      {children}
    </div>
  );
};

// Saída da cena: mais rápida que a entrada
export const useExit = (durationInFrames: number) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [0, -42], { easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { transform: `translateY(${y}px)`, opacity: o } as React.CSSProperties;
};

// Respiração de quem fica parado em cena
export const useBreathe = (speed = 22) => {
  const frame = useCurrentFrame();
  return { scale: 1 + Math.sin(frame / speed) * 0.012, float: Math.sin(frame / 30) * 4 };
};

export const WordReveal: React.FC<{ text: string; delay?: number; per?: number; style?: React.CSSProperties; serifFrom?: number; serifColor?: string }> = ({ text, delay = 0, per = 3, style, serifFrom, serifColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.26em", rowGap: 0, ...style }}>
      {words.map((word, i) => {
        const p = spring({ frame: frame - delay - i * per, fps, config: theme.spring.snappy });
        const serif = serifFrom !== undefined && i >= serifFrom;
        return (
          <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`, fontFamily: serif ? theme.fonts.serif : undefined, fontStyle: serif ? "italic" : undefined, fontWeight: serif ? 400 : undefined, color: serif ? serifColor : undefined, fontSize: serif ? "1.08em" : undefined }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Toda imagem parada ganha Ken Burns
export const KenBurns: React.FC<{ src: string; zoomFrom?: number; zoomTo?: number; pan?: number; style?: React.CSSProperties; position?: string }> = ({ src, zoomFrom = 1, zoomTo = 1.08, pan = -24, style, position = "top center" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], { easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, durationInFrames], [0, pan], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `scale(${scale}) translateX(${x}px)`, ...style }} />;
};

// Adesivo da marca: borda branca, sombra dura, leve inclinação
export const Sticker: React.FC<{ children: React.ReactNode; delay?: number; rotate?: number; bg?: string; color?: string; style?: React.CSSProperties; size?: number }> = ({ children, delay = 0, rotate = -4, bg = theme.colors.areia, color = theme.colors.ink, style, size = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.bouncy });
  return (
    <div style={{ display: "inline-block", opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) rotate(${rotate}deg)`, background: bg, color, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: size, letterSpacing: -0.01 * size, padding: `${size * 0.42}px ${size * 0.9}px`, borderRadius: 999, boxShadow: `0 0 0 ${size * 0.13}px ${theme.colors.white}, ${size * 0.18}px ${size * 0.18}px 0 rgba(46,33,27,0.9)`, whiteSpace: "nowrap", ...style }}>
      {children}
    </div>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; delay?: number; active?: boolean; activeAt?: number; size?: number; light?: boolean }> = ({ children, delay = 0, active, activeAt = 0, size = 30, light }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.snappy });
  const on = active ? spring({ frame: frame - activeAt, fps, config: theme.spring.bouncy }) : 0;
  const bg = light ? theme.colors.white : "rgba(255,255,255,0.1)";
  const fg = light ? theme.colors.ink : theme.colors.white;
  return (
    <div style={{ display: "inline-block", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px) scale(${1 + on * 0.06})`, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: size, padding: `${size * 0.5}px ${size * 1}px`, borderRadius: 999, background: on > 0.5 ? theme.colors.terra : bg, color: on > 0.5 ? theme.colors.white : fg, border: `${Math.max(2, size * 0.07)}px solid ${light ? theme.colors.ink : "rgba(255,255,255,0.35)"}`, boxShadow: light ? `${size * 0.12}px ${size * 0.12}px 0 ${theme.colors.areia}` : "none", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

// Moldura de tela (card arredondado com sombra funda)
export const Screen: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; delay?: number; from?: "right" | "bottom" }> = ({ children, style, delay = 0, from = "bottom" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  const { scale, float } = useBreathe(26);
  const tx = from === "right" ? interpolate(p, [0, 1], [120, 0]) : 0;
  const ty = from === "bottom" ? interpolate(p, [0, 1], [90, 0]) : 0;
  return (
    <div style={{ opacity: p, transform: `translate(${tx}px, ${ty + float}px) scale(${interpolate(p, [0, 1], [0.94, 1]) * scale})`, borderRadius: 28, overflow: "hidden", border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 50px 90px -30px rgba(0,0,0,0.6), 14px 14px 0 rgba(212,185,154,0.35)", background: theme.colors.umber, ...style }}>
      {children}
    </div>
  );
};
