'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/lib/useGameState';
import { fmt, REQUISITOS_SEDE, SEDES_DATA } from '@/lib/game-logic';

export default function Hud() {
  const { player, machines } = useGameState();
  const { playerCash, reputacao, acceptedContracts, playerSedeNivel } = player;
  const caixaAnterior = useRef<number | null>(null);
  const [variacao, setVariacao] = useState(0);
  useEffect(() => {
    if (caixaAnterior.current === null) {
      caixaAnterior.current = playerCash;
      setVariacao(0);
    } else {
      setVariacao(playerCash - caixaAnterior.current);
      caixaAnterior.current = playerCash;
    }
  }, [playerCash]);

  const listaMaquinas = Object.values(machines);
  const fVerde = listaMaquinas.filter((m) => m.status === 'green').length;
  const fAmbar = listaMaquinas.filter((m) => m.status === 'amber').length;
  const fVerm = listaMaquinas.filter((m) => m.status === 'red').length;
  const oAndamento = acceptedContracts.filter((ac) => ac.state === 'EM_ANDAMENTO').length;
  const oRisco = acceptedContracts.filter((ac) => ac.state === 'EM_RISCO').length;
  const oAtraso = acceptedContracts.filter((ac) => ac.state === 'ATRASADO').length;
  const sedeAlvo = playerSedeNivel + 1;
  const req = REQUISITOS_SEDE[sedeAlvo];
  const maximo =!req;
  const repOk = req? reputacao >= req.reputacao : false;
  const cashOk = req? playerCash >= req.custo : false;
  const pode = repOk && cashOk;

  const card = "rounded-xl bg-[#1A1F29] border border-[#FFC400]/20 p-4";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <div className={card}>
        <div className="text-xs uppercase tracking-wide text-[#FFC400]/70">Caixa</div>
        <div className="mt-1 text-xl font-extrabold text-white">{fmt(playerCash)}</div>
        <div className="mt-1 text-xs font-semibold" style={{ color: variacao > 0? '#22C55E' : variacao < 0? '#EF4444' : 'rgba(255,255,255,.5)' }}>
          {variacao > 0? `▲ +${fmt(variacao)}` : variacao < 0? `▼ ${fmt(variacao)}` : '— sem mudança'} desde última visita
        </div>
      </div>
      <div className={card}>
        <div className="text-xs uppercase tracking-wide text-[#FFC400]/70">Frota</div>
        <div className="mt-1 text-xl font-extrabold text-white">{listaMaquinas.length} máquina{listaMaquinas.length === 1? '' : 's'}</div>
        <div className="mt-2 flex gap-2 text-xs font-bold">
          <span className="text-[#22C55E]">{fVerde}</span>
          <span className="text-[#FFC400]">{fAmbar}</span>
          <span className="text-[#EF4444]">{fVerm}</span>
        </div>
      </div>
      <div className={card}>
        <div className="text-xs uppercase tracking-wide text-[#FFC400]/70">Obras</div>
        <div className="mt-1 text-xl font-extrabold text-white">{acceptedContracts.length} em andamento</div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
          <span className="text-white/60">{oAndamento} ok</span>
          {oRisco > 0 && <span className="text-[#FFC400]">{oRisco} risco</span>}
          {oAtraso > 0 && <span className="text-[#EF4444]">{oAtraso} atraso</span>}
        </div>
      </div>
      <div className={card}>
        <div className="text-xs uppercase tracking-wide text-[#FFC400]/70">Reputação</div>
        <div className="mt-1 text-xl font-extrabold text-white">{reputacao} / 150</div>
      </div>
      <div className={card}>
        {maximo? (
          <><div className="text-xs uppercase tracking-wide text-white/50">🏆 Império</div><div className="mt-1 text-sm font-extrabold text-[#22C55E]">Nível máximo</div></>
        ) : (
          <>
            <div className="text-xs uppercase tracking-wide text-[#FFC400]/70">🎯 Próxima conquista</div>
            <div className="mt-1 text-sm font-extrabold text-white">{SEDES_DATA[sedeAlvo].nome}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#FFC400]" style={{ width: `${Math.round((Number(repOk) + Number(cashOk)) * 50)}%` }} />
            </div>
            <div className="mt-1 text-xs text-white/50">{pode? '✅ Tudo pronto' : [!repOk && req? `faltam ${req.reputacao - reputacao} rep` : null,!cashOk && req? `faltam ${fmt(req.custo - playerCash)}` : null].filter(Boolean).join(' · ')}</div>
          </>
        )}
      </div>
    </div>
  );
}
