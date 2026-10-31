const { chromium } = require('playwright');
const OUT = process.argv[2];
const itens = [
  ['meme', '#1d1511', '#3a2a22', 'um dia alguém vai te <i>convidar</i> pra uma aula que muda tudo', 'meme'],
  ['erros', '#0C4747', '#1A6868', '3 erros que fazem o seu post <i>sumir</i> do feed', 'carrossel'],
  ['pov', '#965E41', '#C98A5E', 'POV: você finalmente <i>entendeu</i> o algoritmo', 'vídeo'],
  ['ninguem', '#2B1A12', '#4C362D', 'ninguém te conta isso sobre <i>vender</i> no Instagram', 'vídeo'],
  ['antes', '#EADFD0', '#F6F2EC', 'o antes e depois do <i>meu perfil</i>', 'imagem'],
  ['salva', '#14504B', '#0C4747', 'salva esse post pra <i>não esquecer</i>', 'carrossel'],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 800 } });
  for (const [id, c1, c2, txt, tag] of itens) {
    const claro = id === 'antes';
    await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet"></head>
    <body style="margin:0;width:600px;height:800px;background:linear-gradient(160deg,${c1},${c2});font-family:Outfit;display:flex;flex-direction:column;justify-content:center;padding:70px;box-sizing:border-box;color:${claro ? '#2E211B' : '#fff'};position:relative;overflow:hidden">
      <div style="position:absolute;right:-120px;top:-120px;width:380px;height:380px;border-radius:50%;background:${claro ? '#D4B99A' : 'rgba(255,255,255,.08)'}"></div>
      <div style="position:absolute;left:-90px;bottom:-140px;width:320px;height:320px;border-radius:50%;background:${claro ? '#E4D3BC' : 'rgba(212,185,154,.18)'}"></div>
      <span style="position:relative;align-self:flex-start;padding:8px 18px;border-radius:99px;background:${claro ? '#965E41' : 'rgba(255,255,255,.16)'};color:#fff;font-size:22px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${tag}</span>
      <div style="position:relative;margin-top:30px;font-size:62px;font-weight:800;line-height:1.05;letter-spacing:-.03em">${txt.replace(/<i>(.*?)<\/i>/, `<span style="font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:72px;color:${claro ? '#965E41' : '#E8C9A6'}">$1</span>`)}</div>
      <div style="position:relative;margin-top:40px;display:flex;gap:12px;align-items:center;font-size:22px;opacity:.75"><span style="width:44px;height:44px;border-radius:50%;background:${claro ? '#965E41' : '#E8C9A6'}"></span>@seuperfil</div>
    </body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${OUT}/${id}.jpg`, quality: 90, type: 'jpeg' });
  }
  await b.close();
})();
