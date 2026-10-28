// Templates de e-mail do Acervo de Anúncios (Método AVVA).
//
// Cada função recebe os dados do comprador e devolve { subject, html, text },
// pronto pra enviar pelo Resend. A identidade visual (cabeçalho marrom com a
// logo, botão terracota, botão de suporte no teal) é a mesma em todos.
//
// Fica fora de api/ de propósito: a Vercel só publica como função o que está
// em api/, e este arquivo é só um módulo importado por lá.

export const SITE = 'https://metodoavva.com'
export const LOGIN_URL = `${SITE}/login`
export const WHATS = '(19) 92000-2917'
export const WHATS_URL = 'https://wa.me/5519920002917'

const COR = {
  terracota: '#A85C35',
  teal: '#0C4747',
  marrom: '#2B1A12',
  texto: '#6b5a52',
  fundo: '#F7F4F0',
  borda: '#eee7df',
}

export const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const primeiroNome = (name) => (name || '').trim().split(/\s+/)[0] || ''

// ---- peças ----------------------------------------------------------------

export const p = (txt) => `<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:${COR.texto}">${txt}</p>`
export const b = (txt) => `<strong style="color:${COR.marrom}">${txt}</strong>`

export const titulo = (txt) => `<div style="font-size:22px;font-weight:700;color:${COR.marrom};line-height:1.25">${txt}</div>`

export const subtitulo = (txt) => `<div style="margin-top:24px;font-size:16px;font-weight:700;color:${COR.marrom}">${txt}</div>`

export const botao = (href, label, { cor = COR.terracota, margem = '24px 0 24px' } = {}) => `
        <div style="text-align:center;margin:${margem}">
          <a href="${href}" style="display:inline-block;padding:16px 32px;background:${cor};color:#ffffff;text-decoration:none;border-radius:100px;font-weight:700;font-size:16px">${label}</a>
        </div>`

export const botaoSuporte = () => `
        <div style="text-align:center;margin:18px 0 8px">
          <a href="${WHATS_URL}" style="display:inline-block;padding:13px 26px;background:${COR.teal};color:#ffffff;text-decoration:none;border-radius:100px;font-weight:700;font-size:15px">Chamar no WhatsApp</a>
        </div>`

export const passo = (n, tituloPasso, texto) => `
    <tr>
      <td style="padding:0 14px 18px 0;vertical-align:top">
        <div style="width:34px;height:34px;border-radius:50%;background:${COR.terracota};color:#fff;font-weight:700;font-size:15px;line-height:34px;text-align:center">${n}</div>
      </td>
      <td style="padding:0 0 18px;vertical-align:top">
        <div style="font-size:16px;font-weight:700;color:${COR.marrom};line-height:1.3">${tituloPasso}</div>
        <div style="font-size:14px;line-height:1.55;color:${COR.texto};margin-top:4px">${texto}</div>
      </td>
    </tr>`

export const passos = (linhas) => `
        <table style="width:100%;border-collapse:collapse;margin-top:14px">${linhas.join('')}
        </table>`

export const destaque = (tituloBloco, texto) => `
        <div style="padding:16px 18px;background:${COR.fundo};border-left:3px solid ${COR.teal};border-radius:12px;margin:20px 0 0">
          <div style="font-size:13px;color:${COR.teal};font-weight:700;margin-bottom:4px">${tituloBloco}</div>
          <div style="font-size:14px;line-height:1.55;color:${COR.texto}">${texto}</div>
        </div>`

export const codigo = (txt) => `
        <div style="margin:16px 0 0;padding:14px 16px;background:${COR.fundo};border:1px dashed #cdbfae;border-radius:12px;font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;color:${COR.marrom};word-break:break-all">${txt}</div>`

export const assinatura = (despedida) => `
        <p style="margin:24px 0 28px;font-size:15px;line-height:1.6;color:${COR.texto}">${despedida},<br />${b('Equipe Acervo de Anúncios · Método AVVA')}</p>`

