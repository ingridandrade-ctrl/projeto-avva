import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Stage } from "../components/Layers";
import { Entrance, useExit, WordReveal, KenBurns, Sticker, Chip, Screen, useBreathe } from "../components/Motion";
import { H, Serif, Body, useScale } from "../components/Text";

const C = theme.colors;
const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...style }}>{children}</AbsoluteFill>
);

// ── 1. Gancho: logo + "Veja o acervo por dentro."
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = useScale();
  const exit = useExit(durationInFrames);
  const logo = spring({ frame, fps, config: theme.spring.bouncy });
  const { float } = useBreathe();
  return (
    <Stage base={C.cream} a="rgba(212,185,154,0.55)" b="rgba(150,94,65,0.28)">
      <Center style={{ ...exit, padding: s.pad }}>
        <div>
          <Img src={staticFile("logo.webp")} style={{ width: s.vertical ? 420 : 360, opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])}) translateY(${float}px)`, margin: "0 auto", display: "block" }} />
          <div style={{ height: s.vertical ? 48 : 36 }} />
          <H size={s.h1}>
            <WordReveal text="Veja o acervo por dentro." delay={10} serifFrom={3} serifColor={C.terra} />
          </H>
        </div>
      </Center>
    </Stage>
  );
};

// ── 2. Coleções: tela real + chips com os 6 objetivos
const OBJETIVOS = ["Atrair seguidores", "Captar leads", "Mostrar que você entende", "Provar que funciona", 'Quebrar o "mas..."', "Vender agora"];
export const Colecoes: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const s = useScale();
  const exit = useExit(durationInFrames);
  return (
    <Stage dark base={C.tealInk} a="rgba(26,104,104,0.55)" b="rgba(150,94,65,0.35)">
      <AbsoluteFill style={{ ...exit, padding: s.pad, display: "flex", flexDirection: s.vertical ? "column" : "row", alignItems: "center", justifyContent: "center", gap: s.vertical ? 56 : 70 }}>
        <div style={{ flex: s.vertical ? "0 0 auto" : "0 0 46%", width: s.vertical ? "100%" : undefined }}>
          <Entrance>
            <Sticker delay={6} bg={C.terra} color={C.white} size={s.chip}>6 coleções por objetivo</Sticker>
          </Entrance>
          <div style={{ height: 22 }} />
          <H size={s.h2} color={C.white}>
            <WordReveal text="Você entra pela porta que precisa hoje." delay={8} style={{ justifyContent: "flex-start" }} serifFrom={5} serifColor={C.areia} />
          </H>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
            {OBJETIVOS.map((o, i) => <Chip key={o} delay={26 + i * 4} size={s.chip * 0.8}>{o}</Chip>)}
          </div>
        </div>
        <Screen delay={4} from="right" style={{ flex: s.vertical ? "0 0 auto" : 1, width: "100%", aspectRatio: "1400 / 742" }}>
          <KenBurns src="tela-acervo.webp" zoomFrom={1.0} zoomTo={1.06} pan={-16} />
        </Screen>
      </AbsoluteFill>
    </Stage>
  );
};

// ── 3. Filtro por tipo de negócio
const NICHOS = ["Negócio local", "Prestação de serviço", "Infoproduto", "E-commerce"];
export const Filtro: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const s = useScale();
  const exit = useExit(durationInFrames);
  const sub = spring({ frame: frame - 62, fps, config: theme.spring.smooth });
  return (
    <Stage base={C.cream} a="rgba(212,185,154,0.5)" b="rgba(12,71,71,0.18)">
      <Center style={{ ...exit, padding: s.pad }}>
        <div style={{ maxWidth: s.vertical ? 900 : 1300 }}>
          <H size={s.h1}>
            <WordReveal text="Você filtra pelo seu tipo de negócio." delay={4} serifFrom={4} serifColor={C.terra} />
          </H>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 48 }}>
            {NICHOS.map((n, i) => <Chip key={n} light delay={20 + i * 5} active={i === 1} activeAt={52} size={s.chip * 1.1}>{n}</Chip>)}
          </div>
          <Body size={s.body} style={{ marginTop: 40, opacity: sub, transform: `translateY(${interpolate(sub, [0, 1], [20, 0])}px)` }}>
            A estrutura é a mesma, e o exemplo é do seu mundo.
          </Body>
        </div>
      </Center>
    </Stage>
  );
};

// ── 4. Análise: anúncio aberto com o "por que funciona"
export const Analise: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const s = useScale();
  const exit = useExit(durationInFrames);
  return (
    <Stage dark base={C.umber} a="rgba(150,94,65,0.5)" b="rgba(212,185,154,0.25)">
      <AbsoluteFill style={{ ...exit, padding: s.pad, display: "flex", flexDirection: s.vertical ? "column" : "row-reverse", alignItems: "center", justifyContent: "center", gap: s.vertical ? 56 : 70 }}>
        <div style={{ flex: s.vertical ? "0 0 auto" : "0 0 40%", width: s.vertical ? "100%" : undefined }}>
          <H size={s.h2} color={C.white}>
            <WordReveal text="Cada anúncio vem com a análise do porquê." delay={6} style={{ justifyContent: "flex-start" }} serifFrom={6} serifColor={C.areia} />
          </H>
          <Body size={s.body} color="rgba(255,255,255,0.78)" style={{ marginTop: 26 }}>
            <Entrance delay={40}>Em poucas linhas, sem jargão: o que ela fez e por que a pessoa compra.</Entrance>
          </Body>
        </div>
        <div style={{ position: "relative", flex: s.vertical ? "0 0 auto" : 1, width: "100%" }}>
          <Screen delay={4} style={{ width: "100%", aspectRatio: "1144 / 818" }}>
            <KenBurns src="passo-3.webp" zoomFrom={1.04} zoomTo={1.14} pan={-40} position="top right" />
          </Screen>
          <div style={{ position: "absolute", top: -28, left: -16 }}>
            <Sticker delay={34} rotate={-6} bg={C.areia} size={s.chip}>Por que funciona</Sticker>
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

// ── 5. Ferramenta: o painel real, "Fazer a minha versão"
export const Ferramenta: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const s = useScale();
  const exit = useExit(durationInFrames);
  const { float } = useBreathe(28);
  const p = spring({ frame: frame - 4, fps, config: theme.spring.smooth });
  return (
    <Stage base={C.cream} a="rgba(150,94,65,0.3)" b="rgba(212,185,154,0.55)">
      <AbsoluteFill style={{ ...exit, padding: s.pad, display: "flex", flexDirection: s.vertical ? "column" : "row", alignItems: "center", justifyContent: "center", gap: s.vertical ? 40 : 60 }}>
        <div style={{ flex: s.vertical ? "0 0 auto" : "0 0 52%", width: s.vertical ? "100%" : undefined }}>
          <Entrance><Sticker delay={4} bg={C.terra} color={C.white} size={s.chip}>a nossa ferramenta</Sticker></Entrance>
          <div style={{ height: 22 }} />
          <H size={s.h2}>
            <WordReveal text="Fazer a minha versão." delay={8} style={{ justifyContent: "flex-start" }} serifFrom={2} serifColor={C.terra} />
          </H>
          <Body size={s.body} style={{ marginTop: 24 }}>
            <Entrance delay={34}>Você preenche a sua ficha uma vez, e ela escreve a sua versão com a mesma estrutura do original, na voz do seu negócio.</Entrance>
          </Body>
          <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
            <Chip light delay={70} size={s.chip * 0.9}>Abre no ChatGPT</Chip>
            <Chip light delay={76} size={s.chip * 0.9}>ou no Claude</Chip>
            <Chip light delay={82} size={s.chip * 0.9} active activeAt={96}>em poucos cliques</Chip>
          </div>
        </div>
        <div style={{ flex: s.vertical ? "0 0 auto" : 1, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <Img src={staticFile("painel.png")} style={{ height: s.vertical ? 1000 : 900, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [120, 0]) + float}px) rotate(${interpolate(p, [0, 1], [6, -2])}deg)`, filter: "drop-shadow(0 50px 70px rgba(46,33,27,0.35))" }} />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

