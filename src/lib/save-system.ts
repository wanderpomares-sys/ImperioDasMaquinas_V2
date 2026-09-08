// ============================================================================
// SAVE SYSTEM — extraído de app.html (funções salvarGameState/restaurarGameState/
// checkExistingAccount, e os listeners de auto-save no fim do arquivo).
//
// DECISÃO IMPORTANTE (corrige um pedido do briefing original): o app.html usa
// localStorage, não IndexedDB. Os jogadores atuais já têm saves gravados nas
// chaves abaixo — trocar para IndexedDB agora quebraria 100% dos saves
// existentes, o que viola a regra de ouro "nunca quebrar o save do jogador".
// Se um dia for necessário migrar para IndexedDB, é preciso escrever uma rotina
// de migração que LÊ do localStorage antigo e ESCREVE no IndexedDB novo — nunca
// simplesmente trocar o backend de storage.
//
// AS DUAS CHAVES SÃO EXATAMENTE AS DO JOGO ORIGINAL. NÃO RENOMEAR.
// ============================================================================

import type { MachinesState, ContractsState, PlayerState } from './game-logic';

export const STORAGE_KEY = 'imperioDasMaquinas_conta';
export const GAME_STATE_KEY = 'IMPERIO_GAME_STATE';

export interface ContaSalva {
  companyName: string;
  ownerName: string;
  email: string;
  logo: string;
}

// Shape gravado no localStorage — mesmos nomes de campo do app.html (versao:3).
// Se um campo for adicionado aqui, ele TEM que ter um fallback em restaurarGameState,
// senão um save antigo sem esse campo vira `undefined` na tela (foi exatamente o bug
// da sessão 36 do REGISTRO.pdf: Object.assign sobrescrevendo campos que não existiam
// no formato antigo).
export interface GameStateSaved {
  versao: number;
  playerCash: number;
  playerPatrimonio: number;
  playerSedeNivel: number;
  fidelidadeMarcas: Record<string, number>;
  contratosTier3Completos: number;
  objetivosCumpridos: Record<string, boolean>;
  playerBonusAtivos: Record<string, unknown>;
  reputacao: number;
  faturamentoAcumulado: number;
  diasGlobaisDecorridos: number;
  stats: { contratosNoPrazo: number; contratosConcluidos: number; oficinasUsadas: number };
  missoesResgatadas: Record<string, boolean>;
  noticias: unknown[];
  missoesNotificadasConcluidas: Record<string, boolean>;
  maquinasComManutencao: string[];
  acceptedContracts: unknown[];
  completedContracts: unknown[];
  lostContracts: unknown[];
  financiamentosAtivos: unknown[];
  historico: unknown[];
  historicoCaixa: unknown[];
  scheduledMaintenances: unknown[];
  contractsPool: ContractsState;
  maquinas: MachinesState;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// CONTA (empresa/dono/logo) — tela de cadastro/login
// ---------------------------------------------------------------------------

export function salvarConta(conta: ContaSalva): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conta));
    return true;
  } catch {
    // localStorage indisponível — segue sem persistir, igual ao app.html original.
    return false;
  }
}

export function lerConta(): ContaSalva | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContaSalva;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GAME STATE (dinheiro, frota, contratos, histórico...)
// ---------------------------------------------------------------------------

