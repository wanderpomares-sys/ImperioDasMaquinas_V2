'use client';

// ============================================================================
// Ponte mínima entre game-logic.ts (dados/regras puras) e os componentes React.
// Não existia um equivalente disso no app.html — lá, MACHINES/CONTRACTS/playerCash
// eram variáveis globais mutadas direto pelas funções de render. Em React,
// centralizamos isso num Context pra Hud/Frota/AcompanhamentoDeObra lerem o
// mesmo estado sem duplicar cópias.
// ============================================================================

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  MACHINES as MACHINES_TEMPLATE,
  CONTRACTS as CONTRACTS_TEMPLATE,
  criarEstadoInicial,
  selecionarMaquinasParaContrato,
  maquinasDisponiveisAgora,
  type MachinesState,
  type ContractsState,
  type PlayerState,
} from './game-logic';
import { salvarGameState, restaurarGameState, registerAutoSave } from './save-system';

interface GameContextValue {
  player: PlayerState;
  machines: MachinesState;
  contracts: ContractsState;
  restaurado: boolean;
  aceitarContrato: (key: string) => { ok: boolean; motivo?: string };
  avancarDia: (key: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function cloneMachines(m: MachinesState): MachinesState {
  return JSON.parse(JSON.stringify(m));
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(() => criarEstadoInicial());
  const [machines, setMachines] = useState<MachinesState>(() => cloneMachines(MACHINES_TEMPLATE));
  const [contracts, setContracts] = useState<ContractsState>(() => JSON.parse(JSON.stringify(CONTRACTS_TEMPLATE)));
  const [restaurado, setRestaurado] = useState(false);

  // Guarda a versão mais recente do estado pra o auto-save ler sem re-registrar
  // os listeners a cada mudança (mesmo espírito do app.html: um único conjunto
  // de listeners vivendo pelo tempo de vida da página).
  const latest = useRef({ player, machines, contracts });
  latest.current = { player, machines, contracts };

  // REGRA DE OURO (ver CLAUDE.md e o comentário em save-system.ts): a restauração
  // só pode rodar depois que playerCash e o resto do estado já existem — em React
  // isso é automático porque useState já inicializou tudo antes deste efeito rodar.
  // Isso é a correção definitiva do bug de zona morta temporal da sessão 32 do
  // REGISTRO.pdf: aqui é estruturalmente impossível chamar restaurarGameState()
  // antes do estado existir.
  useEffect(() => {
    const resultado = restaurarGameState(MACHINES_TEMPLATE);
    if (resultado) {
      setPlayer((prev) => ({ ...prev, ...resultado.player }));
      if (resultado.machines) setMachines(resultado.machines);
      if (resultado.contracts) {
        const restauradosContracts = resultado.contracts;
        setContracts((prev) => Object.assign({}, prev, restauradosContracts));
      }
      setRestaurado(true);
    }

    const cleanup = registerAutoSave(() => {
      const snap = latest.current;
      if (snap.player.playerCash > 0) {
        salvarGameState(snap.player, snap.machines, snap.contracts);
      }
    });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aceitarContrato(key: string): { ok: boolean; motivo?: string } {
    const contrato = contracts[key];
    if (!contrato || contrato.state !== 'DISPONIVEL') return { ok: false, motivo: 'Contrato indisponível.' };

    const disponibilidade = maquinasDisponiveisAgora(machines, contrato.requiredMachineKeys);
    if (!disponibilidade.ok) return { ok: false, motivo: disponibilidade.motivo };

    const machineKeys = selecionarMaquinasParaContrato(machines, contrato.requiredMachineKeys);

    setMachines((prev) => {
      const next = cloneMachines(prev);
      machineKeys.forEach((k) => {
        next[k].inContract = true;
        next[k].task = `Em operação — ${contrato.name}`;
      });
      return next;
    });

    setContracts((prev) => ({
      ...prev,
      [key]: { ...prev[key], state: 'EM_ANDAMENTO' as const },
    }));

    setPlayer((prev) => ({
      ...prev,
      acceptedContracts: [
        ...prev.acceptedContracts,
        {
          key,
          name: contrato.name,
          value: contrato.value,
          prazoDias: contrato.prazoDias,
          diasDecorridos: 0,
          progress: 0,
          machineKeys,
          state: 'EM_ANDAMENTO',
        },
      ],
    }));

    return { ok: true };
  }

  // Versão mínima de avancarContrato() (app.html linha ~3883-3969): avança
  // 1 dia de obra e recalcula o progresso linearmente. A função completa do
  // original também sorteia eventos de contrato, risco intercorrente e multa de
  // atraso — isso é Fase 2 da migração (ver CLAUDE.md) e não está aqui ainda.
  // Isso não substitui aquela função: é só o suficiente pra AcompanhamentoDeObra
  // ter dado real (diasDecorridos/progress) pra mostrar em vez de ficar preso em 0%.
  function avancarDia(key: string): void {
    setPlayer((prev) => ({
      ...prev,
      acceptedContracts: prev.acceptedContracts.map((ac) => {
        if (ac.key !== key) return ac;
        const diasDecorridos = (ac.diasDecorridos || 0) + 1;
        const progress = Math.min(100, Math.round((diasDecorridos / ac.prazoDias) * 100));
        const state = diasDecorridos > ac.prazoDias ? ('ATRASADO' as const) : ac.state;
        return { ...ac, diasDecorridos, progress, state };
      }),
    }));
  }

  return (
    <GameContext.Provider value={{ player, machines, contracts, restaurado, aceitarContrato, avancarDia }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState precisa ser usado dentro de <GameProvider>');
  return ctx;
}
