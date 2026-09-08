import Hud from '@/components/Hud';
import Frota from '@/components/Frota';
import AcompanhamentoDeObra from '@/components/AcompanhamentoDeObra';

export default function HubPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-8 bg-[#0F1218] min-h-screen font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@700&display=swap');`}</style>
      
      <header className="relative overflow-hidden rounded-2xl bg-[#1A1F29] border-2 border-[#FFC400] p-6">
        <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(90deg,#FFC400_0_20px,#000_20px_40px)]" />
        <div className="absolute -right-10 -top-10 opacity-10 text-8xl">🚜</div>
        
        <h1 className="mt-2 text-6xl leading-[0.85] tracking-tighter text-[#FFC400] [font-family:'Anton',sans-serif] [text-shadow:5px_5px_0_#000,0_0_20px_rgba(255,196,0,0.3)]">
          IMPÉRIO<br/>DAS<br/>MÁQUINAS
        </h1>
        <p className="mt-4 inline-block bg-[#FFC400] px-3 py-1 text-xs font-black tracking-[0.3em] text-black [font-family:'JetBrains_Mono',monospace]">
          PAINEL DE COMANDO — HUB v2.0
        </p>
      </header>

      {/* HUD - aqui dentro tem que estar os botões */}
      <section>
        <Hud />
      </section>

      {/* SE OS BOTÕES NÃO APARECEREM NO HUD, vamos forçar eles aqui */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <button className="rounded-xl border-2 border-[#FFC400]/50 bg-[#1A1F29] p-4 text-left font-black text-white hover:bg-[#FFC400] hover:text-black transition">
          <span className="block text-2xl">🏪</span>
          <span className="text-sm">LOJA</span>
        </button>
        <button className="rounded-xl border-2 border-[#FFC400]/50 bg-[#1A1F29] p-4 text-left font-black text-white hover:bg-[#FFC400] hover:text-black transition">
          <span className="block text-2xl">🔧</span>
          <span className="text-sm">MANUTENÇÃO</span>
        </button>
        <button className="rounded-xl border-2 border-[#FFC400]/50 bg-[#1A1F29] p-4 text-left font-black text-white hover:bg-[#FFC400] hover:text-black transition">
          <span className="block text-2xl">📜</span>
          <span className="text-sm">CONTRATOS</span>
        </button>
        <button className="rounded-xl border-2 border-[#FFC400]/50 bg-[#1A1F29] p-4 text-left font-black text-white hover:bg-[#FFC400] hover:text-black transition">
          <span className="block text-2xl">🏗️</span>
          <span className="text-sm">OBRAS</span>
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-widest text-[#FFC400] [font-family:'JetBrains_Mono',monospace]">MINHA FROTA</h2>
        <Frota />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-widest text-[#FFC400] [font-family:'JetBrains_Mono',monospace]">ACOMPANHAMENTO DE OBRA</h2>
        <AcompanhamentoDeObra />
      </section>
    </main>
  );
}
