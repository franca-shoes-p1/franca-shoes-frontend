import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { ETAPAS_DONO, ROTINA_DONO } from '../../lib/praia';

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const CSS = `
.pr-tabs{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.pr-t{padding:8px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.pr-t.on{background:var(--ac);border-color:var(--ac);color:#fff}
.pr-ln{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
.pr-ln>*{flex:1 1 130px;min-width:0}
.pr-tab{width:100%;border-collapse:collapse;font-size:14px}
.pr-tab th,.pr-tab td{padding:6px 8px;border-bottom:1px solid var(--bd);text-align:left;vertical-align:top}
.pr-cod{font:700 24px ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;word-break:break-all}
.pr-big{font-size:32px;font-weight:800;line-height:1}
.pr-alerta{color:#b45309;font-weight:700}
`;
const ABAS = [['geral', 'Visão geral'], ['papel', 'Meu papel'], ['candidatos', 'Candidatos'], ['socios', 'Sócios'], ['fechamentos', 'Fechamentos'], ['produtos', 'Produtos'], ['vagas', 'Vagas'], ['avisos', 'Avisos']];

export default function AdminPraia() {
  const [fase, setFase] = useState('carregando');
  const [aba, setAba] = useState('geral');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [codigo, setCodigo] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [vaga, setVaga] = useState({ cidade: '', total: '' });
  const [prod, setProd] = useState({ id: '', nome: '', custo: '', preco: '' });
  const [aviso, setAviso] = useState({ titulo: '', texto: '' });

  const carregar = useCallback(async () => {
    try { const x = await api('/api/admin/praia'); setD(x); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ er: 1, t: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { const r = await fn(); if (r && r.codigo) setCodigo(r.codigo); if (ok) setMsg({ t: ok }); await carregar(); } catch (e) { setMsg({ er: 1, t: e.message }); }
    setOcupado(false);
  }
  const acao = (corpo, ok) => rodar(() => api('/api/admin/praia', { method: 'POST', body: corpo }), ok);
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); }); };

  const feitas = new Set(((d && d.etapas) || []).filter((e) => e.feito).map((e) => e.chave));
  const novos = d && d.candidatos ? d.candidatos.filter((c) => c.status === 'novo').length : 0;
  const espera = d && d.candidatos ? d.candidatos.filter((c) => c.status === 'lista_espera').length : 0;
  const alertas = d && d.fechamentos ? d.fechamentos.filter((f) => f.fechado && f.divergencia > 10).length : 0;

  return (
    <div className="ea">
      <Head><title>Parceiros da Praia | Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{CSS}</style>
      <AdminNav />
      <h1>🏖️ Parceiros da Praia</h1>
      {fase === 'carregando' && <p>Carregando…</p>}
      {fase === 'login' && (
        <form className="card" onSubmit={entrar}>
          <h3>Entrar no painel</h3>
          {msg && <div className="er">{msg.t}</div>}
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha do painel" required />
          <button disabled={ocupado}>Entrar</button>
        </form>
      )}
      {fase === 'pronto' && d && !d.pronto && <div className="card"><div className="er">{d.motivo}</div></div>}
      {fase === 'pronto' && d && d.pronto && (
        <>
          {!d.extra && <div className="card"><div className="er">Faltam as tabelas extras (vagas, avisos, etapas). Rode o arquivo supabase-praia-extra.sql no Supabase.</div></div>}
          {codigo && (<div className="card"><b>Código de acesso (aparece só agora, envie ao sócio por WhatsApp):</b><div className="pr-cod">{codigo}</div><button onClick={() => setCodigo(null)}>Já anotei</button></div>)}
          {msg && <div className={msg.er ? 'er' : 'ok'}>{msg.t}</div>}
          <div className="pr-tabs">{ABAS.map(([k, t]) => <button key={k} className={`pr-t ${aba === k ? 'on' : ''}`} onClick={() => { setAba(k); setMsg(null); }}>{t}</button>)}</div>

          {aba === 'geral' && (
            <div className="card">
              <div className="pr-ln">
                <div><div className="pr-big">{d.vagas ? `${d.vagas.livres}/${d.vagas.total}` : '—'}</div>vagas livres</div>
                <div><div className="pr-big">{novos}</div>candidatos novos</div>
                <div><div className="pr-big">{espera}</div>na lista de espera</div>
                <div><div className="pr-big">{d.parceiros.filter((x) => x.ativo).length}</div>sócios ativos</div>
                <div><div className={`pr-big ${alertas ? 'pr-alerta' : ''}`}>{alertas}</div>fechamentos com alerta</div>
              </div>
              <h3 style={{ marginTop: 20 }}>Sua rotina</h3>
              <table className="pr-tab"><tbody>{ROTINA_DONO.map(([q, t]) => <tr key={q}><td><b>{q}</b></td><td>{t}</td></tr>)}</tbody></table>
            </div>
          )}

          {aba === 'papel' && (
            <div className="card">
              <h3>Você é o dono-operador</h3>
              <p>Você põe a estrutura e o estoque, aprova os sócios, confere os fechamentos e paga a parte de cada um. Marque cada passo quando terminar.</p>
              {ETAPAS_DONO.map((e, i) => (
                <div key={e.chave} style={{ marginTop: 14 }}>
                  <b>Etapa {i + 1}. {e.t}</b>
                  {e.itens.map((it, j) => {
                    const k = `${e.chave}.${j}`;
                    return (<label key={k} className="pr-ln" style={{ gap: 8, flexWrap: 'nowrap' }}><input type="checkbox" style={{ flex: '0 0 auto' }} checked={feitas.has(k)} disabled={ocupado} onChange={(ev) => acao({ acao: 'etapa', chave: k, feito: ev.target.checked })} /><span style={{ textDecoration: feitas.has(k) ? 'line-through' : 'none', opacity: feitas.has(k) ? 0.6 : 1 }}>{it}</span></label>);
                  })}
                </div>
              ))}
            </div>
          )}

          {aba === 'candidatos' && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <h3>Candidatos</h3>
              <table className="pr-tab"><thead><tr><th>Nome</th><th>Contato</th><th>Cidade</th><th>Perfil</th><th>Status</th><th></th></tr></thead>
                <tbody>{d.candidatos.length ? d.candidatos.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.nome}</b><br /><small>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</small></td>
                    <td><a href={`https://wa.me/55${String(c.telefone).replace(/\D/g, '').replace(/^55/, '')}`} target="_blank" rel="noopener noreferrer">{c.telefone}</a></td>
                    <td>{c.cidade}{c.bairro ? ` · ${c.bairro}` : ''}</td>
                    <td><small>PIX: {c.tem_pix ? 'sim' : 'não'}<br />{c.disponibilidade || ''}<br />{c.experiencia || ''}</small></td>
                    <td><select value={c.status} disabled={ocupado} onChange={(e) => acao({ acao: 'candidato_status', id: c.id, status: e.target.value })}>{['novo', 'conversando', 'aprovado', 'recusado', 'lista_espera'].map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td>{c.status !== 'aprovado' && <button disabled={ocupado} onClick={() => { if (window.confirm(`Aprovar ${c.nome} como sócio e gerar o código de acesso?`)) acao({ acao: 'candidato_aprovar', id: c.id }, 'Sócio criado.'); }}>Aprovar</button>}</td>
                  </tr>)) : <tr><td colSpan={6}>Nenhum candidato ainda.</td></tr>}</tbody></table>
            </div>
          )}

          {aba === 'socios' && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <h3>Sócios</h3>
              <table className="pr-tab"><thead><tr><th>Nome</th><th>Cidade</th><th>Kit</th><th>Ambulante</th><th>Curso</th><th>Contrato</th><th>Ativo</th><th></th></tr></thead>
                <tbody>{d.parceiros.length ? d.parceiros.map((s) => (
                  <tr key={s.id}>
                    <td><b>{s.nome}</b><br /><small>{s.telefone}</small></td><td>{s.cidade}</td>
                    <td><select value={s.kit || 'caminhante'} disabled={ocupado} onChange={(e) => acao({ acao: 'parceiro_kit', id: s.id, kit: e.target.value })}><option value="caminhante">Caminhante</option><option value="carrinho">Carrinho</option></select></td>
                    {['cadastro_ambulante', 'curso_manipulacao', 'contrato_assinado', 'ativo'].map((f) => (<td key={f}><input type="checkbox" checked={!!s[f]} disabled={ocupado} onChange={(e) => acao({ acao: 'parceiro_flag', id: s.id, campo: f, valor: e.target.checked })} /></td>))}
                    <td><button disabled={ocupado} onClick={() => { if (window.confirm('Gerar um novo código? O anterior deixa de funcionar.')) acao({ acao: 'parceiro_novo_codigo', id: s.id }); }}>Novo código</button></td>
                  </tr>)) : <tr><td colSpan={8}>Nenhum sócio ainda. Aprove um candidato.</td></tr>}</tbody></table>
              <p><small>O kit só é liberado ao sócio quando ambulante, curso e contrato estão marcados.</small></p>
            </div>
          )}

          {aba === 'fechamentos' && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <h3>Fechamentos recentes</h3>
              <table className="pr-tab"><thead><tr><th>Dia</th><th>Sócio</th><th>Esperado</th><th>Informado</th><th>Diferença</th><th>Lucro</th><th>Cada um</th></tr></thead>
                <tbody>{d.fechamentos.length ? d.fechamentos.map((f, i) => (
                  <tr key={i}><td>{String(f.data).split('-').reverse().join('/')}</td><td>{f.nome}</td><td>{brl(f.vendas_esperadas)}</td><td>{f.fechado ? brl(f.valor_informado) : 'sem fechamento'}</td>
                    <td className={f.fechado && f.divergencia > 10 ? 'pr-alerta' : ''}>{f.fechado ? `${f.divergencia}%${f.divergencia > 10 ? ' ⚠' : f.divergencia > 3 ? ' (atenção)' : ''}` : '—'}</td><td>{brl(f.lucro)}</td><td><b>{brl(f.parte_de_cada)}</b></td></tr>)) : <tr><td colSpan={7}>Ainda sem movimentos.</td></tr>}</tbody></table>
              <p><small>Diferença = quanto das vendas esperadas (saiu − sobrou) não apareceu no PIX/dinheiro informado. No piloto, até 3% é tolerado e acima de 10% pede conversa.</small></p>
            </div>
          )}

          {aba === 'produtos' && (
            <div className="card">
              <h3>Produtos, custo e preço</h3>
              <table className="pr-tab"><thead><tr><th>Produto</th><th>Custo</th><th>Preço</th><th>Ativo</th><th></th></tr></thead>
                <tbody>{d.produtos.map((x) => (<tr key={x.id}><td>{x.nome}</td><td>{brl(x.custo)}</td><td>{brl(x.preco)}</td><td>{x.ativo ? 'sim' : 'não'}</td>
                  <td><button onClick={() => setProd({ id: String(x.id), nome: x.nome, custo: String(x.custo).replace('.', ','), preco: String(x.preco).replace('.', ',') })}>Editar</button> <button disabled={ocupado} onClick={() => acao({ acao: 'produto_salvar', id: String(x.id), nome: x.nome, custo: x.custo, preco: x.preco, ativo: !x.ativo })}>{x.ativo ? 'Desativar' : 'Ativar'}</button></td></tr>))}</tbody></table>
              <div className="pr-ln"><input placeholder="Nome" value={prod.nome} onChange={(e) => setProd({ ...prod, nome: e.target.value })} /><input placeholder="Custo (R$)" value={prod.custo} onChange={(e) => setProd({ ...prod, custo: e.target.value })} /><input placeholder="Preço (R$)" value={prod.preco} onChange={(e) => setProd({ ...prod, preco: e.target.value })} />
                <button disabled={ocupado} onClick={() => acao({ acao: 'produto_salvar', ...prod }, 'Produto salvo.').then(() => setProd({ id: '', nome: '', custo: '', preco: '' }))}>{prod.id ? 'Salvar alteração' : 'Adicionar produto'}</button></div>
            </div>
          )}

          {aba === 'vagas' && (
            <div className="card">
              <h3>Vagas por cidade</h3>
              <p>O número aparece na capa e em /praia. Use o número real de kits que você tem para aquela cidade.</p>
              <table className="pr-tab"><thead><tr><th>Cidade</th><th>Total</th><th>Ocupadas</th><th>Livres</th></tr></thead>
                <tbody>{d.vagas && d.vagas.cidades.length ? d.vagas.cidades.map((v) => <tr key={v.cidade}><td>{v.cidade}</td><td>{v.total}</td><td>{v.ocupadas}</td><td><b>{v.livres}</b></td></tr>) : <tr><td colSpan={4}>Nenhuma cidade cadastrada.</td></tr>}</tbody></table>
              <div className="pr-ln"><input placeholder="Cidade" value={vaga.cidade} onChange={(e) => setVaga({ ...vaga, cidade: e.target.value })} /><input placeholder="Total de vagas" inputMode="numeric" value={vaga.total} onChange={(e) => setVaga({ ...vaga, total: e.target.value })} /><button disabled={ocupado} onClick={() => acao({ acao: 'vaga_salvar', ...vaga }, 'Vagas salvas.').then(() => setVaga({ cidade: '', total: '' }))}>Salvar cidade</button></div>
            </div>
          )}

          {aba === 'avisos' && (
            <div className="card">
              <h3>Avisos para os sócios</h3>
              <div className="pr-ln"><input placeholder="Título" value={aviso.titulo} onChange={(e) => setAviso({ ...aviso, titulo: e.target.value })} /><input placeholder="Texto" value={aviso.texto} onChange={(e) => setAviso({ ...aviso, texto: e.target.value })} /><button disabled={ocupado} onClick={() => acao({ acao: 'aviso_novo', ...aviso }, 'Aviso publicado.').then(() => setAviso({ titulo: '', texto: '' }))}>Publicar</button></div>
              <table className="pr-tab" style={{ marginTop: 12 }}><tbody>{d.avisos.map((a) => (<tr key={a.id}><td><b>{a.titulo}</b><br />{a.texto}</td><td>{a.ativo ? 'visível' : 'oculto'}</td><td><button disabled={ocupado} onClick={() => acao({ acao: 'aviso_ativo', id: String(a.id), ativo: !a.ativo })}>{a.ativo ? 'Ocultar' : 'Mostrar'}</button></td></tr>))}</tbody></table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
