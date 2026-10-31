# Vídeo "Como acessar o Acervo"

Vídeo vertical (1080×1920, cerca de 1min20) do passo a passo de acesso, gravado com o site
rodando de verdade dentro de um celular simulado, com dados de exemplo.

## Como refazer

Precisa do Node com Playwright e do ffmpeg.

1. Na raiz do projeto, suba o site: `npx vite --port 5199`
2. Grave: `node docs/video-de-acesso/gravar.cjs saida/` (gera o `.webm` e o `tempos.json`)
3. Trilha (instrumental, gerada por código, sem direitos autorais):
   `python3 docs/video-de-acesso/trilha.py trilha.wav <duração em segundos>`
4. Junte com o ffmpeg, cortando pelo `tempos.json` (t0 = início, t1 = fim).

## Arquivos

- `palco.html`: o cenário (fundo, legendas, celular, barra de endereço, toque, abertura e encerramento)
- `gravar.cjs`: o roteiro das cenas e os dados de exemplo (aluna, coleções, anúncios)
- `capas/`: capas reais das coleções; `criativos/`: anúncios de exemplo
- `criativos.cjs`: gera os criativos de exemplo
- `trilha.py`: gera a trilha
