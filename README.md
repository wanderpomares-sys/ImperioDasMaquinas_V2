# Império das Máquinas

Simulador de empresa de máquinas pesadas. Este repositório está em transição de
um monolito HTML único para uma aplicação Next.js — os dois convivem hoje.

## Estrutura do repositório

```
app.html                  ← jogo original, monolito completo (backup, intocado)
REGISTRO.pdf              ← histórico das 37 sessões de desenvolvimento do jogo original
CLAUDE.md                 ← regras de ouro para quem for mexer no código (leia primeiro)

src/
  app/                    ← Next.js App Router
    layout.tsx            ← shell da aplicação, monta o GameProvider
    page.tsx              ← página do Hub (Caixa/Frota/Obras/Reputação + listas)
    globals.css           ← reset + Tailwind
  lib/
    game-logic.ts         ← dados do jogo (MACHINES, CONTRACT_POOL, CONTRACTS,
                             SEDES_DATA, constantes de risco/seguro/impostos) e
                             funções puras de cálculo — nenhuma dependência de React
    save-system.ts        ← save/restore via localStorage, mesmas chaves e mesmo
                             shape de dado do app.html original
    useGameState.tsx       ← Context/hook que liga game-logic + save-system aos
                             componentes React (ponte que não existia no monolito)
  components/
    Hud.tsx               ← painel de comando (Caixa, Frota, Obras, Reputação,
                             Próxima conquista)
    Frota.tsx             ← lista de máquinas (saúde, idade, status, manutenção)
    Contratos.tsx         ← contratos disponíveis + ação de aceitar

public/assets/sedes/      ← fotos das 5 sedes, extraídas do base64 embutido no
                             app.html original (ver "Sobre as imagens" abaixo)
```

## Por que essa divisão

O `app.html` original é um arquivo único de ~2.400 linhas de lógica de jogo com
mais de 150 funções, todas manipulando ~30 variáveis globais mutáveis
(`MACHINES`, `playerCash`, `acceptedContracts`, etc.) e renderizando telas via
`innerHTML`. Isso funciona, mas é difícil de testar em partes, difícil de dar
manutenção com segurança, e impossível de reaproveitar componentes.

A migração separa em três camadas:

1. **Dados e regras puras** (`game-logic.ts`) — o que o jogo *é*: preços, riscos,
   fórmulas de produtividade e desgaste. Sem `localStorage`, sem DOM, sem React.
   Pode ser testado isoladamente.
2. **Persistência** (`save-system.ts`) — como o estado sobrevive a um refresh ou
   fechamento do app. Mesmas chaves de `localStorage` do jogo original, de
   propósito: quem já tem um save gravado pelo `app.html` não perde progresso.
3. **UI** (`components/`) — como o estado vira tela. Componentes React puros que
   leem do `useGameState()`.

## Estado da migração

**Portado e validado** (build + typecheck + teste funcional em navegador real via
Playwright: aceitar contrato → salvar → recarregar → estado restaurado):
- Frota inicial (5 máquinas) e seus dados reais (saúde, idade, localização)
- Catálogo de 40 arquétipos de contrato + 5 contratos ativos iniciais
- Cálculo de disponibilidade de máquina, seleção de máquina por saúde, fator de
  produtividade, envelhecimento de frota, exposição a risco
- Hud (painel de comando), Frota, Contratos — telas completas
- Save/restore via localStorage com os mesmos gatilhos do original (auto-save a
  cada 30s, `beforeunload`, `visibilitychange`, `pagehide`)

**Ainda no `app.html` apenas** (não inventar do zero — extrair do arquivo
original quando for a vez de portar): Sedes (compra, fotos, celebração),
Missões/Campanhas, Loja (compra/financiamento/troca de máquina), Manutenção
completa (agendada, oficina parceira, reparo de emergência), decisões de risco
durante o contrato, eventos dinâmicos de contrato, o Consultor, quebra de
máquina dramática, diário de notícias, telas de cadastro/login.

Ver `CLAUDE.md` para as regras que valem para qualquer trabalho futuro nesta
migração (por que as chaves de save não podem mudar, por que o teste de retorno
do jogador é obrigatório, etc.).

## Sobre as imagens

As fotos das máquinas e dos contratos no `app.html` original são URLs externas
(Pexels/Unsplash) — foram copiadas como estão para `game-logic.ts`. As 5 fotos de
sede, porém, estavam embutidas como base64 direto no HTML (~380KB no total); elas
foram decodificadas para arquivos reais em `public/assets/sedes/sede-{1..5}.jpg`,
seguindo a prática padrão do Next.js de servir imagens como arquivos estáticos em
vez de strings gigantes no código-fonte. Vídeos de obra (`VIDEO_POR_CONTRATO`) e
imagens de evento (`EVENTO_IMG`), também em base64 no original, ainda não foram
extraídos — ficam para quando as telas que os usam forem portadas.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run build     # build de produção
npx tsc --noEmit  # typecheck isolado
```

Nota: `package.json` está fixado em `next@14.2.35` (última correção de segurança
da série 14.x). Uma eventual migração para o Next 16 é uma decisão separada, não
incluída nesta tarefa.
