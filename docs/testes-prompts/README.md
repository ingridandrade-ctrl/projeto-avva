# Testes dos prompts

Prompts gerados pelo código novo (`src/lib/adaptar.js` e `src/lib/kitEstruturas.js`) para os casos abaixo. Gerados por `gerar.mjs` a partir do bundle do código; nenhum foi editado à mão.

| Caso | O que testa |
|---|---|
| 01-b2b-minivsl-ficha-original | O caso do anexo A do diagnóstico, com a ficha exatamente como a aluna preencheu (duração vira 60 a 180 por estar na Especial Mini VSL; tom Acolhedora vira regra concreta) |
| 02-b2b-minivsl-ficha-completa | O mesmo caso com os campos novos preenchidos (frase da cliente, prova com contexto, o que ganha ao clicar, texto da aluna, proibidas) |
| 03-video-com-duracao | Vídeo com `duration_seconds` cadastrado (42 s): o prompt pede a mesma duração |
| 04-imagem-captar-leads | Imagem, objetivo Captar leads, destino página de captura |
| 05-carrossel-autoridade | Carrossel, tom Técnica e precisa |
| 06-pagina-vendas | Página de vendas (sem destino, bloco por bloco) |
| 07-pagina-captura | Página de captura com ficha mínima |
| 08-ficha-vazia | Ficha vazia: o prompt diz o que não foi informado e manda perguntar antes |
| 09-amostra-longa | Texto da aluna com 3.000 caracteres: passa de 8.000 no link e o botão vira "Copiar o prompt" |
| kit-*.md | Os 6 super prompts do Kit e o prompt de classificação |
| ficha.md | A ficha única |

O que foi conferido automaticamente em cada caso: nenhum campo sai como `undefined`, a análise está no prompt, não há travessão, e o tamanho codificado do link (limite 8.000).

O que **não** foi feito aqui: rodar os prompts no Claude e no ChatGPT e comparar as saídas. Isso precisa ser feito à mão (ou com uma chave de API) antes de liberar pras alunas. O caso 02 é o primeiro a rodar: a saída esperada é a IA fazer até 3 perguntas antes de escrever, ou escrever com cerca de 60 a 180 segundos de fala sem nenhum vício da tabela do anexo B.
