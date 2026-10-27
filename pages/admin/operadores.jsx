import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import { SETORES } from '../../lib/opModelos';

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const STATUS = {
  pendente: ['Pendente', ''],
  em_andamento: ['Em andamento', 'am'],
  entregue: ['Entregue: revisar', 'am'],
  ajuste: ['Ajuste pedido', 'er'],
  aprovada: ['Aprovada', 'ok'],
  paga: ['Paga', 'ok'],
  cancelada: ['Cancelada', 'er'],
};
const NIVEIS = [['iniciante', 'Iniciante'], ['aprovado', 'Aprovado'], ['referencia', 'Referência']];
const SERVICOS = ['Loja de Calçados Pronta - Iniciante', 'Loja de Calçados Pronta - Intermediário', 'Loja de Calçados Pronta - Avançado'];

const CSS = `
.po-tabs{display:flex;gap:8px;margin-top:16px}
.po-t{padding:8px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.po-t.on{background:var(--ac);border-color:var(--ac);color:#fff}
.po-tar{border-top:1px solid var(--bd);padding:12px 0}
.po-tar:first-child{border-top:0}
.po-ln{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
.po-ln>*{flex:1 1 130px;min-width:0}
.po-ln .po-n{flex:0 0 auto}
.po-ent{margin-top:8px;padding:10px;border-radius:8px;background:var(--bg);border:1px solid var(--bd);white-space:pre-wrap;word-break:break-word;font-size:14px}
.po-cod{font:700 22px ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;word-break:break-all}
.po-chk{display:flex;gap:8px;align-items:center;font-size:14px}
.po-chk input{width:auto}
`;

