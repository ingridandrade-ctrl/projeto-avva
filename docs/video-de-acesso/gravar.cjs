const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://localhost:5199';
const DIR = path.join(__dirname);
const REF = 'ufprndosuvqbrqlvndry';
const UID = '11111111-1111-1111-1111-111111111111';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 3600 * 24 * 30;
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: UID, exp, role: 'authenticated', aud: 'authenticated', email: 'ana@exemplo.com' })}.x`;
const user = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'ana@exemplo.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' };
const session = { access_token: jwt, refresh_token: 'r', token_type: 'bearer', expires_in: 3600 * 24 * 30, expires_at: exp, user };

const capa = s => `${BASE}/docs/video-de-acesso/capas/${s}.jpg`;
const C = (id, slug, title, subtitle, order, extra = {}) => ({ id, slug, title, subtitle, order, is_bonus: false, cover_url: null, featured: false, ...extra });
const collections = [
  C('c1', 'ser-descoberta', 'Ser descoberta', 'Atrair seguidores e chamar a atenção de quem não te conhece', 1, { cover_url: capa('ser-descoberta') }),
  C('c2', 'mostrar-que-voce-entende', 'Mostrar que você entende', 'Gerar autoridade e construir confiança', 2, { cover_url: capa('mostrar-que-voce-entende') }),
  C('c3', 'provar-que-funciona', 'Provar que funciona', 'Prova social e resultados reais', 3, { cover_url: capa('provar-que-funciona') }),
  C('c4', 'quebrar-o-mas', 'Quebrar o "mas..."', 'Quebra de objeção e dos motivos pra adiar', 4, { cover_url: capa('quebrar-o-mas') }),
  C('c5', 'vender-agora', 'Vender agora', 'Oferta direta e remarketing', 5, { cover_url: capa('vender-agora') }),
  C('c7', 'melhores-de-outubro-2026', 'Melhores de outubro 2026', 'Curadoria do mês, garimpada pela Flora', 7, { featured: true }),
];
const analiseMeme = `A frase de meme "um dia alguém vai te convidar..." vira um convite sem cara de convite.

Primeiro a pessoa lê algo que parece conselho. Depois a legenda revela que quem chama é ele, e a tela do Claude aberta ao fundo mostra que ele usa aquilo que vai ensinar. Quando o pedido aparece, ela já concordou que vale aceitar.

Dá para usar em qualquer chamada de aula ou evento: um formato que o público já conhece abre a porta, e o convite entra no fim.`;
const A = (n, id, title, media_type, extra = {}) => ({ id: 'a' + n, title, analysis: analiseMeme, objectives: ['ser-descoberta'], niches: ['infoproduto'], media_type, drive_url: `https://drive.google.com/file/d/${id}/view`, collection_id: 'c7', active: true, created_at: `2026-10-0${n}T00:00:00Z`, ...extra });
const ads = [
  A(1, 'meme', 'Um meme pode virar convite pra sua aula', 'image'),
  A(2, 'erros', '3 erros que escondem o seu post', 'carousel'),
  A(3, 'pov', 'POV que vira identificação', 'video'),
  A(4, 'ninguem', 'O segredo que ninguém conta', 'video'),
  A(5, 'antes', 'Antes e depois do perfil', 'image', { niches: ['servico'] }),
  A(6, 'salva', 'Salva esse post', 'carousel', { niches: ['negocio-local'] }),
];

