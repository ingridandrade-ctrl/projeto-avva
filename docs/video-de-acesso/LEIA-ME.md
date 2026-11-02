# Vídeo "Como acessar o Acervo"

Vídeo vertical (1080×1920, cerca de 50s, sem música) do passo a passo de acesso, gravado com o site
rodando de verdade dentro de um celular simulado, com dados de exemplo. Um aviso no rodapé indica que as
imagens são ilustrativas.

## Como refazer

Precisa do Node com Playwright e do ffmpeg.

1. Na raiz do projeto, suba o site: `npx vite --port 5199`
2. Grave duas vezes seguidas, com o mesmo servidor no ar (a primeira só aquece as telas):
   `node docs/video-de-acesso/gravar.cjs saida/` (gera o `.webm` e o `tempos.json`)
3. Corte no ffmpeg de `t0` a `t1` (os tempos estão no `tempos.json`).
4. Trilha opcional (instrumental, gerada por código):
   `python3 docs/video-de-acesso/trilha.py trilha.wav <duração em segundos>`

## Arquivos

- `palco.html`: o cenário (fundo, legendas, celular, barra de endereço, toque, abertura e encerramento)
- `gravar.cjs`: o roteiro das cenas e os dados de exemplo (aluna, coleções, anúncios)
- `capas/`: capas reais das coleções; `criativos/`: anúncios de exemplo
- `criativos.cjs`: gera os criativos de exemplo
- `trilha.py`: gera a trilha
