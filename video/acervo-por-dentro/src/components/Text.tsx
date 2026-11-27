import React from "react";
import { theme } from "../theme";
import { useVideoConfig } from "remotion";

// Escalas tipográficas: o vídeo horizontal usa a base; o vertical sobe um pouco
export const useScale = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return { vertical, h1: vertical ? 92 : 104, h2: vertical ? 64 : 72, body: vertical ? 40 : 38, chip: vertical ? 34 : 30, pad: vertical ? 72 : 110 };
};

export const H: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties; weight?: number }> = ({ children, size, color = theme.colors.ink, style, weight = 800 }) => (
  <div style={{ fontFamily: theme.fonts.display, fontWeight: weight, fontSize: size, lineHeight: 1.02, letterSpacing: -0.045 * size, color, ...style }}>{children}</div>
);

export const Serif: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = theme.colors.terra }) => (
  <span style={{ fontFamily: theme.fonts.serif, fontStyle: "italic", fontWeight: 400, fontSize: "1.08em", letterSpacing: "-0.01em", color }}>{children}</span>
);

export const Body: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = theme.colors.inkSoft, style }) => (
  <div style={{ fontFamily: theme.fonts.display, fontWeight: 500, fontSize: size, lineHeight: 1.35, color, ...style }}>{children}</div>
);
