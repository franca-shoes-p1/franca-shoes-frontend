import React from 'react';
import Link from 'next/link';
import s from '../styles/rodapeSite.module.css';
import Redes from './Redes';

/* Rodapé da home: marca, todos os projetos do site em colunas e o acesso ao portal com os demais projetos.
   Para incluir um projeto novo, acrescente um item em COLUNAS. */
const COLUNAS = [
  { t: 'Negócios', itens: [
    ['👟', 'Loja de Calçados Pronta', '/calcados'],
    ['📍', 'Radar de Pontos', '/radar'],
    ['🧩', 'Ateliê Sob Medida', '/atelie'],
    ['🌐', 'Fábrica de Sites', '/sites'],
    ['📚', 'Livros e e-books', '/livros'],
  ] },
  { t: 'Participe', itens: [
    ['🛠️', 'Oficina Digital', '/oficina'],
    ['📣', 'Programa de Afiliados', '/afiliados'],
    ['🎁', 'Campanha de Inauguração', '/campanha'],
    ['🤝', 'Quero participar do Radar', '/radar/participar'],
    ['🔑', 'Sou operador', '/operador'],
  ] },
  { t: 'Ferramentas', itens: [
    ['🗂️', 'Catálogo completo', '/catalogo'],
    ['🤖', 'Assistentes', '/assistentes'],
    ['🏬', 'Monte a sua loja', '/monte-sua-loja'],
    ['🖥️', 'Monte o seu site', '/monte-seu-site'],
    ['🧮', 'Calculadora de margem', '/calculadora'],
  ] },
  { t: 'Conheça', itens: [
    ['⛪', 'Manual da Igreja', '/manual-da-igreja'],
    ['🌱', 'Vigiar e Cultivar', '/vigiar-e-cultivar'],
    ['💛', 'Fidelidade', '/fidelidade'],
    ['📖', 'E-books práticos', '/ebooks'],
  ] },
];

export default function RodapeSite({ nome, whatsapp, email }) {
  return (
    <footer className={s.rodape}>
      <div className={s.brilho} aria-hidden="true" />
      <div className={s.topo}>
        <div className={s.marca}>
          <a href="#topo" className={s.logo}><span className={s.selo}>IE</span><span>{nome}</span></a>
          <p>Negócios digitais e calçados direto da fábrica de Franca-SP, com IA, automação e gente de verdade por trás.</p>
          <div className={s.contatos}>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
            <a href={`mailto:${email}`}>✉️ E-mail</a>
          </div>
          <div className={s.redes}><Redes variante="escuro" titulo="Nossas redes" /></div>
        </div>
        <nav className={s.colunas} aria-label="Projetos do site">
          {COLUNAS.map((c) => (
            <div key={c.t} className={s.col}>
              <h4>{c.t}</h4>
              <ul>
                {c.itens.map(([e, t, h]) => (<li key={h}><Link href={h}><span aria-hidden="true">{e}</span>{t}</Link></li>))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={s.portais}>
        <Link href="/catalogo" className={s.portal}>
          <b>Catálogo completo de produtos e serviços</b><small>Tudo o que oferecemos e o que vem por aí</small>
        </Link>
        <Link href="/portal" className={`${s.portal} ${s.portalDestaque}`}>
          <b>Entrar no portal completo</b><small>Escola, serviços de IA, loja, calculadora e os demais projetos</small>
        </Link>
      </div>

      <div className={s.fim}>
        <span>© 2026 {nome}. Todos os direitos reservados.</span>
        <span><Link href="/calcados/politicas">Políticas</Link> · <Link href="/radar">Radar de Pontos</Link> · <Link href="/admin/radar">Área do responsável</Link></span>
      </div>
    </footer>
  );
}
