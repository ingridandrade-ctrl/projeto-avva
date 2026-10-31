# Vídeo "Como acessar o Acervo"

Vídeo vertical (1080×1920, cerca de 50s, sem música) do passo a passo de acesso, gravado com o site
rodando de verdade dentro de um celular simulado, com dados de exemplo. No passo 5, a tela do celular
recebe na edição uma gravação real do celular (anúncios de verdade), acelerada 1,25x.

## Como refazer

Precisa do Node com Playwright e do ffmpeg.

1. Na raiz do projeto, suba o site: `npx vite --port 5199`
2. Grave: `JANELA=9650 node docs/video-de-acesso/gravar.cjs saida/` (gera o `.webm` e o `tempos.json`).
   `JANELA` é a duração, em ms, do trecho real que cobre o passo 5 (`j0` a `j1` no `tempos.json`).
3. Na edição (ffmpeg): corte de `t0` a `t1`; encaixe a gravação real recortada (sem a barra de status
   e sem a barra do navegador) na tela do celular, em x=210, y=618, 660×1202, com cantos de baixo
   arredondados (raio 78), a partir de `j0`.
4. Trilha opcional (instrumental, gerada por código):
   `python3 docs/video-de-acesso/trilha.py trilha.wav <duração em segundos>`

## Arquivos

- `palco.html`: o cenário (fundo, legendas, celular, barra de endereço, toque, abertura e encerramento)
- `gravar.cjs`: o roteiro das cenas e os dados de exemplo (aluna, coleções, anúncios)
- `capas/`: capas reais das coleções; `criativos/`: anúncios de exemplo
- `criativos.cjs`: gera os criativos de exemplo
- `trilha.py`: gera a trilha