export function salvarGameState(player: PlayerState, machines: MachinesState, contracts: ContractsState): boolean {
  try {
    const gameState: GameStateSaved = {
      versao: 3,
      playerCash: player.playerCash,
      playerPatrimonio: player.playerPatrimonio,
      playerSedeNivel: player.playerSedeNivel,
      fidelidadeMarcas: player.fidelidadeMarcas,
      contratosTier3Completos: player.contratosTier3Completos,
      objetivosCumpridos: player.objetivosCumpridos,
      playerBonusAtivos: player.playerBonusAtivos,
      reputacao: player.reputacao,
      faturamentoAcumulado: player.faturamentoAcumulado,
      diasGlobaisDecorridos: player.diasGlobaisDecorridos,
      stats: player.stats,
      missoesResgatadas: player.missoesResgatadas,
      noticias: player.noticias,
      missoesNotificadasConcluidas: player.missoesNotificadasConcluidas,
      maquinasComManutencao: player.maquinasComManutencao,
      // CORREÇÃO histórica preservada (sessão 32 do REGISTRO.pdf): estes campos já
      // causaram perda de progresso quando ficaram de fora do save.
      acceptedContracts: player.acceptedContracts,
      completedContracts: player.completedContracts,
      lostContracts: player.lostContracts,
      financiamentosAtivos: player.financiamentosAtivos,
      historico: player.historico,
      historicoCaixa: player.historicoCaixa,
      scheduledMaintenances: player.scheduledMaintenances,
      // Salva o catálogo de contratos inteiro (não só o estado do jogador) — senão a
      // regeneração de contratos (regenerarContrato) reseta ao recarregar a página.
      contractsPool: contracts,
      // Salva o objeto MACHINES inteiro (sessão 34: salvar só um subconjunto de campos
      // impede reconstruir máquina comprada por completo).
      maquinas: machines,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    return true;
  } catch (e) {
    console.error('Falha ao salvar:', e);
    return false;
  }
}

export interface RestauracaoResultado {
  player: Partial<PlayerState>;
  machines: MachinesState | null;
  contracts: Partial<ContractsState> | null;
}

// `templatesOriginais` deve ser uma cópia FRESCA (recém-inicializada) de MACHINES —
// é a base que preenche nome/foto/preço quando o save é de um formato antigo que não
// guardava esses campos (bug da sessão 36: Object.assign sobrescrevia a máquina
// inteira, apagando nome/foto que nunca existiram no save antigo).
export function restaurarGameState(templatesOriginais: MachinesState): RestauracaoResultado | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<GameStateSaved>;
    if (!saved) return null;

    const player: Partial<PlayerState> = {
      playerCash: saved.playerCash,
      playerPatrimonio: saved.playerPatrimonio,
      playerSedeNivel: saved.playerSedeNivel || 1,
      fidelidadeMarcas: saved.fidelidadeMarcas || {},
      contratosTier3Completos: saved.contratosTier3Completos || 0,
      objetivosCumpridos: saved.objetivosCumpridos || {},
      playerBonusAtivos: (saved.playerBonusAtivos as PlayerState['playerBonusAtivos']) || {},
      reputacao: saved.reputacao as number,
      faturamentoAcumulado: saved.faturamentoAcumulado || 0,
      diasGlobaisDecorridos: saved.diasGlobaisDecorridos || 0,
      stats: Object.assign({ contratosNoPrazo: 0, contratosConcluidos: 0, oficinasUsadas: 0 }, saved.stats || {}),
      missoesResgatadas: saved.missoesResgatadas || {},
      noticias: saved.noticias || [],
      missoesNotificadasConcluidas: saved.missoesNotificadasConcluidas || {},
      maquinasComManutencao: saved.maquinasComManutencao || [],
      acceptedContracts: (saved.acceptedContracts as PlayerState['acceptedContracts']) || [],
      completedContracts: saved.completedContracts || [],
      lostContracts: saved.lostContracts || [],
      financiamentosAtivos: saved.financiamentosAtivos || [],
      historico: (saved.historico as PlayerState['historico']) || [],
      historicoCaixa: saved.historicoCaixa || [],
      scheduledMaintenances: saved.scheduledMaintenances || [],
    };

    let machines: MachinesState | null = null;
    if (saved.maquinas) {
      // Mesma correção da sessão 36: parte do modelo original intacto, aplica por cima
      // só o que o save realmente tinha. Se a máquina salva não existir no modelo (foi
      // comprada depois) e não tiver `name`, ela não é restaurada — perda pontual de uma
      // entrada antiga incompleta é melhor que mostrar "undefined" na tela.
      machines = {};
      Object.keys(saved.maquinas).forEach((k) => {
        const dadosSalvos = saved.maquinas![k];
        if (templatesOriginais[k]) {
          machines![k] = Object.assign({}, templatesOriginais[k], dadosSalvos);
        } else if (dadosSalvos && dadosSalvos.name) {
          machines![k] = dadosSalvos;
        }
      });
    }

    const contracts = saved.contractsPool || null;

    return { player, machines, contracts };
  } catch (e) {
    console.error('Falha ao restaurar:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// GATILHOS DE AUTO-SAVE
//
// Mesma redundância do app.html (sessão 32 e 35 do REGISTRO.pdf): beforeunload
// sozinho não é confiável em PWA instalado no celular (o sistema pode matar o
// processo sem disparar esse evento). visibilitychange (hidden) e pagehide cobrem
// esse caso. O intervalo de 30s é a rede de segurança de fundo.
//
// IMPORTANTE (lição da sessão 32): NUNCA registre esses listeners, nem chame
// restaurarGameState(), antes de todo o estado do jogador estar inicializado.
// No app.html original isso causou um ReferenceError de zona morta temporal
// (checkExistingAccount rodava antes de `let playerCash` ser declarado) que ficava
// silenciosamente engolido pelo try/catch — o restore nunca funcionou em 31 sessões
// sem ninguém perceber. Em React isso é resolvido chamando `registerAutoSave` só
// dentro de um useEffect que roda depois do estado inicial (useState) já existir —
// nunca em module scope, nunca antes do primeiro render.
// ---------------------------------------------------------------------------

export function registerAutoSave(getSnapshot: () => boolean | void, intervalMs = 30000): () => void {
  const interval = setInterval(() => {
    getSnapshot();
  }, intervalMs);

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') getSnapshot();
  };
  const onPageHide = () => getSnapshot();
  const onBeforeUnload = () => getSnapshot();

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('beforeunload', onBeforeUnload);

  // Cleanup — o app.html original nunca precisou disso (era um único <script>
  // que vivia pelo tempo de vida da página inteira), mas em React o componente
  // que chama isso pode desmontar, então devolvemos a função de limpeza.
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('beforeunload', onBeforeUnload);
  };
}