// ── 6. Toda semana + bônus: as três capas
const BONUS = ["capa-black.webp", "capa-minivsl.webp", "capa-paginas.webp"];
export const Semana: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const s = useScale();
  const exit = useExit(durationInFrames);
  return (
    <Stage dark base={C.teal} a="rgba(26,104,104,0.6)" b="rgba(150,94,65,0.3)">
      <AbsoluteFill style={{ ...exit, padding: s.pad, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <H size={s.h2} color={C.white}>
          <WordReveal text="Anúncios novos toda semana." delay={4} serifFrom={3} serifColor={C.areia} />
        </H>
        <div style={{ display: "flex", gap: s.vertical ? 18 : 28, marginTop: 44, alignItems: "flex-end" }}>
          {BONUS.map((b, i) => {
            const p = spring({ frame: frame - 24 - i * 6, fps, config: theme.spring.smooth });
            const rot = [-5, 2, 6][i];
            return (
              <div key={b} style={{ width: s.vertical ? 300 : 300, aspectRatio: "720 / 957", borderRadius: 22, overflow: "hidden", border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 40px 70px -20px rgba(0,0,0,0.6)", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [120, 0])}px) rotate(${rot * p}deg) scale(${interpolate(p, [0, 1], [0.85, 1])})` }}>
                <Img src={staticFile(b)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 40 }}>
          <Sticker delay={58} rotate={-3} bg={C.terra} color={C.white} size={s.chip}>E três especiais de bônus</Sticker>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

// ── 7. Fechamento: botão recortado
export const Fim: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const s = useScale();
  const p = spring({ frame: frame - 6, fps, config: theme.spring.bouncy });
  const { scale } = useBreathe(20);
  const line = spring({ frame: frame - 36, fps, config: theme.spring.smooth });
  return (
    <Stage base={C.cream} a="rgba(212,185,154,0.55)" b="rgba(150,94,65,0.3)">
      <Center style={{ padding: s.pad }}>
        <div>
          <H size={s.h2} style={{ marginBottom: 44 }}>
            <WordReveal text="Entenda a lógica e faça a sua versão." delay={0} serifFrom={4} serifColor={C.terra} />
          </H>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: `${s.chip * 1}px ${s.chip * 2.2}px`, borderRadius: 999, background: C.terra, color: C.white, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: s.chip * 1.5, letterSpacing: -0.02 * s.chip, border: `4px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}, 0 0 60px ${C.glow}`, opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.7, 1]) * scale})` }}>
            <span style={{ color: C.areia }}>✦</span> Quero o acervo <span>→</span>
          </div>
          <Body size={s.body * 0.85} style={{ marginTop: 30, opacity: line, transform: `translateY(${interpolate(line, [0, 1], [16, 0])}px)` }}>
            Pagamento único · 7 dias de garantia
          </Body>
        </div>
      </Center>
    </Stage>
  );
};
