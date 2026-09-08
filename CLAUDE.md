# CLAUDE.md — Império das Máquinas

Este arquivo existe para qualquer sessão futura (Claude ou humana) que mexer neste
repositório. As regras abaixo vêm de `REGISTRO.pdf` — 37 sessões de histórico real
do projeto, incluindo bugs sérios que já aconteceram e não podem se repetir. Leia
isto antes de tocar em `src/lib/game-logic.ts` ou `src/lib/save-system.ts`.

## O que é este repositório

`app.html` é o jogo original: um monolito único e autocontido (~2,4MB, HTML+CSS+JS
numa peça só, com fotos de sede e vídeos de obra embutidos em base64). Ele **continua
funcionando e não deve ser apagado nem editado** — é o backup e a fonte de verdade
histórica enquanto a migração para Next.js (`src/`) não cobrir 100% das telas.

`REGISTRO.pdf` é o diário de bordo do projeto (96 páginas, 37 sessões). Contém a
seção "1. ESTADO ATUAL", "2. HISTÓRICO DE SESSÕES" e "4. REGRAS DESTE REGISTRO".
Sempre que ele for atualizado por uma sessão de trabalho no `app.html`, a mesma
disciplina de honestidade e histórico deve valer para o `src/` do Next.js.

## Regras de ouro (não negociáveis)

