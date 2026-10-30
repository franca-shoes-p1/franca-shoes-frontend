import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/* Barra única para navegar entre os painéis. Para incluir um painel novo, acrescente um item em ITENS. */
const ITENS = [
  { href: '/admin/radar', t: '🧭 Painel do dia' },
  { href: '/admin/pontos', t: '📍 Mapa e pontos' },
  { href: '/admin/captacao', t: '🚀 Captação' },
  { href: '/admin/material', t: '🖨️ Materiais' },
  { href: '/admin/calcados', t: '👟 Calçados' },
  { href: '/admin/fornecedores', t: '🏭 Fornecedores' },
  { href: '/admin/revendedores', t: '🤝 Revendedores' },
  { href: '/admin/lote', t: '🧾 Lote do dia' },
  { href: '/admin/operadores', t: '👥 Operadores' },
  { href: '/admin/oficina', t: '🛠️ Oficina' },
  { href: '/admin/ebooks', t: '📚 E-books' },
];
const CSS = `
.an{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 14px;padding:8px;background:var(--cd);border:1px solid var(--bd);border-radius:14px}
.an a{padding:7px 12px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;color:var(--tx);background:transparent;border:1px solid transparent}
.an a:hover{border-color:var(--bd)}
.an a.on{background:var(--ac);color:#fff}
@media (prefers-color-scheme: dark){.an a.on{color:#0b1220}}
.an .fim{margin-left:auto}
`;

export default function AdminNav() {
  const { pathname } = useRouter();
  return (
    <nav className="an" aria-label="Painéis">
      <style>{CSS}</style>
      {ITENS.map((i) => (
        <Link key={i.href} href={i.href} className={pathname.startsWith(i.href) ? 'on' : ''}>{i.t}</Link>
      ))}
      <Link href="/radar" className="fim">🌐 Página pública</Link>
      <Link href="/" >🏠 Site</Link>
    </nav>
  );
}
