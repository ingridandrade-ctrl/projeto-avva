# Cakto Members: a porta de entrada do Acervo

A aluna compra na Cakto e cai em três lugares que apontam pro mesmo destino: o e-mail da Cakto, o nosso e-mail de boas-vindas e a Cakto Members. O produto mora em metodoavva.com; a Cakto Members existe só pra ninguém ficar perdida.

## Produto: Acervo de Anúncios

**Canais de entrega (Configurações, Canais de Entrega):** Cakto Members, Área de membros externa e Acesso por e-mail, os três marcados. Link de acesso por e-mail: `https://metodoavva.com/login`.

**Área de membros (Configurações Avançadas, Área de Membros):**

- Logo: `cakto-members-logo-256x256.png`
- Banner: `cakto-members-banner-1920x480.png`
- Título: `Seu acervo está liberado`
- Subtítulo: `Assista ao vídeo de 1 minuto e entre com o e-mail da compra`
- Botão do banner: texto `Entrar no acervo`, URL `https://metodoavva.com/login`
- Configurações, Geral: nome `Acervo de Anúncios`, slug `acervo-de-anuncios`, e-mail de suporte `suporte@metodoavva.com`
- Recursos: comentários desligados, vitrine desligada, total de alunos desligado

**Estrutura do conteúdo (um módulo, duas aulas, as duas publicadas):**

Módulo: `Como acessar o acervo`

1. Aula `Entre no acervo em 1 minuto` (vídeo, roteiro abaixo). Descrição da aula:

   > Seu acervo fica em metodoavva.com/login. Não tem senha: digite o mesmo e-mail que você usou na compra e pronto. Funciona no celular. Se o e-mail não for encontrado, aguarde 2 minutos (o Pix leva um instante pra confirmar) e tente de novo. Se continuar, responda o e-mail de compra que a gente libera na hora.

   Material da aula: link `https://metodoavva.com/login` com o nome `Entrar no acervo`.

2. Aula `Por onde começar` (texto, sem vídeo):

   > Dentro do acervo, os anúncios estão organizados por objetivo: ser descoberta, mostrar que você entende, provar que funciona, quebrar o "mas…" e vender agora. Comece pela coleção do que você precisa hoje. Leia a análise, veja a estrutura (gancho, prova, oferta) e adapte pro seu negócio. Salve nos favoritos o que fizer sentido. Todo mês entra uma curadoria nova em "Melhores do mês".

## Produto: Kit de Execução (order bump)

Mesmos três canais de entrega, mesmo link de acesso. Área de membros com a logo e o banner iguais.

- Título: `Seu Kit de Execução está liberado`
- Subtítulo: `Ele fica dentro do acervo, no menu "Kit"`
- Botão: `Abrir o kit`, URL `https://metodoavva.com/kit`

Módulo `Como acessar o kit`, uma aula `Onde fica o kit` (texto):

> O Kit de Execução fica dentro da mesma área de membros do acervo, em metodoavva.com/kit. Entre com o e-mail da compra (sem senha) e toque em "Kit" no menu. Lá estão os ganchos prontos, as estruturas narrativas e os prompts de IA.

## Roteiro do vídeo (60 segundos, gravado no celular, tela do próprio celular)

1. **(0 a 8 s)** Você, de frente: "Oi! Seu acervo já está liberado. Vou te mostrar como entrar, leva menos de um minuto."
2. **(8 a 25 s)** Tela do celular: abre `metodoavva.com/login`. "Esse é o endereço: metodoavva.com barra login. Salva nos favoritos."
3. **(25 a 40 s)** Digita o e-mail: "Digita o mesmo e-mail que você usou na compra. Não tem senha, é só o e-mail. E toca em entrar."
4. **(40 a 52 s)** Dentro da área: "Pronto, esse é o acervo. As coleções estão por objetivo: começa pela que você precisa hoje, lê a análise e adapta pro seu negócio."
5. **(52 a 60 s)** De frente de novo: "Se o e-mail não for encontrado, espera dois minutinhos e tenta de novo. Qualquer coisa, responde o e-mail de compra que eu te ajudo. Te vejo lá dentro."

## Os dois e-mails

1. **E-mail da Cakto (automático, pagamento confirmado).** Traz o link de acesso configurado no produto (`metodoavva.com/login`), os dados do pedido e o acesso à Cakto Members. Não dá pra mudar o texto.
2. **E-mail de boas-vindas do AVVA (nosso, via Resend).** Sai do webhook assim que a compra é aprovada: saudação pelo nome, três passos pra entrar, botão "Entrar no acervo" e aviso do Kit quando ela levou. Remetente `suporte@metodoavva.com`.

## Redes de segurança, em ordem

1. Webhook da Cakto cria a conta na hora da compra.
2. Se o webhook falhou, a tela de login confere a compra direto na Cakto e cria a conta ali mesmo (precisa da Chave de API nas variáveis da Vercel).
3. Os dois e-mails e a Cakto Members mostram o caminho.
4. O histórico de entregas da Cakto permite reenviar um webhook que falhou.
