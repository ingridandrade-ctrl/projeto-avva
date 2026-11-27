import { Easing } from "remotion";

// Uma fonte só de verdade pra cor, easing e mola. Nada inline nas cenas.
export const theme = {
  colors: {
    cream: "#F7F4F0",
    ink: "#2E211B",
    inkSoft: "rgba(46, 33, 27, 0.72)",
    terra: "#965E41",
    teal: "#0C4747",
    tealInk: "#083232",
    umber: "#2A1D17",
    areia: "#D4B99A",
    areiaClara: "#E4D3BC",
    white: "#FFFFFF",
    glow: "rgba(150, 94, 65, 0.35)",
  },
  fonts: {
    display: "Outfit",
    serif: "Instrument Serif",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
} as const;