export const layout = (conteudo) => `
  <div style="margin:0;padding:32px 16px;background:${COR.fundo};font-family:Outfit,Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${COR.borda};border-radius:22px;overflow:hidden">
      <div style="background:${COR.marrom};text-align:center;line-height:0">
        <img src="${SITE}/email/cabecalho-acervo.png" width="560" height="150" alt="acervo de anúncios" style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto" />
      </div>
      <div style="padding:28px 32px 8px">${conteudo}
      </div>
    </div>
  </div>`

const ASSINATURA_TXT = 'Equipe Acervo de Anúncios · Método AVVA'
const AJUDA_TXT = `responda este e-mail ou chame a gente no WhatsApp ${WHATS}.`

// ---- 1. Boas-vindas (compra aprovada) --------------------------------------

export function welcomeEmail({ email, name, hasKit }) {
  const nome = primeiroNome(name)
  const saudacao = nome ? `Oiee, ${esc(nome)}! Que bom ter você aqui.` : 'Oiee! Que bom ter você aqui.'

  const html = layout(`
        ${titulo(saudacao)}
        ${p(`Seu ${b('Acervo de Anúncios já está liberado')}.`)}
        ${p(`A partir de agora, toda vez que você travar na hora de criar um anúncio, já tem um lugar pra encontrar as melhores referências. E o melhor: ${b('entender por que elas funcionam')}.`)}
        ${p(`Porque não adianta só reproduzir o que viu dar certo pra outra pessoa. Quando você entende a lógica, consegue fazer o seu, do seu jeito, pro seu público.`)}
        ${subtitulo('Pra entrar é simples:')}
        ${passos([
          passo(1, `Acesse <a href="${LOGIN_URL}" style="color:${COR.marrom}">metodoavva.com/login</a>`, 'Dá pra usar direto do celular.'),
          passo(2, 'Coloque o e-mail da compra', `${b(esc(email))}. ${b('Não precisa de senha.')}`),
          passo(3, 'Dentro, os anúncios estão organizados por objetivo', 'Ser descoberta, gerar autoridade, provar que funciona, vender agora. É só começar pelo que faz mais sentido pra você hoje.'),
        ])}
        ${botao(LOGIN_URL, 'Entrar no acervo', { margem: '8px 0 24px' })}
        ${hasKit ? destaque('Seu Kit de Execução também está liberado', 'Ganchos prontos, estruturas narrativas e prompts de IA. Está no menu da área de membros, em "Kit".') : ''}
        ${p(`Todo mês colocamos uma curadoria nova em ${b('"Melhores do mês"')}, então vale voltar sempre que você for criar algo novo.`)}
        ${p(`Se você não conseguir acessar com o seu e-mail de primeira, pode ser que o sistema ainda esteja processando o seu cadastro. ${b('Espere uns 2 minutinhos e tente de novo.')}`)}
        ${p(`Se mesmo assim você não conseguir acessar, pode responder este e-mail ou ${b('chamar a gente no WhatsApp pelo botão abaixo')}, que te ajudamos.`)}
        ${botaoSuporte()}
        ${assinatura('Te vemos lá dentro')}`)

  const text = [
    nome ? `Oiee, ${nome}! Que bom ter você aqui.` : 'Oiee! Que bom ter você aqui.',
    '',
    'Seu Acervo de Anúncios já está liberado. A partir de agora, toda vez que você travar na hora de criar um anúncio, já tem um lugar pra encontrar as melhores referências. E o melhor: entender por que elas funcionam.',
    '',
    'Pra entrar é simples:',
    `1. Acesse ${LOGIN_URL} (dá pra usar direto do celular)`,
    `2. Coloque o e-mail da compra: ${email}. Não precisa de senha.`,
    '3. Dentro, os anúncios estão organizados por objetivo. Comece pelo que faz mais sentido pra você hoje.',
    hasKit ? '\nSeu Kit de Execução também está liberado, no menu "Kit".' : '',
    '',
    'Todo mês colocamos uma curadoria nova em "Melhores do mês".',
    '',
    `Se não conseguir acessar de primeira, espere uns 2 minutinhos e tente de novo. Se mesmo assim não der, ${AJUDA_TXT}`,
    '',
    'Te vemos lá dentro,',
    ASSINATURA_TXT,
  ].join('\n')

  return { subject: 'Seu acervo está liberado (e leva 1 minuto pra entrar)', html, text }
}

