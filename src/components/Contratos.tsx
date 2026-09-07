'use client';

// Porta de renderContratosList() (app.html linhas ~3359-3380). Lista só os
// contratos com state === 'DISPONIVEL' — igual ao original — e usa
// aceitarContrato() (useGameState.tsx) pra reproduzir a mesma checagem de
// disponibilidade real de máquina (maquinasDisponiveisAgora) antes de aceitar.

import { useState } from 'react';
import Image from 'next/image';
import { useGameState } from '@/lib/useGameState';
import { fmt } from '@/lib/game-logic';
import type { RiskLevel } from '@/lib/game-logic';

const riskIcon: Record<RiskLevel, string> = { low: '🟢', mid: '🟡', high: '🔴' };
const riskColor: Record<RiskLevel, string> = { low: 'text-success', mid: 'text-primary', high: 'text-danger' };

export default function Contratos() {
  const { contracts, aceitarContrato } = useGameState();
  const [aviso, setAviso] = useState<string | null>(null);

  const disponiveis = Object.entries(contracts).filter(([, c]) => c.state === 'DISPONIVEL');

  function onAceitar(key: string) {
    const resultado = aceitarContrato(key);
    setAviso(resultado.ok ? null : resultado.motivo || 'Não foi possível aceitar este contrato.');
  }

  if (disponiveis.length === 0) {
    return <div className="p-4 text-sm text-white/50">Nenhum contrato disponível no momento.</div>;
  }

  return (
    <div>
      {aviso && (
        <div className="mb-3 rounded-lg bg-danger/15 px-3 py-2 text-sm font-semibold text-danger">🔒 {aviso}</div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {disponiveis.map(([key, c]) => (
          <div key={key} className="overflow-hidden rounded-xl bg-card">
            <div className="relative h-32 w-full">
              <Image src={c.photo} alt={c.name} fill sizes="400px" className="object-cover" />
              {!c.hasMachine && (
                <span className="absolute right-2 top-2 rounded-md bg-danger px-2 py-0.5 text-xs font-bold text-white">
                  falta máquina
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-bold text-white">{c.name}</div>
                <div className="shrink-0 text-sm font-extrabold text-primary">{fmt(c.value)}</div>
              </div>
              <div className="mt-1 text-xs text-white/60">
                🏢 {c.company} · 📍 {c.location}
              </div>
              <div className={`mt-2 inline-block text-xs font-bold ${riskColor[c.risk]}`}>
                {riskIcon[c.risk]} {c.riskLabel}
              </div>
              <div className="mt-1 text-xs text-white/50">Prazo: {c.prazo}</div>
              <button
                onClick={() => onAceitar(key)}
                disabled={!c.hasMachine}
                className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-extrabold text-background disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
              >
                {c.hasMachine ? 'Aceitar contrato' : c.missing || 'Máquina indisponível'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
