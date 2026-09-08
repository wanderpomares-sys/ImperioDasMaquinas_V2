import Hud from '@/components/Hud';
import Frota from '@/components/Frota';
import AcompanhamentoDeObra from '@/components/AcompanhamentoDeObra';

export default function HubPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-8 bg-[#0F1218] min-h-screen">
      <header className="relative overflow-hidden rounded-2xl bg-[#1A1F29] border-2 border-[#FFC400]/30 p-6">
        {/* faixa de segurança em cima */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(90deg,#FFC400_0_20px,#000_20px_40px)]" />
        
        <h1 className="mt-2 text-5xl font-black leading-[0.9] tracking-tighter text-[#FFC400] [text-shadow:4px_4px_0_#000]">
          IMPÉRIO<br/>DAS<br/>MÁQUINAS
        </h1>
        <p className="mt-3 text-sm font-bold tracking-[0.2em] text-[#FF8A00]">
          PAINEL DE COMANDO — HUB
        </p>
      </header>

      <section>
        <Hud />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Minha Frota</h2>
        <Frota />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Acompanhamento de Obra</h2>
        <AcompanhamentoDeObra />
      </section>
    </main>
  );
}