// ---- 2. Abandono de checkout ----------------------------------------------

export function abandonEmail({ name, checkoutUrl }) {
  const nome = primeiroNome(name)
  const link = checkoutUrl || `${SITE}/acervo`
  const saudacao = nome ? `Oiee, ${esc(nome)}! Ficou alguma dúvida?` : 'Oiee! Ficou alguma dúvida?'

  const html = layout(`
        ${titulo(saudacao)}
        ${p(`A gente viu que você chegou até a página de pagamento do ${b('Acervo de Anúncios')} e acabou não finalizando. Acontece, a vida corre.`)}
        ${p(`Só pra lembrar o que te espera lá dentro: uma curadoria de anúncios que funcionam, organizados por objetivo, ${b('com a análise do porquê cada um vende')}. Você entende a lógica e faz o seu, do seu jeito, pro seu público.`)}
        ${p(`São ${b('R$ 67')} por 1 ano de acesso, com ${b('7 dias de garantia')}. Se não fizer sentido pra você, a gente devolve.`)}
        ${botao(link, 'Finalizar minha compra')}
        ${p(`Se você travou em alguma coisa na hora de pagar, ou quer tirar uma dúvida antes de decidir, pode responder este e-mail ou ${b('chamar a gente no WhatsApp pelo botão abaixo')}.`)}
        ${botaoSuporte()}
        ${assinatura('Um abraço')}`)

  const text = [
    nome ? `Oiee, ${nome}! Ficou alguma dúvida?` : 'Oiee! Ficou alguma dúvida?',
    '',
    'A gente viu que você chegou até a página de pagamento do Acervo de Anúncios e acabou não finalizando. Acontece, a vida corre.',
    '',
    'Só pra lembrar o que te espera lá dentro: uma curadoria de anúncios que funcionam, organizados por objetivo, com a análise do porquê cada um vende. Você entende a lógica e faz o seu, do seu jeito, pro seu público.',
    '',
    'São R$ 67 por 1 ano de acesso, com 7 dias de garantia. Se não fizer sentido pra você, a gente devolve.',
    '',
    `Finalizar minha compra: ${link}`,
    '',
    `Se você travou em alguma coisa na hora de pagar, ou quer tirar uma dúvida antes de decidir, ${AJUDA_TXT}`,
    '',
    'Um abraço,',
    ASSINATURA_TXT,
  ].join('\n')

  return { subject: 'Ficou alguma dúvida? Seu acervo ainda está te esperando', html, text }
}

// ---- 3. Pix gerado ---------------------------------------------------------

function formataVencimento(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const f = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  return f.format(d).replace(',', ' às')
}

export function pixEmail({ name, checkoutUrl, pixCode, expiresAt }) {
  const nome = primeiroNome(name)
  const link = checkoutUrl || `${SITE}/acervo`
  const vence = formataVencimento(expiresAt)
  const saudacao = nome ? `Oiee, ${esc(nome)}! Seu Pix está pronto.` : 'Oiee! Seu Pix está pronto.'
  const validade = vence ? `O código vale até ${b(vence)}.` : 'O código tem validade curta.'

  const blocoPix = pixCode
    ? `
        ${subtitulo('Pix copia e cola')}
        ${codigo(esc(pixCode))}
        ${p(`Copie o código acima e cole no app do seu banco, em ${b('Pix > Pagar > Pix Copia e Cola')}. ${validade} Se vencer, é só gerar outro pelo mesmo link.`)}`
    : `
        ${p(`${validade} Se vencer, é só abrir o link abaixo e gerar outro.`)}`

  const html = layout(`
        ${titulo(saudacao)}
        ${p(`Você gerou o Pix do ${b('Acervo de Anúncios')} e falta só uma coisa: pagar. Assim que o pagamento cair, ${b('seu acesso é liberado na hora')} e você recebe outro e-mail com o passo a passo pra entrar.`)}
        ${blocoPix}
        ${botao(link, 'Abrir a página de pagamento')}
        ${p(`Se o Pix expirou ou alguma coisa deu errado, pode responder este e-mail ou ${b('chamar a gente no WhatsApp pelo botão abaixo')}.`)}
        ${botaoSuporte()}
        ${assinatura('Te esperamos lá dentro')}`)

  const text = [
    nome ? `Oiee, ${nome}! Seu Pix está pronto.` : 'Oiee! Seu Pix está pronto.',
    '',
    'Você gerou o Pix do Acervo de Anúncios e falta só uma coisa: pagar. Assim que o pagamento cair, seu acesso é liberado na hora e você recebe outro e-mail com o passo a passo pra entrar.',
    '',
    pixCode ? `Pix copia e cola:\n${pixCode}\n\nCole no app do seu banco, em Pix > Pagar > Pix Copia e Cola.` : '',
    vence ? `O código vale até ${vence}. Se vencer, é só gerar outro pelo mesmo link.` : 'O código tem validade curta. Se vencer, é só gerar outro pelo mesmo link.',
    '',
    `Página de pagamento: ${link}`,
    '',
    `Se o Pix expirou ou alguma coisa deu errado, ${AJUDA_TXT}`,
    '',
    'Te esperamos lá dentro,',
    ASSINATURA_TXT,
  ].filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n')

  return { subject: 'Seu Pix foi gerado: falta só o pagamento pra liberar o acervo', html, text }
}

