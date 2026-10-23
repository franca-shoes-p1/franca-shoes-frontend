import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../lib/adminClient';

const CAT = { digital: 'Digital', comercial: 'Comercial', industrial: 'Industrial', tangivel: 'Tangível' };
const STE = { ideia: 'Ideia', planejando: 'Planejando', construindo: 'Construindo', operando: 'Operando' };

export default function Vitrine() {
  const [l, setL] = useState(null);
  const [erro, setErro] = useState(null);
  useEffect(() => { api('/api/oficina/vitrine').then((r) => setL(r.empreendimentos)).catch((e) => setErro(e.message)); }, []);
  return (
    <div className="ea">
      <Head><title>Vitrine de projetos · Oficina Digital</title><meta name="description" content="Projetos em construção no ecossistema da Oficina Digital." /></Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in" style={{ maxWidth: 760 }}>
        <h1>Vitrine de projetos</h1>
        <p className="ea-mu">O que estamos construindo. Quem trabalha na Oficina acumula Pontos que podem virar benefícios nestes projetos, conforme a regra de cada um. Não é oferta de investimento, sociedade ou retorno financeiro.</p>
        {erro && <div className="ea-msg er">{erro}</div>}
        {!l && !erro && <div className="ea-card">Carregando…</div>}
        {l && l.length === 0 && <div className="ea-card ea-mu">Novos projetos em breve.</div>}
        {l && l.map((p) => (
          <div className="ea-card" key={p.id}>
            <div className="ea-row" style={{ justifyContent: 'space-between' }}><h2 style={{ margin: 0 }}>{p.nome}</h2><span><span className="ea-tag">{CAT[p.categoria]}</span> <span className="ea-tag am">{STE[p.status]}</span></span></div>
            {p.resumo && <p>{p.resumo}</p>}
            {p.desconto_pct ? <p><b>Benefício para quem tem Pontos:</b> até {p.desconto_pct}% de desconto.</p> : null}
            {p.marcos.length > 0 && <ul style={{ paddingLeft: 20 }}>{p.marcos.map((m, i) => <li key={i}>{m.concluido ? '✔' : '○'} {m.titulo}</li>)}</ul>}
            {p.atualizacoes.map((a, i) => <div className="ea-mu" key={i}>{new Date(a.criado_em).toLocaleDateString('pt-BR')}: {a.texto}</div>)}
            {p.vagas.length > 0 && <p><b>Tarefas abertas:</b> {p.vagas.map((v) => v.titulo).join(' · ')}</p>}
          </div>
        ))}
        <p><Link href="/oficina" className="ea-btn">Quero participar da Oficina</Link></p>
      </div>
    </div>
  );
}
