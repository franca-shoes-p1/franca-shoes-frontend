import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const ST = { entregue: ['Em análise', 'am'], ajuste: ['Ajuste pedido', 'er'], aprovada: ['Aprovada', 'ok'], paga: ['Paga', 'ok'], recusada: ['Recusada', 'er'] };
const RST = { pendente: 'Aguardando', aprovado: 'Aprovado', recusado: 'Recusado' };

export default function OperadorOficina() {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState(null);
  const [erroLogin, setErroLogin] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [div, setDiv] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(async () => {
    try { setD(await api('/api/operador/oficina')); }
    catch (e) { if (e.status === 401) setErroLogin(true); else setMsg({ tipo: 'er', texto: e.message }); }
  }, []);
  useEffect(() => { carregar(); api('/api/operador/oficina/divulgacao').then(setDiv).catch(() => {}); }, [carregar]);

  async function copiarLink() {
    try { await navigator.clipboard.writeText(div.link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch (e) { setMsg({ tipo: 'er', texto: 'Não deu para copiar. Selecione o link e use Ctrl+C.' }); }
  }

  async function resgatar(b) {
    if (!confirm(`Pedir "${b.nome}" por ${b.custo_pontos} pontos?`)) return;
    setOcupado(true); setMsg(null);
    try { await api('/api/operador/oficina/resgatar', { method: 'POST', body: { beneficio_id: b.id } }); setMsg({ tipo: 'ok', texto: 'Pedido enviado. A coordenação responde por WhatsApp.' }); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }

  return (
    <div className="ea">
      <Head><title>Oficina Digital</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in" style={{ maxWidth: 720 }}>
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div><h1>Oficina Digital</h1>{d && <div className="ea-mu">{d.operador.nome} · {d.operador.setor}</div>}</div>
          <Link href="/operador" className="ea-btn ea-btn2">Minhas tarefas</Link>
        </div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {erroLogin && <div className="ea-card">Faça login em <Link href="/operador">/operador</Link> e volte.</div>}
        {!d && !erroLogin && <div className="ea-card">Carregando…</div>}

        {d && !d.operador.aceite_em && (
          <div className="ea-card"><b>Antes de entregar qualquer cartão</b>, leia e aceite as regras de trabalho em <Link href="/operador">Minhas tarefas</Link>.</div>
        )}

        {d && (
          <>
            <div className="ea-card">
              <h2 style={{ marginTop: 0 }}>Seus Pontos Oficina</h2>
              <div style={{ fontSize: 34, fontWeight: 800 }}>{d.disponivel} <span className="ea-mu" style={{ fontSize: 14, fontWeight: 400 }}>disponíveis{d.reservado ? ` (${d.reservado} reservados em pedidos)` : ''}</span></div>
              <p className="ea-mu" style={{ marginBottom: 0 }}>Pontos são benefícios (descontos, prioridade, mentoria). Valem 12 meses, não são dinheiro, não se compram e não viram participação em empresa.</p>
            </div>

            {div && div.codigo && (
              <div className="ea-card">
                <h2 style={{ marginTop: 0 }}>Divulgação</h2>
                <p className="ea-mu" style={{ marginTop: 0 }}>Seu link de afiliado. Quando alguém que você indicou pagar o pedido completo, você ganha 1 ponto para cada R$ 1,00.</p>
                <div className="ea-item" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <code style={{ flex: 1, wordBreak: 'break-all' }}>{div.link}</code>
                  <button className="ea-btn" onClick={copiarLink}>{copiado ? 'Copiado!' : 'Copiar link'}</button>
                </div>
                <div className="ea-row" style={{ gap: 18, margin: '10px 0', flexWrap: 'wrap' }}>
                  <span><b>{div.resumo.clientes}</b> <span className="ea-mu">clientes indicados</span></span>
                  <span><b>{div.resumo.pagos}</b> <span className="ea-mu">pagos</span></span>
                  <span><b>{div.resumo.pontos}</b> <span className="ea-mu">pontos ganhos</span></span>
                  <span><b>{div.resumo.operadores}</b> <span className="ea-mu">cadastros de operador</span></span>
                </div>
                <div className="ea-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <a className="ea-btn" href={`/afiliados/motor?ref=${div.codigo}`}>Montar meus posts</a>
                  <a className="ea-btn ea-btn2" href="/manual-afiliado">Manual do afiliado</a>
                </div>
                {div.lista.length > 0 && (
                  <>
                    <h3>Suas indicações</h3>
                    {div.lista.map((i) => (
                      <div className="ea-item" key={i.id}>
                        <span>{i.indicado} <span className="ea-mu">· {i.tipo === 'pedido' ? 'pedido' : 'cadastro de operador'} · {new Date(i.criado_em).toLocaleDateString('pt-BR')}</span></span>
                        <span className={`ea-tag ${i.status === 'paga' ? 'ok' : 'am'}`}>{i.status === 'paga' ? `+${i.pontos} pontos` : 'Aguardando pagamento'}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="ea-card">
              <h2 style={{ marginTop: 0 }}>Cartões de Tarefa</h2>
              {d.cartoes.length === 0 && <p className="ea-mu">Você concluiu tudo por enquanto. Novos cartões aparecem aqui.</p>}
              {d.cartoes.map((c) => {
                const ult = c.minhas[0];
                const [rot, cor] = ult ? ST[ult.status] || [ult.status, ''] : [null, ''];
                return (
                  <div className="ea-item" key={c.id} style={{ alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <b>{c.codigo === 'C1' ? '⭐ ' : ''}{c.titulo}</b>
                      <div className="ea-mu">{c.tempo} · {c.valor ? brl(c.valor) : 'sem pagamento em dinheiro'} · +{c.pontos} pontos</div>
                      {ult && ult.status === 'ajuste' && ult.comentario_revisao && <div className="ea-mu" style={{ color: 'var(--er)' }}>Ajuste: {ult.comentario_revisao}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {rot && <div><span className={`ea-tag ${cor}`}>{rot}</span></div>}
                      <Link href={`/operador/cartao/${c.id}`} className="ea-btn" style={{ marginTop: 6, display: 'inline-block' }}>{ult && ult.status !== 'ajuste' && ult.status !== 'recusada' ? 'Ver' : 'Abrir'}</Link>
                    </div>
                  </div>
                );
              })}
              {d.feitos.length > 0 && <p className="ea-mu" style={{ marginBottom: 0 }}>Concluídos: {d.feitos.join(', ')}</p>}
            </div>

            <div className="ea-card">
              <h2 style={{ marginTop: 0 }}>Benefícios</h2>
              {d.beneficios.map((b) => (
                <div className="ea-item" key={b.id} style={{ alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}><b>{b.nome}</b><div className="ea-mu">{b.descricao}</div></div>
                  <button className="ea-btn" disabled={ocupado || d.disponivel < b.custo_pontos || !d.operador.aceite_em} onClick={() => resgatar(b)}>{b.custo_pontos} pts</button>
                </div>
              ))}
              {d.resgates.length > 0 && <><h3>Seus pedidos</h3>{d.resgates.map((r) => <div className="ea-item" key={r.id}><span>{r.beneficio && r.beneficio.nome}</span><span>{RST[r.status] || r.status} · {r.pontos} pts</span></div>)}</>}
            </div>

            {d.vagas.length > 0 && (
              <div className="ea-card">
                <h2 style={{ marginTop: 0 }}>Vagas em projetos</h2>
                {d.vagas.map((v) => <div className="ea-item" key={v.id}><span><b>{v.titulo}</b> · {v.empreendimento}<div className="ea-mu">{v.descricao}</div></span></div>)}
                <p className="ea-mu" style={{ marginBottom: 0 }}>Participação em projetos é por convite da coordenação, com contrato formal. Não é consequência automática dos pontos.</p>
              </div>
            )}

            <div className="ea-card">
              <h2 style={{ marginTop: 0 }}>Extrato</h2>
              {d.extrato.length === 0 && <p className="ea-mu">Ainda sem movimentos. Seus pontos aparecem aqui quando um cartão for aprovado.</p>}
              {d.extrato.map((x, i) => <div className="ea-item" key={i}><span>{x.motivo} <span className="ea-mu">· {new Date(x.criado_em).toLocaleDateString('pt-BR')}</span></span><b style={{ color: x.pontos < 0 ? 'var(--er)' : 'var(--ok)' }}>{x.pontos > 0 ? '+' : ''}{x.pontos}</b></div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
