import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../lib/adminClient';

const SETORES = ['prospeccao', 'atendimento', 'montagem', 'conteudo', 'revisao', 'pesquisa', 'implantacao'];
const STATUS_TAREFA = { aberta: 'Aberta', em_andamento: 'Em andamento', em_revisao: 'Em revisão', aprovada: 'Aprovada', devolvida: 'Devolvida' };
const STATUS_CAND = { novo: 'Novo', em_teste: 'Em teste', aprovado: 'Aprovado', banco_de_talentos: 'Banco de talentos', recusado: 'Recusado' };
const real = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const data = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');

export default function Painel() {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState(null);
  const [nova, setNova] = useState({ titulo: '', setor: 'montagem', valor_fixo: '', pontos: '5' });

  async function carregar() {
    try {
      setD(await api('/api/op/painel'));
    } catch (e) {
      if (e.status === 401) window.location.href = '/entrar';
      else setMsg({ tipo: 'er', texto: e.status === 403 ? 'Esta área é só do dono do sistema.' : e.message });
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  async function acao(corpo, ok) {
    setMsg(null);
    try {
      await api('/api/op/painel', { method: 'POST', body: corpo });
      if (ok) setMsg({ tipo: 'ok', texto: ok });
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
  }
  async function sair() {
    await api('/api/op/logout', { method: 'POST', body: {} });
    window.location.href = '/entrar';
  }

  if (!d) {
    return (
      <div className="ea">
        <style>{ADMIN_CSS}</style>
        <div className="ea-in">{msg ? <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div> : 'Carregando…'}</div>
      </div>
    );
  }

  const nomeOp = (id) => {
    const o = d.operadores.find((x) => x.id === id);
    return o ? o.nome || 'Operador' : '—';
  };
  const paraRevisar = d.tarefas.filter((t) => t.status === 'em_revisao');
  const pendentes = d.operadores.filter((o) => !o.ativo);
  const ativos = d.operadores.filter((o) => o.ativo);
  const pagPend = d.pagamentos.filter((p) => p.status === 'pendente');
  const totalPend = pagPend.reduce((s, p) => s + Number(p.valor), 0);
  const totalPago = d.pagamentos.filter((p) => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0);

  return (
    <div className="ea">
      <Head>
        <title>Painel do dono</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in">
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Painel do dono</h1>
            <div className="ea-mu">Equipe, missões, entregas e pagamentos</div>
          </div>
          <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>
        </div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

        <div className="ea-grid" style={{ marginTop: 16 }}>
          <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Operadores ativos</div><h1>{ativos.length}</h1></div>
          <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Entregas para revisar</div><h1>{paraRevisar.length}</h1></div>
          <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Crédito a pagar</div><h1>{real(totalPend)}</h1></div>
          <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Já pago</div><h1>{real(totalPago)}</h1></div>
          <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Clientes interessados</div><h1>{d.leads.length}</h1></div>
        </div>

        <div className="ea-card">
          <h2>Entregas para revisar</h2>
          {!paraRevisar.length && <div className="ea-mu">Nenhuma entrega aguardando revisão.</div>}
          {paraRevisar.map((t) => (
            <div className="ea-item" key={t.id}>
              <div>
                <strong>{t.titulo}</strong>
                <div className="ea-mu">{nomeOp(t.operador_id)} · {t.setor} · {t.pontos} pontos · {real(t.valor_fixo)}</div>
                {t.link_entrega && <a href={t.link_entrega} target="_blank" rel="noopener noreferrer">Abrir entrega</a>}
              </div>
              <div className="ea-row">
                <button className="ea-btn ea-btn-ok" onClick={() => acao({ acao: 'decidir_tarefa', id: t.id, decisao: 'aprovar' }, 'Entrega aprovada. O crédito foi registrado.')}>Aprovar</button>
                <button
                  className="ea-btn ea-btn-er"
                  onClick={() => {
                    const c = window.prompt('O que precisa ser ajustado?');
                    if (c) acao({ acao: 'decidir_tarefa', id: t.id, decisao: 'devolver', comentario: c }, 'Devolvida para ajustes.');
                  }}
                >
                  Devolver
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="ea-card">
          <h2>Nova missão</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              acao({ acao: 'criar_tarefa', ...nova }, 'Missão criada e aberta para a equipe.').then(() => setNova({ ...nova, titulo: '', valor_fixo: '' }));
            }}
          >
            <div className="ea-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <label>O que precisa ser entregue</label>
                <input value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} required />
              </div>
              <div>
                <label>Setor</label>
                <select value={nova.setor} onChange={(e) => setNova({ ...nova, setor: e.target.value })}>
                  {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Valor (R$)</label>
                <input type="number" min="0" step="0.01" value={nova.valor_fixo} onChange={(e) => setNova({ ...nova, valor_fixo: e.target.value })} />
              </div>
              <div>
                <label>Pontos</label>
                <input type="number" min="0" max="100" value={nova.pontos} onChange={(e) => setNova({ ...nova, pontos: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}><button className="ea-btn">Criar missão</button></div>
          </form>
        </div>

        <div className="ea-card">
          <h2>Operadores</h2>
          {!d.operadores.length && <div className="ea-mu">Ninguém criou conta ainda.</div>}
          {[...pendentes, ...ativos].map((o) => (
            <div className="ea-item" key={o.id}>
              <div>
                <strong>{o.nome || 'Sem nome'}</strong>
                <div className="ea-mu">{o.whatsapp || 'sem WhatsApp'} · criado em {data(o.criado_em)}</div>
              </div>
              <div className="ea-row">
                <span className={`ea-tag ${o.ativo ? 'ok' : 'am'}`}>{o.ativo ? 'Ativo' : 'Aguardando aprovação'}</span>
                <button className={`ea-btn ${o.ativo ? 'ea-btn2' : 'ea-btn-ok'}`} onClick={() => acao({ acao: 'aprovar_operador', id: o.id, ativo: !o.ativo })}>{o.ativo ? 'Desativar' : 'Aprovar'}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="ea-card">
          <h2>Todas as missões</h2>
          {!d.tarefas.length && <div className="ea-mu">Crie a primeira missão acima.</div>}
          {d.tarefas.map((t) => (
            <div className="ea-item" key={t.id}>
              <div>
                <strong>{t.titulo}</strong>
                <div className="ea-mu">{t.setor} · {t.pontos} pontos · {real(t.valor_fixo)}{t.operador_id ? ` · ${nomeOp(t.operador_id)}` : ''}</div>
              </div>
              <span className={`ea-tag ${t.status === 'aprovada' ? 'ok' : t.status === 'devolvida' ? 'er' : 'am'}`}>{STATUS_TAREFA[t.status] || t.status}</span>
            </div>
          ))}
        </div>

        <div className="ea-card">
          <h2>Pagamentos a fazer</h2>
          <p className="ea-mu">O sistema só registra. Você faz o PIX e depois marca como pago.</p>
          {!pagPend.length && <div className="ea-mu">Nada pendente.</div>}
          {pagPend.map((p) => (
            <div className="ea-item" key={p.id}>
              <div>
                <strong>{real(p.valor)}</strong> para {nomeOp(p.operador_id)}
                <div className="ea-mu">{p.referencia || p.tipo}</div>
              </div>
              <button className="ea-btn ea-btn-ok" onClick={() => acao({ acao: 'marcar_pago', id: p.id }, 'Marcado como pago.')}>Marcar como pago</button>
            </div>
          ))}
        </div>

        <div className="ea-card">
          <h2>Candidatos</h2>
          {!d.candidatos.length && <div className="ea-mu">Ainda não há candidatos. O formulário público de captação vem na próxima etapa.</div>}
          {d.candidatos.map((c) => (
            <div className="ea-item" key={c.id}>
              <div>
                <strong>{c.nome}</strong>
                <div className="ea-mu">{c.whatsapp} · {c.cidade || 'cidade não informada'} · {(c.setores || []).join(', ')}</div>
              </div>
              <select style={{ width: 'auto' }} value={c.status} onChange={(e) => acao({ acao: 'candidato_status', id: c.id, status: e.target.value })}>
                {Object.keys(STATUS_CAND).map((s) => <option key={s} value={s}>{STATUS_CAND[s]}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="ea-card">
          <h2>Catálogo de produtos</h2>
          {d.catalogo.map((p) => (
            <div className="ea-item" key={p.id}>
              <div>
                <strong>{p.nome}</strong>
                <div className="ea-mu">{p.modulo} · {p.setor || 'sem setor'}</div>
              </div>
              <span className="ea-tag">{p.preco_a_partir ? `a partir de ${real(p.preco_a_partir)}` : 'preço a definir'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
