import React from "react";
import { Composition } from "remotion";
import { PorDentro, TOTAL_FRAMES } from "./PorDentro";

export const Root: React.FC = () => (
  <>
    <Composition id="PorDentro" component={PorDentro} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PorDentroVertical" component={PorDentro} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
