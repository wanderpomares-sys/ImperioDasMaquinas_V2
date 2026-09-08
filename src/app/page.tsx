import Link from 'next/link';
import Hud from '@/components/Hud';
import Frota from '@/components/Frota';
import AcompanhamentoDeObra from '@/components/AcompanhamentoDeObra';

export default function HubPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8 bg-[#0F1218] min-h-screen pb-10">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');`}</style>

      <header className="relative overflow-hidden rounded-2xl bg-[#1A1F29] border-2 border-[#FFC400]/30 p-6">
        <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(90deg,#FFC400_0_20px,#000_20px_40px)]" />
        <h1 className="mt-2 text-5xl font-black leading-[0.95] tracking-[0.02em] text-[#FFC400] [font-family:'Anton',sans-serif] [text-shadow:3px_3px_0_#000]">
          IMPÉRIO<br/>DAS<br/>MÁQUINAS
        </h1>
        <p className="mt-3 text-sm font-bold tracking-[0.2em] text-[#FF8A00]">
          PAINEL DE COMANDO — HUB
        </p>
      </header>

      <section><Hud /></section>

      {/* BOTÕES QUE ESTAVAM FALTANDO - agora dentro da página, sem risco */}
      <section>
        <h2 className="mb-3 text-xs font-bold tracking-[0.2em] text-white/40">NAVEGAÇÃO</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          <Link href="/loja" className="rounded-xl border border-[#FFC400]/30 bg-[#1A1F29] p-4 text-center hover:bg-[#FFC400] hover:text-black transition group">
            <div className="text-2xl">🏪</div>
            <div className="mt-1 text-[11px] font-black tracking-widest">LOJA</div>
          </Link>
          <Link href="/manutencao" className="rounded-xl border border-[#FFC400]/30 bg-[#1A1F29] p-4 text-center hover:bg-[#FFC400] hover:text-black transition">
            <div className="text-2xl">🔧</div>
            <div className="mt-1 text-[11px] font-black tracking-widest">OFICINA</div>
          </Link>
          <Link href="/contratos" className="rounded-xl border border-[#FFC400]/30 bg-[#1A1F29] p-4 text-center hover:bg-[#FFC400] hover:text-black transition">
            <div className="text-2xl">📜</div>
            <div className="mt-1 text-[11px] font-black tracking-widest">CONTRATOS</div>
          </Link>
          <Link href="/administracao" className="rounded-xl border border-[#FFC400]/30 bg-[#1A1F29] p-4 text-center hover:bg-[#FFC400] hover:text-black transition">
            <div className="text-2xl">🏢</div>
            <div className="mt-1 text-[11px] font-black tracking-widest">ADM</div>
          </Link>
          <Link href="/missoes" className="rounded-xl border border-[#FFC400]/30 bg-[#1A1F29] p-4 text-center hover:bg-[#FFC400] hover:text-black transition">
            <div className="text-2xl">🎯</
