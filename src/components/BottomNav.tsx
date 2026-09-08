'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const itens = [
  { href: '/', label: 'HUB', icon: '🏠' },
  { href: '/loja', label: 'LOJA', icon: '🏪' },
  { href: '/manutencao', label: 'OFICINA', icon: '🔧' },
  { href: '/contratos', label: 'CONTRATOS', icon: '📜' },
  { href: '/administracao', label: 'ADM', icon: '🏢' },
  { href: '/missoes', label: 'MISSÕES', icon: '🎯' },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#FFC400] bg-[#1A1F29]/95 backdrop-blur p-2">
      <div className="mx-auto flex max-w-5xl justify-around">
        {itens.map(i => {
          const active = path === i.href;
          return (
            <Link key={i.href} href={i.href} className={`flex flex-col items-center rounded-lg px-3 py-1.5 text-[10px] font-black tracking-widest transition ${active ? 'bg-[#FFC400] text-black' : 'text-white/60 hover:text-[#FFC400]'}`}>
              <span className="text-lg leading-none">{i.icon}</span>
              <span className="mt-1">{i.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  );
}