// ---- 4. Cartão recusado ----------------------------------------------------

export function refusedEmail({ name, checkoutUrl }) {
  const nome = primeiroNome(name)
  const link = checkoutUrl || `${SITE}/acervo`
  const saudacao = nome ? `Oiee, ${esc(nome)}! Deu um probleminha no pagamento.` : 'Oiee! Deu um probleminha no pagamento.'

  const html = layout(`
        ${titulo(saudacao)}
        ${p(`O cartão não aprovou o pagamento do ${b('Acervo de Anúncios')}. Isso acontece mais do que parece e, na maioria das vezes, nem é culpa sua: pode ser limite, um bloqueio de segurança do banco ou um número digitado errado.`)}
        ${p(`O jeito mais rápido de resolver é ${b('pagar por Pix')}. É aprovado na hora e o acesso é liberado em seguida.`)}
        ${subtitulo('É assim:')}
        ${passos([
          passo(1, 'Abra o link abaixo', 'É a mesma página de pagamento, com seus dados já preenchidos.'),
          passo(2, 'Escolha Pix', 'Copie o código e pague pelo app do seu banco.'),
          passo(3, 'Pronto', `Em um minutinho você recebe o e-mail com o acesso.`),
        ])}
        ${botao(link, 'Pagar com Pix', { margem: '8px 0 24px' })}
        ${p(`Se preferir tentar com o cartão de novo, vale conferir os dados ou usar outro cartão.`)}
        ${p(`E se nada der certo, pode responder este e-mail ou ${b('chamar a gente no WhatsApp pelo botão abaixo')}, que a gente resolve junto.`)}
        ${botaoSuporte()}
        ${assinatura('Um abraço')}`)

  const text = [
    nome ? `Oiee, ${nome}! Deu um probleminha no pagamento.` : 'Oiee! Deu um probleminha no pagamento.',
    '',
    'O cartão não aprovou o pagamento do Acervo de Anúncios. Isso acontece mais do que parece e, na maioria das vezes, nem é culpa sua: pode ser limite, um bloqueio de segurança do banco ou um número digitado errado.',
    '',
    'O jeito mais rápido de resolver é pagar por Pix. É aprovado na hora e o acesso é liberado em seguida.',
    '',
    `1. Abra a página de pagamento: ${link}`,
    '2. Escolha Pix e pague pelo app do seu banco.',
    '3. Em um minutinho você recebe o e-mail com o acesso.',
    '',
    'Se preferir tentar com o cartão de novo, vale conferir os dados ou usar outro cartão.',
    '',
    `E se nada der certo, ${AJUDA_TXT}`,
    '',
    'Um abraço,',
    ASSINATURA_TXT,
  ].join('\n')

  return { subject: 'Seu pagamento não foi aprovado (e tem um jeito rápido de resolver)', html, text }
}