### 1. Nunca apagar histórico
Documentação de decisões passadas (neste CLAUDE.md, no REGISTRO.pdf, em comentários
que expliquem "por que foi corrigido assim") só cresce. Se algo mudou, adiciona-se
uma entrada nova — não se reescreve ou apaga o que já foi registrado. Isso vale
literalmente para a seção 2 do REGISTRO.pdf ("não editar entradas passadas, só
adicionar no topo") e no espírito para qualquer comentário `// CORREÇÃO (...)` que
já exista no código: não remover a explicação de um bug corrigido só porque o bug
já foi resolvido — é isso que evita o mesmo erro se repetir.

### 2. Sempre testar o retorno do jogador (não só o caminho "tudo novo")
O bug mais caro da história deste projeto (sessão 32 do REGISTRO.pdf): a
restauração de save **nunca funcionou em 31 sessões seguidas** porque todo teste
manipulava o estado do jogo *depois* da página já carregada — nenhum teste
simulava de verdade "jogador com conta e save existentes abre o jogo do zero".
O bug real era um `ReferenceError` de zona morta temporal (a função de restauração
rodava antes de `playerCash` ser declarado) escondido dentro de um `try/catch` que
engolia o erro em silêncio.

Regra prática: qualquer mudança em `save-system.ts`, `useGameState.tsx` ou no shape
salvo no `localStorage` precisa ser validada simulando um jogador **retornando**,
não só um jogador novo. Em termos de teste automatizado (equivalente ao
`beforeParse()` mencionado no histórico do projeto): popular o `localStorage` com
um save de exemplo *antes* do app montar, então verificar que o estado restaurado
bate com o que foi salvo — nunca só testar "state muda quando eu chamo a função
direto via console".

### 3. Nunca renomear ou reestruturar um campo salvo sem migrar o formato antigo
Duas vezes neste projeto uma mudança na forma como o save é gravado quebrou saves
já existentes de jogadores reais:
- Sessão 34: `salvarGameState()` só gravava um subconjunto de campos da máquina —
  não dava pra reconstruir uma máquina comprada de volta.
- Sessão 36: a correção da sessão 34 substituía a máquina inteira pelo que estava
  salvo — isso apagava nome/foto/preço em saves **anteriores** à correção, que
  nunca tinham esses campos gravados. Sintoma: "undefined" na tela de Manutenção.

Regra prática: `STORAGE_KEY` (`imperioDasMaquinas_conta`) e `GAME_STATE_KEY`
(`IMPERIO_GAME_STATE`) são as mesmas chaves do `app.html` original — **não
renomear**. Os nomes de campo dentro do JSON salvo (`playerCash`, `MACHINES`,
`historico`, `acceptedContracts`, etc.) também são os mesmos, propositalmente,
para que um save gravado pelo `app.html` continue legível se um dia o Next.js
apontar para o mesmo domínio/`localStorage`. Se um campo precisar mudar de forma,
a leitura tem que aceitar os dois formatos (antigo e novo) com fallback explícito
— nunca presumir que o save já está no formato mais recente.

### 4. localStorage é a fonte de verdade — não trocar para IndexedDB sem migração
O jogo real usa `localStorage`, não IndexedDB. `save-system.ts` mantém essa decisão
deliberadamente: trocar de storage agora apagaria o progresso de qualquer jogador
que já tenha um save gravado. Se uma migração pra IndexedDB for realmente
necessária no futuro, ela precisa **ler do localStorage antigo e escrever no
IndexedDB novo**, nunca simplesmente trocar o backend.

### 5. Nunca confiar em edição sem rodar o app de verdade depois
Regra 3 da seção 4 do REGISTRO.pdf, e vale igual aqui: depois de editar
`game-logic.ts` ou `save-system.ts`, rode `npm run build` (ou `npx tsc --noEmit`
no mínimo) e abra o app no navegador. Um `git diff` limpo não é prova de que o
jogo funciona.

### 6. Toda sessão que altera lógica do jogo termina com uma entrada registrada
Sessão que mexe em regras de negócio (dinheiro, frota, contratos, save) deve
deixar um rastro — um commit com mensagem clara, no mínimo. Se este projeto
voltar a manter um REGISTRO.md/REGISTRO.pdf de sessões, seguir o mesmo padrão:
contexto do pedido, o que foi de fato corrigido/constatado, como foi validado,
e qual é o próximo passo real.

## Sobre a migração app.html → Next.js

Este é um trabalho em fases, não um port de uma vez só — o `app.html` tem mais de
150 funções e ~40 telas/modais diferentes. O que já foi extraído:

- `src/lib/game-logic.ts` — `MACHINES` (frota inicial), `CONTRACT_POOL` (40
  arquétipos), `CONTRACTS` (contratos ativos), `SEDES_DATA`, constantes de risco/
  seguro/impostos/reputação, e as funções puras de cálculo (produtividade,
  envelhecimento de frota, exposição a risco, disponibilidade de máquina).
- `src/lib/save-system.ts` — save/restore via `localStorage`, com os mesmos
  gatilhos do original (`setInterval` 30s, `beforeunload`, `visibilitychange`,
  `pagehide`).
- `src/lib/useGameState.tsx` — ponte entre os dois acima e os componentes React
  (não existia equivalente disso no app.html, que usava variáveis globais mutáveis
  direto).
- `src/components/Hud.tsx`, `Frota.tsx`, `Contratos.tsx` — portas de
  `renderPainelComando()`, `renderMaquinasList()` e `renderContratosList()`.

**Pendente (não inventar, verificar no `app.html` antes de portar):** sistema de
Sedes completo (compra, zoom de foto, celebração), sistema de Missões/Campanhas
(`MISSOES_POR_SEDE`), Loja (compra/financiamento/troca), Manutenção (agendada,
oficina parceira, reparo de emergência), decisão de risco durante o contrato,
eventos de contrato, Consultor, quebra de máquina dramática, diário de notícias,
telas de cadastro/login. Cada uma dessas tem lógica de negócio própria e não deve
ser "inventada de novo" — sempre extrair do `app.html` real, nunca reescrever de
memória.

**Regra de nomenclatura ao portar qualquer peça nova:** manter os mesmos nomes de
variável/campo do `app.html` (`playerCash`, não `cash`; `acceptedContracts`, não
`activeContracts`; etc.). Isso não é estilo — é o que mantém o save compatível e
facilita comparar o comportamento novo com o original linha a linha.

## Paleta Dark Industrial (Tailwind)

Definida em `tailwind.config.js`, nomes fixos — não renomear sem atualizar todo
componente que os referencia:

| Token | Cor | Uso |
|---|---|---|
| `background` | `#0F1115` | fundo da aplicação |
| `card` | `#1E232C` | cards, painéis |
| `primary` | `#FFC400` | destaque, botões de ação, alertas médios |
| `success` | `#22C55E` | status bom, confirmações |
| `danger` | `#EF4444` | risco alto, erro, máquina crítica |
