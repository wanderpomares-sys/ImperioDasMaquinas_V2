import Hud from '@/components/Hud';
import Frota from '@/components/Frota';
import Contratos from '@/components/Contratos';

export default function HubPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-black text-white">Império das Máquinas</h1>
        <p className="text-sm text-white/50">Painel de comando — Hub</p>
      </header>

      <section>
        <Hud />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Minha Frota</h2>
        <Frota />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Contratos Disponíveis</h2>
        <Contratos />
      </section>
    </main>
  );
}
