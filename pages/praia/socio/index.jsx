import React, { useCallback, useEffect, useState } from 'react';
import styles from '../../../styles/home.module.css';
import p from '../../../styles/praia.module.css';
import PraiaLayout from '../../../lib/PraiaLayout';
import { api } from '../../../lib/adminClient';
import { REGRAS_SOCIO, PRAIA } from '../../../lib/praia';

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const ABAS = [['inicio', 'Início'], ['dia', 'Meu dia'], ['conta', 'Minha conta'], ['regras', 'Regras'], ['legal', 'Legal'], ['avisos', 'Avisos'], ['ajuda', 'Ajuda']];
const PASSO_DIA = [
  'Confira o kit: caixa térmica, gelo, bolsa, cintas e o crachá/cadastro de ambulante.',
  'Receba o estoque do dia (compra com nota) e registre a retirada de cada produto em "Meu dia".',
  'Venda só onde a prefeitura permite. Mantenha os produtos sempre gelados e a higiene em dia.',
  'No fim do dia, conte a sobra e registre por produto.',
  'Faça o fechamento: valor recebido no PIX e em dinheiro, e o gasto com gelo e embalagem.',
  'Receba a sua metade do lucro por PIX, no mesmo dia.',
];

export default function Socio() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [aba, setAba] = useState('inicio');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [mov, setMov] = useState({ produto_id: '', mov: 'saida', quantidade: '' });
  const [fe, setFe] = useState({ valor_pix: '', valor_dinheiro: '', gelo_embalagem: '' });

  const carregar = useCallback(async () => {
    try { const x = await api('/api/praia/socio/eu'); setD(x); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ er: true, t: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ t: ok }); await carregar(); } catch (e) { setMsg({ er: true, t: e.message }); }
    setOcupado(false);
  }
  const entrar = (ev) => { ev.preventDefault(); rodar(() => api('/api/praia/socio/login', { method: 'POST', body: { codigo } })); };
  const sair = async () => { await api('/api/praia/socio/sair', { method: 'POST' }).catch(() => {}); setD(null); setFase('login'); };
  const registrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/praia/socio/acao', { method: 'POST', body: { tipo: 'movimento', ...mov } }); setMov({ ...mov, quantidade: '' }); }, 'Registrado.'); };
  const fechar = (ev) => { ev.preventDefault(); rodar(() => api('/api/praia/socio/acao', { method: 'POST', body: { tipo: 'fechamento', ...fe } }), 'Dia fechado. A coordenação confere e faz o acerto.'); };

  const nomeProd = (id) => (d && d.produtos.find((x) => x.id === id) || {}).nome || 'Produto';
  const Msg = () => (msg ? <div className={msg.er ? p.erro : p.ok}>{msg.t}</div> : null);

  return (
    <PraiaLayout titulo="Área do sócio" ativo="socio">
      <section className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido}>
          <p className={styles.sobre}>Área do sócio</p>
          {fase === 'carregando' && <p>Carregando…</p>}

          {fase === 'login' && (
            <>
              <h1 className={styles.h2}>Entre com o seu código</h1>
              <p className={styles.sub}>O código foi enviado pela coordenação no WhatsApp quando você foi aprovado.</p>
              <form className={p.form} onSubmit={entrar}>
                {msg && msg.er && <div className={p.erro}>{msg.t}</div>}
                <label htmlFor="cod">Código de acesso</label>
                <input id="cod" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="XXXXX-XXXXX" autoComplete="off" required />
                <button className={`${styles.botao} ${styles.principal} ${p.enviar}`} disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button>
              </form>
            </>
          )}

          {fase === 'pronto' && d && (
            <>
              <h1 className={styles.h2}>Olá, {d.socio.nome.split(' ')[0]}</h1>
              <div className={p.abas} role="tablist">
                {ABAS.map(([k, t]) => (<button key={k} role="tab" aria-selected={aba === k} className={`${p.aba} ${aba === k ? p.on : ''}`} onClick={() => { setAba(k); setMsg(null); }}>{t}</button>))}
                <button className={p.aba} onClick={sair}>Sair</button>
              </div>
              <Msg />

              {aba === 'inicio' && (
                <div className={p.painel}>
                  <h3>Seu kit: {d.socio.kit === 'carrinho' ? 'Carrinho' : 'Caminhante'}</h3>
                  <p>Para sair com estoque, os três itens abaixo precisam estar feitos.</p>
                  {[['Cadastro de ambulante', d.socio.cadastro_ambulante], ['Curso de manipulação de alimentos', d.socio.curso_manipulacao], ['Contrato de parceria assinado', d.socio.contrato_assinado]].map(([t, ok]) => (
                    <div key={t} className={p.trava}><span>{ok ? '✅' : '⬜'}</span><span>{t}</span></div>
                  ))}
                  {d.liberado ? <div className={p.ok}>Kit liberado. Bom trabalho!</div> : <div className={p.alerta}>Kit ainda não liberado. A coordenação marca cada item quando confere o documento.</div>}
                </div>
              )}

              {aba === 'dia' && (
                <div className={p.painel}>
                  <h3>Meu dia ({d.hoje.split('-').reverse().join('/')})</h3>
                  {!d.liberado && <div className={p.alerta}>O kit ainda não foi liberado. Veja a aba Início.</div>}
                  {d.fechamento ? <div className={p.ok}>O dia de hoje já foi fechado.</div> : (
                    <>
                      <ol style={{ margin: '10px 0 16px 20px', color: 'var(--cinza)' }}>{PASSO_DIA.map((x) => <li key={x}>{x}</li>)}</ol>
                      <form onSubmit={registrar}>
                        <div className={`${p.linhaForm} ${p.form}`} style={{ padding: 0, border: 0, boxShadow: 'none', background: 'none' }}>
                          <div><label>Registro</label><select value={mov.mov} onChange={(e) => setMov({ ...mov, mov: e.target.value })}><option value="saida">Retirada de estoque</option><option value="sobra">Sobra no fim do dia</option></select></div>
                          <div><label>Produto</label><select value={mov.produto_id} onChange={(e) => setMov({ ...mov, produto_id: e.target.value })} required><option value="">Escolha…</option>{d.produtos.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select></div>
                          <div><label>Quantidade</label><input type="text" inputMode="numeric" value={mov.quantidade} onChange={(e) => setMov({ ...mov, quantidade: e.target.value })} required /></div>
                          <div><button className={`${styles.botao} ${styles.principal}`} style={{ border: 0, cursor: 'pointer' }} disabled={ocupado}>Registrar</button></div>
                        </div>
                      </form>
                    </>
                  )}
                  <table className={p.tab} style={{ marginTop: 16 }}>
                    <thead><tr><th>Registro</th><th>Produto</th><th>Qtd</th></tr></thead>
                    <tbody>{d.movimentos.length ? d.movimentos.map((m) => (<tr key={m.id}><td>{m.tipo === 'saida' ? 'Retirada' : 'Sobra'}</td><td>{nomeProd(m.produto_id)}</td><td>{m.quantidade}</td></tr>)) : <tr><td colSpan={3}>Nada registrado hoje.</td></tr>}</tbody>
                  </table>
                  {!d.fechamento && (
                    <form onSubmit={fechar} style={{ marginTop: 22 }}>
                      <h3>Fechamento do dia</h3>
                      <div className={`${p.linhaForm} ${p.form}`} style={{ padding: 0, border: 0, boxShadow: 'none', background: 'none' }}>
                        <div><label>Recebido no PIX (R$)</label><input type="text" inputMode="decimal" value={fe.valor_pix} onChange={(e) => setFe({ ...fe, valor_pix: e.target.value })} /></div>
                        <div><label>Recebido em dinheiro (R$)</label><input type="text" inputMode="decimal" value={fe.valor_dinheiro} onChange={(e) => setFe({ ...fe, valor_dinheiro: e.target.value })} /></div>
                        <div><label>Gelo e embalagem (R$)</label><input type="text" inputMode="decimal" value={fe.gelo_embalagem} onChange={(e) => setFe({ ...fe, gelo_embalagem: e.target.value })} /></div>
                        <div><button className={`${styles.botao} ${styles.principal}`} style={{ border: 0, cursor: 'pointer' }} disabled={ocupado}>Fechar o dia</button></div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {aba === 'conta' && (
                <div className={p.painel}>
                  <h3>Minha conta dos últimos dias</h3>
                  <p>Lucro do dia = vendas − custo do produto − gelo e embalagem. A sua parte é a metade.</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table className={p.tab}>
                      <thead><tr><th>Dia</th><th>Vendas esperadas</th><th>Informado</th><th>Lucro</th><th>Sua parte</th></tr></thead>
                      <tbody>{d.resumo.length ? d.resumo.map((r) => (<tr key={r.data}><td>{r.data.split('-').reverse().join('/')}</td><td>{brl(r.vendas_esperadas)}</td><td>{brl(r.valor_informado)}</td><td>{brl(r.lucro)}</td><td><b>{brl(r.parte_de_cada)}</b></td></tr>)) : <tr><td colSpan={5}>Ainda não há dias fechados.</td></tr>}</tbody>
                    </table>
                  </div>
                  <h3 style={{ marginTop: 20 }}>Produtos e preços</h3>
                  <table className={p.tab}><thead><tr><th>Produto</th><th>Preço de venda</th></tr></thead><tbody>{d.produtos.map((x) => <tr key={x.id}><td>{x.nome}</td><td>{brl(x.preco)}</td></tr>)}</tbody></table>
                </div>
              )}

              {aba === 'regras' && (
                <div className={p.painel}><h3>Regras da parceria</h3><ul className={p.lista}>{REGRAS_SOCIO.map((r) => <li key={r}>{r}</li>)}</ul></div>
              )}

              {aba === 'legal' && (
                <div className={`${p.painel} ${p.texto}`}>
                  <h3>O que você precisa saber</h3>
                  <p>Esta é uma parceria comercial entre autônomos. Não há vínculo de emprego, horário fixo ou chefe de turno.</p>
                  <p>Cada sócio responde pelo seu cadastro de ambulante, pelo curso de manipulação e pelos seus tributos. As regras mudam de cidade para cidade: confirme na prefeitura onde pode vender.</p>
                  <p>O kit é emprestado em comodato, com recibo. Você cuida e devolve. O contrato assinado traz os detalhes e prevalece sobre qualquer resumo deste site.</p>
                </div>
              )}

              {aba === 'avisos' && (
                <div className={p.painel}><h3>Avisos da coordenação</h3>
                  {d.avisos.length ? d.avisos.map((a) => (<div key={a.id} style={{ borderTop: '1px solid var(--borda)', padding: '10px 0' }}><b>{a.titulo}</b><p style={{ margin: '4px 0 0', color: 'var(--cinza)' }}>{a.texto}</p></div>)) : <p>Nenhum aviso por enquanto.</p>}
                </div>
              )}

              {aba === 'ajuda' && (
                <div className={p.painel}><h3>Precisa de ajuda?</h3>
                  <p>Fale com a coordenação pelo WhatsApp. Em caso de abordagem da fiscalização, siga a orientação e avise na hora.</p>
                  <div className={styles.acoes} style={{ marginTop: 14 }}><a className={`${styles.botao} ${styles.principal}`} href={`https://wa.me/${PRAIA.whatsapp}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a></div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PraiaLayout>
  );
}