async function rotas(page) {
  // Miniaturas do Drive: entregamos os criativos de exemplo
  await page.route(/drive\.google\.com\/thumbnail|googleusercontent\.com\/d\//, route => {
    const u = route.request().url();
    const m = u.match(/id=([a-z]+)/) || u.match(/\/d\/([a-z]+)/);
    const f = m && path.join(DIR, 'criativos', m[1] + '.jpg');
    if (f && fs.existsSync(f)) return route.fulfill({ status: 200, contentType: 'image/jpeg', body: fs.readFileSync(f) });
    return route.abort();
  });
  await page.route(/drive\.google\.com\/file|\/api\/video/, r => r.abort());
  await page.route(/\/api\/login/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token_hash: 'abc' }) }));
  await page.route(new RegExp(`${REF}\\.supabase\\.co`), async route => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (body, headers = {}) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-expose-headers': 'content-range', ...headers }, body: JSON.stringify(body) });
    if (req.method() === 'OPTIONS') return json({});
    if (url.pathname.startsWith('/auth/v1/user')) return json(user);
    if (url.pathname.startsWith('/auth/v1/')) return json(session);
    const tabela = url.pathname.split('/').pop();
    if (req.method() === 'HEAD') return route.fulfill({ status: 200, headers: { 'content-range': '0-0/24', 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' }, body: '' });
    if (req.method() !== 'GET') return json(null);
    if (tabela === 'users') return json({ id: UID, email: user.email, name: 'Ana Souza', has_order_bump: false, is_admin: false });
    if (tabela === 'collections') return json(collections);
    if (tabela === 'ads') return json(ads, { 'content-range': `0-${ads.length - 1}/${ads.length}` });
    if (tabela === 'kit_items') return json([], { 'content-range': '0-0/24' });
    return json([]);
  });
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, recordVideo: { dir: OUT, size: { width: 1080, height: 1920 } } });
  const inicio = Date.now();
  const p = await ctx.newPage();
  await rotas(p);
  await p.goto(BASE + '/docs/video-de-acesso/palco.html');
  await p.evaluate(() => { localStorage.clear(); window.addEventListener('scroll', () => window.scrollTo(0, 0)); });
  await p.evaluate(() => document.fonts.ready);
  const f = () => p.frame({ url: /localhost:5199\/(?!docs)/ }) || p.frames()[1];
  const esperar = ms => p.waitForTimeout(ms);
  const palco = (fn, ...a) => p.evaluate(([fn, a]) => window.palco[fn](...a), [fn, a]);


  // Rola só o que está dentro do celular (scrollIntoView também rolaria o palco)
  async function rolarAte(loc, block = 'start') {
    await loc.evaluate((e, block) => {
      let sp = e.parentElement;
      while (sp && !(/(auto|scroll)/.test(getComputedStyle(sp).overflowY) && sp.scrollHeight > sp.clientHeight)) sp = sp.parentElement;
      const r = e.getBoundingClientRect();
      const vh = sp ? sp.getBoundingClientRect() : { top: 0, bottom: innerHeight, height: innerHeight };
      if (block === 'nearest' && r.top >= vh.top + 10 && r.bottom <= vh.bottom - 10) return;
      let off = block === 'center' ? (vh.height - r.height) / 2 : block === 'end' ? vh.height - r.height - 20 : 12;
      if (block === 'nearest') off = r.top < vh.top ? 12 : vh.height - r.height - 80;
      const delta = r.top - vh.top - off;
      if (sp) sp.scrollBy({ top: delta, behavior: 'smooth' }); else window.scrollBy({ top: delta, behavior: 'smooth' });
    }, block);
  }

  // Toque: mostra o círculo no lugar do elemento e clica nele
  async function tocar(sel, { clicar = true, idx = 0 } = {}) {
    const fr = f();
    const el = fr.locator(sel).nth(idx);
    await el.waitFor({ state: 'visible', timeout: 15000 });
    await rolarAte(el, 'nearest');
    await esperar(450);
    const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    const ifr = await p.locator('#app').boundingBox();
    const esc = 660 / 390;
    await palco('tocar', ifr.x + r.x * esc, ifr.y + r.y * esc);
    if (clicar) await el.evaluate(e => { e.focus?.(); e.click(); });
    await palco('soltar');
  }
  async function rolar(sel, block = 'start', idx = 0) {
    await rolarAte(f().locator(sel).nth(idx), block);
    await esperar(800);
  }
  async function rolarPor(px) {
    await f().evaluate(px => window.scrollBy({ top: px, behavior: 'smooth' }), px);
    await esperar(1100);
  }
  async function digitar(sel, texto, delay = 75) {
    const el = f().locator(sel);
    await el.focus();
    await el.pressSequentially(texto, { delay });
  }
  async function trocaDeTela(url, espera) {
    await palco('branco', true);
    await f().locator(espera).first().waitFor({ state: 'visible', timeout: 15000 });
    palco('url', url);
    await esperar(250);
    await palco('branco', false);
  }

  // Abertura
  await esperar(300);
  const t0 = Date.now() - inicio;
  await palco('cartao', 'abertura', true);
  await esperar(1900);
  await palco('legenda', 'Passo 1 de 6', 'Abra <em>metodoavva.com/login</em>', 'No navegador do celular ou do computador');
  await palco('cartao', 'abertura', false);

  // Passo 1
  const urlBox = await p.locator('#url').boundingBox();
  await palco('tocar', urlBox.x + urlBox.width / 2, urlBox.y + urlBox.height / 2); await palco('soltar');
  await palco('digitarUrl', 'metodoavva.com/login', 45);
  await palco('carregar', BASE + '/login');
  await f().locator('#email').waitFor();
  await esperar(700);

  // Passo 2
  await palco('legenda', 'Passo 2 de 6', 'Digite o <em>e-mail da compra</em>', 'Não tem senha: é o mesmo e-mail do pagamento');
  await tocar('#email');
  await digitar('#email', 'ana@exemplo.com', 40);
  await esperar(300);
  await tocar('button[type=submit]');
  await trocaDeTela('metodoavva.com/alunas', '.home-hero');

  // Passo 3
  await palco('legenda', 'Passo 3 de 6', 'Pronto, <em>você está dentro</em>', 'Em "Seus produtos", toque em Acessar');
  await esperar(900);
  await rolar('.home-products', 'start');
  await tocar('a.product-card');
  await trocaDeTela('metodoavva.com/produto/acervo-anuncios', '.module-card');
  await esperar(500);

  // Passo 4
  await palco('legenda', 'Passo 4 de 6', 'Escolha pelo <em>objetivo</em>', 'Cada coleção resolve uma necessidade');
  await rolar('.product-page__modules h2', 'start');
  await esperar(900);
  await tocar('.module-card');
  await trocaDeTela('metodoavva.com/colecao/ser-descoberta', '.ad-card');

  // Passo 5: a tela do celular é coberta pela gravação real (encaixada na edição).
  // Enquanto isso, por baixo, o site chega no painel aberto pra emendar no passo 6.
  await palco('legenda', 'Passo 5 de 6', 'Toque no anúncio e <em>leia o porquê</em>', 'A análise mostra por que ele funciona');
  const j0 = Date.now() - inicio;
  await f().locator('.ad-card').first().evaluate(e => e.click());
  await f().locator('.adapt__toggle').waitFor();
  await f().locator('.adapt__toggle').evaluate(e => e.click());
  await esperar(400);
  await rolarAte(f().locator('.adapt__passo').first(), 'start');
  const JANELA = Number(process.env.JANELA || 9600);
  await esperar(Math.max(0, JANELA - (Date.now() - inicio - j0)));
  const j1 = Date.now() - inicio;

  // Passo 6
  await palco('legenda', 'Passo 6 de 6', 'Faça a sua versão <em>com IA</em>', 'Conte do seu negócio e do seu jeito de falar');
  await tocar('.adapt__chip', { idx: 3 });
  await tocar('.adapt__field input', { idx: 0 });
  await digitar('.adapt__field input >> nth=0', 'Consultoria de imagem', 40);
  await tocar('.adapt__field input', { idx: 1 });
  await digitar('.adapt__field input >> nth=1', 'Mulheres que voltaram a trabalhar', 35);
  await esperar(300);
  await palco('legenda', 'Passo 6 de 6', 'Abra no <em>ChatGPT</em> ou no <em>Claude</em>', 'A IA entrega gancho, roteiro e legenda');
  await rolarAte(f().locator('.adapt__passo--final'), 'center');
  await esperar(1000);
  await tocar('.adapt__cta', { clicar: false });
  await esperar(900);

  // Encerramento
  await palco('cartao', 'encerramento', true);
  await esperar(3000);
  const t1 = Date.now() - inicio;
  fs.writeFileSync(path.join(OUT, 'tempos.json'), JSON.stringify({ t0, t1, j0, j1 }));
  await ctx.close();
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
