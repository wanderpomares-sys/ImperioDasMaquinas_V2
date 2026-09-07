'use client';

// Porta de renderMaquinasList() (app.html linhas ~3310-3356). Mesma regra de
// exibição: idade real (m.idadeDias, a mesma que envelhecerFrota() incrementa),
// condição real (m.health), alerta de manutenção vencida acima de
// DIAS_GRACA_MANUTENCAO_BASICA dias sem revisão.

import Image from 'next/image';
import { useGameState } from '@/lib/useGameState';
import { DIAS_GRACA_MANUTENCAO_BASICA } from '@/lib/game-logic';
import type { Machine } from '@/lib/game-logic';

function idadeTexto(idadeDias: number): string {
  const idadeMeses = Math.floor(idadeDias / 30);
  if (idadeMeses >= 12) return (idadeDias / 365).toFixed(1) + ' anos';
  if (idadeMeses <= 1) return idadeMeses === 1 ? '1 mês' : 'menos de 1 mês';
  return idadeMeses + ' meses';
}

function seloCondicao(m: Machine): string {
  if (m.quebrada) return '💥 QUEBRADA';
  if (m.health >= 75) return '🟢 Boa';
  if (m.health >= 45) return '🟡 Atenção';
  return '🔴 Crítica';
}

const barColor: Record<Machine['status'], string> = {
  green: 'bg-success',
  amber: 'bg-primary',
  red: 'bg-danger',
};

export default function Frota() {
  const { machines } = useGameState();
  const entries = Object.entries(machines);

  if (entries.length === 0) {
    return <div className="p-4 text-sm text-white/50">Nenhuma máquina na frota ainda.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {entries.map(([key, m]) => {
        const semManut = m.diasDesdeUltimaManutencao || 0;
        const alertaManut = semManut > DIAS_GRACA_MANUTENCAO_BASICA;

        return (
          <div
            key={key}
            className="flex gap-3 rounded-xl bg-card p-3"
            style={m.quebrada ? { boxShadow: 'inset 0 0 0 1.5px rgba(239,68,68,.6)' } : undefined}
          >
            <div
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/30"
              style={m.quebrada ? { filter: 'grayscale(.5) brightness(.6)' } : undefined}
            >
              <Image src={m.thumb} alt={m.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-white">{m.name}</div>
              <div className={`text-xs ${m.quebrada ? 'font-black text-danger' : 'text-white/60'}`}>
                {m.cat} · {seloCondicao(m)}
              </div>
              <div className="text-xs text-white/60">
                Idade: {idadeTexto(m.idadeDias || 0)} · {m.hours}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${barColor[m.status]}`} style={{ width: `${m.health}%` }} />
                </div>
                <span className="text-xs font-bold text-white/70">{m.health}%</span>
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-primary">
                📍 {m.task} — {m.location}
              </div>
              {alertaManut && (
                <div className="mt-1 text-xs font-semibold text-danger">⚠️ {semManut} dias sem manutenção</div>
              )}
              {m.apelido && <div className="mt-1 text-xs text-white/40">Apelido: {m.apelido}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
