'use client';

// ============================================================================
// AcompanhamentoDeObra — sucessor visual de Contratos.tsx, a pedido do
// Wanderson: upgrade pro padrão visual "Dark Industrial premium". A LÓGICA não
// muda: continua lendo acceptedContracts (o mesmo array que app.html enche em
// aceitarContrato(), linha ~3475) e CONTRACTS pro risco/valor originais do
// contrato. Nada aqui inventa número de negócio novo — dias restantes, risco e
// "Dia X/Y" vêm direto de diasDecorridos/prazoDias/risk, os mesmos campos do
// app.html original.
//
// A única coisa genuinamente nova aqui é a "linha do tempo" de 4 etapas
// (Terraplenagem/Fundação/Estrutura/Finalização) — o app.html NÃO modela obra em
// etapas discretas, só em % de progresso contínuo (ac.progress). Essa timeline é
// uma camada de apresentação derivada de ac.progress em quartis (0-25/25-50/
// 50-75/75-100), não um dado novo persistido — se um dia o jogo ganhar etapas de
// verdade (com regras próprias por tipo de obra), essa derivação deve ser
// substituída pelo dado real, não mantida como fonte de verdade.
// ============================================================================

import { useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { useGameState } from '@/lib/useGameState';
import { fmt, MACHINES as MACHINES_TEMPLATE } from '@/lib/game-logic';
import type { AcceptedContract, RiskLevel } from '@/lib/game-logic';
import missoesSedeData from '../../public/data/missoes_sede.json';

const ETAPAS = ['Terraplenagem', 'Fundação', 'Estrutura', 'Finalização'] as const;

// ============================================================================
// Rota da sede — tira visual dos 5 níveis de sede (Barracão > Garagem >
// Regional > Filial > Império), lida direto de public/data/missoes_sede.json.
// É só apresentação: quem decide o nível atual continua sendo
// player.playerSedeNivel (já existe em game-logic.ts/SEDES_DATA desde a
// extração do app.html). Compra de sede, requisitos de missão por sede
// (MISSOES_POR_SEDE do app.html) e resgate de recompensa continuam
// "Pendente" — não inventados aqui, ver CLAUDE.md.
// ============================================================================
interface MissaoSede {
  id: number;
  titulo: string;
  objetivo: string;
  imagem: string;
  rendimento: string;
}

const MISSOES_SEDE = (missoesSedeData as { missoes: MissaoSede[] }).missoes;

function RotaDaSede({ nivelAtual }: { nivelAtual: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#FFC400]/20 bg-[#1E232C]/80 p-5 shadow-[0_0_30px_rgba(255,196,0,0.1)] backdrop-blur-xl md:p-7">
      <div className="text-sm font-black uppercase tracking-widest text-[#FFC400]/60">Rota da sede</div>
      <p className="mt-1 text-xs text-white/40">
        Do barracão ao império — cada nível libera capacidade e rendimento novos.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {MISSOES_SEDE.map((m) => {
          const concluido = m.id < nivelAtual;
          const atual = m.id === nivelAtual;
          const bloqueado = m.id > nivelAtual;

          return (
            <motion.div
              key={m.id}
              whileHover={bloqueado ? undefined : { scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className={`relative overflow-hidden rounded-xl border bg-black/20 ${
                atual
                  ? 'border-[#FFC400] shadow-[0_0_20px_rgba(255,196,0,0.35)]'
                  : concluido
                    ? 'border-[#22C55E]/40'
                    : 'border-white/10'
              }`}
            >
              <div className="relative h-28 w-full">
                <Image
                  src={m.imagem}
                  alt={m.titulo}
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                  className={`object-cover transition ${bloqueado ? 'opacity-40 grayscale' : ''}`}
                />

                {atual && (
                  <span className="absolute right-2 top-2 rounded-full bg-[#FFC400] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-black">
                    Atual
                  </span>
                )}
                {concluido && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] text-[10px] font-black text-black">
                    ✓
                  </span>
                )}
                {bloqueado && <span className="absolute right-2 top-2 text-sm">🔒</span>}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#FFC400]">{m.rendimento}</div>
                  <div className="text-xs font-bold text-white">{m.titulo.replace(/^Nível \d+ - /, '')}</div>
                </div>
              </div>
              <div className="p-2.5 text-[11px] text-white/50">{m.objetivo}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const RISCO_COR: Record<RiskLevel, { texto: string; fundo: string; borda: string; label: string }> = {
  low: { texto: 'text-[#22C55E]', fundo: 'bg-[#22C55E]/10', borda: 'border-[#22C55E]/30', label: 'BAIXO' },
  mid: { texto: 'text-[#F97316]', fundo: 'bg-[#F97316]/10', borda: 'border-[#F97316]/30', label: 'MÉDIO' },
  high: { texto: 'text-[#EF4444]', fundo: 'bg-[#EF4444]/10', borda: 'border-[#EF4444]/30', label: 'ALTO' },
};

function ProgressoCircular({ progress }: { progress: number }) {
  const size = 148;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const motionProgress = useMotionValue(0);
  const displayValue = useTransform(motionProgress, (v) => Math.round(v));
  const dashoffset = useTransform(motionProgress, (v) => circumference * (1 - v / 100));

  useEffect(() => {
    const controls = animate(motionProgress, progress, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#FFC400"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-3xl font-black text-[#FFC400]">{displayValue}</motion.span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">progresso</span>
      </div>
    </div>
  );
}

function LinhaDoTempo({ progress }: { progress: number }) {
  const stageIndex = Math.min(ETAPAS.length - 1, Math.floor(progress / 25));

  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-1 bottom-1 w-px bg-white/10" />
      <div className="space-y-5">
        {ETAPAS.map((etapa, i) => {
          const stageStart = i * 25;
          const stageEnd = (i + 1) * 25;
          const concluido = progress >= stageEnd;
          const emProgresso = !concluido && i === stageIndex;
          const subProgresso = emProgresso ? Math.round(((progress - stageStart) / 25) * 100) : 0;

          return (
            <div key={etapa} className="relative">
              <span
                className="absolute -left-6 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full text-[10px] font-black"
                style={{
                  backgroundColor: concluido ? '#22C55E' : emProgresso ? '#FFC400' : 'rgba(255,255,255,0.1)',
                  color: concluido || emProgresso ? '#0F1115' : 'rgba(255,255,255,0.4)',
                }}
              >
                {concluido ? '✓' : i + 1}
              </span>
              <div className="text-sm font-bold text-white">{etapa}</div>
              <div
                className={`text-xs font-black uppercase tracking-wide ${
                  concluido ? 'text-[#22C55E]' : emProgresso ? 'text-[#FFC400]' : 'text-white/30'
                }`}
              >
                {concluido ? 'CONCLUÍDO' : emProgresso ? `${subProgresso}% EM PROGRESSO` : 'PENDENTE'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardObra({ ac }: { ac: AcceptedContract }) {
  const { contracts, machines, avancarDia } = useGameState();
  const [mostrarMaquinas, setMostrarMaquinas] = useState(false);

  const contrato = contracts[ac.key];
  const risco = RISCO_COR[contrato?.risk ?? 'mid'];
  const diasRestantes = Math.max(0, ac.prazoDias - ac.diasDecorridos);

  // Foto real de uma escavadeira CAT (já existe em MACHINES — Escavadeira Hidráulica CAT 320D),
  // priorizando a máquina de verdade alocada nesta obra quando ela for do tipo escavadeira.
  const maquinaEscavadeira =
    ac.machineKeys.map((k) => machines[k]).find((m) => m?.tipoKey === 'escavadeira') ||
    MACHINES_TEMPLATE.escavadeira;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-[#FFC400]/20 bg-[#1E232C]/80 p-5 shadow-[0_0_30px_rgba(255,196,0,0.1)] backdrop-blur-xl md:p-7"
    >
      {/* textura carbono sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 8px)',
        }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <ProgressoCircular progress={ac.progress} />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black uppercase tracking-widest text-[#FFC400]">{ac.name}</h3>
          <div className="mt-1 text-sm text-white/50">{fmt(ac.value)} · Dia {ac.diasDecorridos}/{ac.prazoDias}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#FFC400]/30 bg-[#FFC400]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#FFC400]">
              {diasRestantes} dias restantes
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${risco.borda} ${risco.fundo} ${risco.texto}`}>
              Risco {risco.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wide text-white/50">
              Dia {ac.diasDecorridos}/{ac.prazoDias}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-7 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.1fr]">
        <LinhaDoTempo progress={ac.progress} />

        <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <div className="relative h-36 w-full">
            <Image src={maquinaEscavadeira.photo} alt={maquinaEscavadeira.name} fill sizes="400px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="text-xs font-black uppercase tracking-widest text-[#FFC400]">Etapa atual</div>
              <div className="text-sm font-bold text-white">{maquinaEscavadeira.name}</div>
            </div>
          </div>
          {mostrarMaquinas && (
            <div className="space-y-1 p-3 text-xs text-white/60">
              {ac.machineKeys.map((k) => (
                <div key={k}>🚜 {machines[k]?.name ?? k}</div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => avancarDia(ac.key)}
          disabled={ac.progress >= 100}
          className="flex-1 rounded-xl bg-[#FFC400] py-3 text-sm font-black uppercase tracking-widest text-black transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ac.progress >= 100 ? 'Obra concluída' : 'Avançar dia'}
        </button>
        <button
          onClick={() => setMostrarMaquinas((v) => !v)}
          className="flex-1 rounded-xl border border-[#FFC400]/30 py-3 text-sm font-black uppercase tracking-widest text-[#FFC400] transition hover:bg-[#FFC400]/10"
        >
          {mostrarMaquinas ? 'Ocultar máquinas' : 'Ver máquinas na obra'}
        </button>
      </div>
    </motion.div>
  );
}

export default function AcompanhamentoDeObra() {
  const { player, contracts, aceitarContrato } = useGameState();
  const { acceptedContracts } = player;

  if (acceptedContracts.length === 0) {
    const primeiroDisponivel = Object.entries(contracts).find(([, c]) => c.state === 'DISPONIVEL' && c.hasMachine);

    return (
      <div className="space-y-6">
        <RotaDaSede nivelAtual={player.playerSedeNivel} />

        <div className="relative overflow-hidden rounded-2xl border border-[#FFC400]/20 bg-[#1E232C]/80 p-8 text-center shadow-[0_0_30px_rgba(255,196,0,0.1)] backdrop-blur-xl">
          <div className="text-sm font-black uppercase tracking-widest text-[#FFC400]/60">Acompanhamento de obra</div>
          <p className="mt-2 text-white/60">Nenhuma obra em andamento no momento.</p>
          {primeiroDisponivel && (
            <button
              onClick={() => aceitarContrato(primeiroDisponivel[0])}
              className="mt-5 rounded-xl bg-[#FFC400] px-6 py-3 text-sm font-black uppercase tracking-widest text-black"
            >
              Aceitar &ldquo;{primeiroDisponivel[1].name}&rdquo;
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RotaDaSede nivelAtual={player.playerSedeNivel} />

      {acceptedContracts.map((ac) => (
        <CardObra key={ac.key} ac={ac} />
      ))}
    </div>
  );
}