export default function AdminOperadores() {
  const [fase, setFase] = useState('carregando');
  const [aba, setAba] = useState('ordens');
  const [ordens, setOrdens] = useState([]);
  const [ops, setOps] = useState([]);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [codigoNovo, setCodigoNovo] = useState(null); // {nome, codigo}
  const [fo, setFo] = useState({ cliente: '', servico: SERVICOS[0], prazo: '', valor_total: '' });
  const [fp, setFp] = useState({ nome: '', whatsapp: '', chave_pix: '', setor: SETORES[0], nivel: 'iniciante' });
  const [edit, setEdit] = useState({}); // rascunhos por tarefa: { [id]: {operario_id, valor, prazo} }

  const carregar = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api('/api/admin/ordens'), api('/api/admin/operadores')]);
      setOrdens(a.ordens || []);
      setOps(b.operadores || []);
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else {
        setMsg({ tipo: 'er', texto: e.message });
        setFase('pronto');
      }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, okTexto) {
    setOcupado(true);
    setMsg(null);
    try {
      await fn();
      if (okTexto) setMsg({ tipo: 'ok', texto: okTexto });
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  async function entrar(ev) {
    ev.preventDefault();
    await rodar(async () => {
      await api('/api/admin/login', { method: 'POST', body: { senha } });
      setSenha('');
    });
  }
  async function sair() {
    await api('/api/admin/logout', { method: 'POST', body: {} });
    setOrdens([]); setOps([]); setFase('login');
  }

  const criarOrdem = (ev) => {
    ev.preventDefault();
    rodar(async () => {
      await api('/api/admin/ordens', { method: 'POST', body: { ...fo, modelo: 'loja' } });
      setFo({ ...fo, cliente: '', prazo: '', valor_total: '' });
    }, 'Ordem criada com as 7 tarefas. Atribua os operadores e confirme a entrada do cliente.');
  };
  const criarOperador = (ev) => {
    ev.preventDefault();
    rodar(async () => {
      const d = await api('/api/admin/operadores', { method: 'POST', body: fp });
      setCodigoNovo({ nome: d.operador.nome, codigo: d.codigo });
      setFp({ ...fp, nome: '', whatsapp: '', chave_pix: '' });
    });
  };
  const ordemPatch = (id, corpo) => rodar(() => api(`/api/admin/ordens/${id}`, { method: 'PATCH', body: corpo }));
  const tarefaPatch = (id, corpo, ok) => rodar(() => api(`/api/admin/tarefas/${id}`, { method: 'PATCH', body: corpo }), ok);
  const opPatch = (id, corpo) =>
    rodar(async () => {
      const d = await api(`/api/admin/operadores/${id}`, { method: 'PATCH', body: corpo });
      if (d.codigo) setCodigoNovo({ nome: d.operador.nome, codigo: d.codigo });
    });

  const rasc = (t) => ({ operario_id: t.operario_id || '', valor: String(t.valor || '').replace('.', ','), prazo: t.prazo || '', ...(edit[t.id] || {}) });
  const setRasc = (t, campo, v) => setEdit({ ...edit, [t.id]: { ...rasc(t), [campo]: v } });
  const salvarTarefa = (t) => {
    const r = rasc(t);
    tarefaPatch(t.id, { operario_id: r.operario_id || null, valor: r.valor || '0', prazo: r.prazo || null }, 'Tarefa salva.');
  };
  const nomeOp = (id) => (ops.find((o) => o.id === id) || {}).nome || '';
  const opsAtivos = ops.filter((o) => o.ativo);

  return (
    <div className="ea">
      <Head><title>Operadores · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Operadores e ordens</h1>
            <div className="ea-mu">Fábrica Digital: ordens de produção, tarefas por setor e pagamento só de tarefa aprovada.</div>
          </div>
          <div className="ea-row">
            <Link href="/admin/oficina" className="ea-btn ea-btn2">Oficina</Link>
            <Link href="/admin/calcados" className="ea-btn ea-btn2">Modelos</Link>
            {fase === 'pronto' && <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>}
          </div>
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}

        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2>
            <label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus required />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button></div>
          </form>
        )}

        {fase === 'pronto' && (
          <>
            {codigoNovo && (
              <div className="ea-card" style={{ borderColor: 'var(--am)' }}>
                <h2>Código de acesso de {codigoNovo.nome}</h2>
                <div className="po-cod">{codigoNovo.codigo}</div>
                <p className="ea-mu">Anote e envie agora ao operador (por WhatsApp). Ele não aparece de novo. Se perder, gere um novo na aba Operadores. O operador entra em <b>/operador</b>.</p>
                <button className="ea-btn ea-btn2" onClick={() => setCodigoNovo(null)}>Já anotei</button>
              </div>
            )}

            <div className="po-tabs">
              <button className={`po-t ${aba === 'ordens' ? 'on' : ''}`} onClick={() => setAba('ordens')}>Ordens ({ordens.length})</button>
              <button className={`po-t ${aba === 'operadores' ? 'on' : ''}`} onClick={() => setAba('operadores')}>Operadores ({ops.length})</button>
            </div>

            {aba === 'ordens' && (
              <>
                <form className="ea-card" onSubmit={criarOrdem}>
                  <h2>Nova ordem de produção</h2>
                  <div className="ea-grid">
                    <div><label>Cliente</label><input value={fo.cliente} onChange={(e) => setFo({ ...fo, cliente: e.target.value })} required /></div>
                    <div><label>Serviço</label>
                      <select value={fo.servico} onChange={(e) => setFo({ ...fo, servico: e.target.value })}>{SERVICOS.map((s) => <option key={s}>{s}</option>)}</select></div>
                    <div><label>Prazo final</label><input type="date" value={fo.prazo} onChange={(e) => setFo({ ...fo, prazo: e.target.value })} /></div>
                    <div><label>Valor do pedido (R$)</label><input inputMode="decimal" value={fo.valor_total} onChange={(e) => setFo({ ...fo, valor_total: e.target.value })} placeholder="o que o cliente paga" /></div>
                  </div>
                  <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Criar ordem (7 tarefas)</button></div>
                </form>

                {ordens.length === 0 && <div className="ea-card ea-mu">Nenhuma ordem ainda.</div>}
                {ordens.map((o) => (
                  <div className="ea-card" key={o.id}>
                    <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <h2 style={{ margin: 0 }}>#{o.numero} · {o.cliente}</h2>
                        <div className="ea-mu">{o.servico}{o.prazo ? ` · prazo ${o.prazo.split('-').reverse().join('/')}` : ''}{o.valor_total > 0 ? ` · ${brl(o.valor_total)}` : ''}</div>
                      </div>
                      <span className={`ea-tag ${o.status === 'entregue' ? 'ok' : o.status === 'cancelada' ? 'er' : 'am'}`}>{o.status}</span>
                    </div>
                    <div className="ea-row" style={{ marginTop: 10, gap: 18 }}>
                      <label className="po-chk"><input type="checkbox" checked={o.entrada_confirmada} disabled={ocupado} onChange={(e) => ordemPatch(o.id, { entrada_confirmada: e.target.checked })} /> Entrada (50%) paga: libera a produção</label>
                      <label className="po-chk"><input type="checkbox" checked={o.saldo_confirmado} disabled={ocupado || !o.entrada_confirmada} onChange={(e) => ordemPatch(o.id, { saldo_confirmado: e.target.checked })} /> Saldo (50%) pago</label>
                      <select style={{ width: 'auto' }} value={o.status} onChange={(e) => ordemPatch(o.id, { status: e.target.value })}>
                        <option value="aberta">aberta</option><option value="entregue">entregue</option><option value="cancelada">cancelada</option>
                      </select>
                    </div>
                    {!o.entrada_confirmada && <div className="ea-msg" style={{ marginTop: 10 }}>Os operadores não veem esta ordem até você confirmar a entrada do cliente.</div>}

                    <div style={{ marginTop: 10 }}>
                      {o.tarefas.map((t) => {
                        const r = rasc(t);
                        const [rot, cor] = STATUS[t.status] || [t.status, ''];
                        const mudou = (r.operario_id || '') !== (t.operario_id || '') || String(r.valor).replace(',', '.') !== String(t.valor || '').replace(/^0$/, '') || (r.prazo || '') !== (t.prazo || '');
                        return (
                          <div className="po-tar" key={t.id}>
                            <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                              <div><b>{t.setor}</b> <span className="ea-mu">· {t.titulo}</span></div>
                              <span className={`ea-tag ${cor}`}>{rot}</span>
                            </div>
                            <div className="po-ln">
                              <select value={r.operario_id} onChange={(e) => setRasc(t, 'operario_id', e.target.value)} disabled={['aprovada', 'paga', 'cancelada'].includes(t.status)}>
                                <option value="">Sem operador</option>
                                {opsAtivos.map((x) => <option key={x.id} value={x.id}>{x.nome} · {x.setor}</option>)}
                                {t.operario_id && !opsAtivos.some((x) => x.id === t.operario_id) && <option value={t.operario_id}>{nomeOp(t.operario_id) || 'inativo'}</option>}
                              </select>
                              <input inputMode="decimal" placeholder="Valor R$" value={r.valor} onChange={(e) => setRasc(t, 'valor', e.target.value)} disabled={['paga'].includes(t.status)} />
                              <input type="date" value={r.prazo} onChange={(e) => setRasc(t, 'prazo', e.target.value)} />
                              {mudou && <button className="ea-btn po-n" disabled={ocupado} onClick={() => salvarTarefa(t)}>Salvar</button>}
                            </div>
                            {t.depende_saldo && <div className="ea-mu" style={{ fontSize: 12, marginTop: 4 }}>Paga só depois do saldo do cliente.</div>}
                            {t.entrega_texto && <div className="po-ent"><b>Entrega:</b>{'\n'}{t.entrega_texto}</div>}
                            {t.comentario_revisao && t.status === 'ajuste' && <div className="po-ent"><b>Ajuste pedido:</b> {t.comentario_revisao}</div>}
                            <div className="ea-row" style={{ marginTop: 8 }}>
                              {t.status === 'entregue' && (
                                <>
                                  <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => tarefaPatch(t.id, { acao: 'aprovar' }, 'Tarefa aprovada.')}>Aprovar</button>
                                  <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => { const c = window.prompt('O que precisa ajustar?'); if (c) tarefaPatch(t.id, { acao: 'ajuste', comentario: c }, 'Ajuste pedido.'); }}>Pedir ajuste</button>
                                </>
                              )}
                              {t.status === 'aprovada' && (
                                <button className="ea-btn" disabled={ocupado} onClick={() => { const op = ops.find((x) => x.id === t.operario_id); if (window.confirm(`Marcar como PAGA ${brl(t.valor)} para ${op ? op.nome : 'o operador'}?\n${op && op.chave_pix ? 'Pix: ' + op.chave_pix + '\n' : ''}Faça o Pix antes de confirmar.`)) tarefaPatch(t.id, { acao: 'pagar' }, 'Pagamento registrado.'); }}>Marcar como paga</button>
                              )}
                              {!['paga', 'cancelada'].includes(t.status) && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => window.confirm('Cancelar esta tarefa?') && tarefaPatch(t.id, { acao: 'cancelar' })}>Cancelar tarefa</button>}
                              {t.status === 'cancelada' && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => tarefaPatch(t.id, { acao: 'reabrir' })}>Reabrir</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {aba === 'operadores' && (
              <>
                <form className="ea-card" onSubmit={criarOperador}>
                  <h2>Novo operador</h2>
                  <div className="ea-grid">
                    <div><label>Nome</label><input value={fp.nome} onChange={(e) => setFp({ ...fp, nome: e.target.value })} required /></div>
                    <div><label>WhatsApp</label><input value={fp.whatsapp} onChange={(e) => setFp({ ...fp, whatsapp: e.target.value })} /></div>
                    <div><label>Chave Pix (para pagar as tarefas)</label><input value={fp.chave_pix} onChange={(e) => setFp({ ...fp, chave_pix: e.target.value })} /></div>
                    <div><label>Setor</label><select value={fp.setor} onChange={(e) => setFp({ ...fp, setor: e.target.value })}>{SETORES.map((s) => <option key={s}>{s}</option>)}</select></div>
                    <div><label>Nível</label><select value={fp.nivel} onChange={(e) => setFp({ ...fp, nivel: e.target.value })}>{NIVEIS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></div>
                  </div>
                  <p className="ea-mu">Guarde só o necessário (LGPD). O operador só entra depois que você enviar o código e ele aceitar as regras de trabalho.</p>
                  <button className="ea-btn" disabled={ocupado}>Cadastrar e gerar código</button>
                </form>

                <div className="ea-card">
                  <h2>Equipe</h2>
                  {[...SETORES, ...Array.from(new Set(ops.map((o) => o.setor))).filter((x) => x && !SETORES.includes(x))].map((s) => {
                    const doSetor = ops.filter((o) => o.setor === s);
                    const ativos = doSetor.filter((o) => o.ativo).length;
                    return (
                      <div key={s} style={{ marginTop: 10 }}>
                        <div className="ea-row"><b>{s}</b><span className={`ea-tag ${ativos >= 3 ? 'ok' : ativos >= 1 ? 'am' : 'er'}`}>{ativos} ativo(s){ativos < 3 ? ' · meta: 1 titular + 2 substitutos' : ''}</span></div>
                        {doSetor.map((o) => (
                          <div className="ea-item" key={o.id} style={{ opacity: o.ativo ? 1 : 0.55 }}>
                            <div>
                              <b>{o.nome}</b> <span className="ea-tag">{(NIVEIS.find((n) => n[0] === o.nivel) || [])[1]}</span>{' '}
                              {o.aceite_em ? <span className="ea-tag ok">regras aceitas</span> : <span className="ea-tag am">ainda não aceitou</span>}{' '}
                              {o.pode_catalogo && <span className="ea-tag ok">catálogo liberado</span>}
                              <div className="ea-mu">{o.whatsapp || 'sem WhatsApp'}{o.chave_pix ? ` · Pix ${o.chave_pix}` : ''}</div>
                            </div>
                            <div className="ea-row">
                              <select style={{ width: 'auto' }} value={o.nivel} onChange={(e) => opPatch(o.id, { nivel: e.target.value })}>{NIVEIS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
                              <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => opPatch(o.id, { pode_catalogo: !o.pode_catalogo })}>{o.pode_catalogo ? 'Bloquear catálogo' : 'Liberar catálogo'}</button>
                              <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => window.confirm('Gerar código novo? O código antigo deixa de funcionar.') && opPatch(o.id, { novo_codigo: true })}>Novo código</button>
                              <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => opPatch(o.id, { ativo: !o.ativo })}>{o.ativo ? 'Desativar' : 'Reativar'}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
