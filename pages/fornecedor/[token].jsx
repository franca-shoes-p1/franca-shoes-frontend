// Painel do fornecedor (acesso pelo link secreto): pedidos, catálogo com preço, dados da empresa e acerto da comissão.
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { FORN_CSS } from '../../lib/FornecedorCss';
import { reduzirFoto } from '../../lib/reduzirFoto';
import { brl } from '../../lib/varejo';
import { STATUS_PEDIDO, REVISAO, PIX_TIPOS, ESTOQUE, precoCliente, comissaoUnitaria, r2, fmtCpf } from '../../lib/fornecedores';

const chamar = async (corpo) => {
  const r = await fetch('/api/fornecedor/painel', corpo ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) } : undefined);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
  return j;
};

const MODELO_VAZIO = { id: '', titulo: '', categoria: '', material: '', tamanhos: '', descricao: '', foto_url: '', preco: '', estoque_status: 'disponivel', prazo_postagem_dias: '', prazo_confeccao_dias: '' };
const CATEGORIAS = ['Sandália', 'Sapatilha', 'Tênis', 'Bota', 'Sapato social', 'Chinelo', 'Mocassim', 'Bolsa', 'Cinto', 'Carteira', 'Infantil'];
const preco_br = (n) => String(n ?? '').replace('.', ',');
const data = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');

export default function PainelFornecedor({ token }) {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState(null);
  const [aba, setAba] = useState('pedidos');
  const [ocupado, setOcupado] = useState(false);
  const [m, setM] = useState(MODELO_VAZIO);
  const [perfil, setPerfil] = useState(null);
  const [nota, setNota] = useState({});
  const [cancelando, setCancelando] = useState({});

  const carrega = useCallback(async () => {
    try {
      const j = await fetch('/api/fornecedor/painel?token=' + token).then(async (r) => { const x = await r.json().catch(() => ({})); if (!r.ok) throw new Error(x.erro || 'Erro'); return x; });
      setD(j);
      setPerfil((p) => p || { nome_fantasia: j.empresa.nome_fantasia || '', responsavel: j.empresa.responsavel || '', whatsapp: (j.empresa.whatsapp || '').replace(/^55/, ''), email: j.empresa.email || '', documento: j.empresa.documento || '', endereco_coleta: j.empresa.endereco_coleta || '', emite_nota: !!j.empresa.emite_nota, pix_tipo: j.empresa.pix_tipo || 'cnpj', pix_chave: j.empresa.pix_chave || '', pix_nome: j.empresa.pix_nome || '', troca_defeito_dias: j.empresa.troca_defeito_dias || 30, troca_vontade: !!j.empresa.troca_vontade, troca_vontade_dias: j.empresa.troca_vontade_dias || '', troca_frete_vontade: j.empresa.troca_frete_vontade || 'comprador', troca_obs: j.empresa.troca_obs || '' });
    } catch (e) { setErro(e.message); }
  }, [token]);
  useEffect(() => { carrega(); }, [carrega]);

  async function agir(corpo, ok) {
    setOcupado(true); setMsg(null);
    try {
      const j = await chamar({ token, ...corpo });
      setD(j);
      if (ok) setMsg({ t: 'ok', x: ok });
      return true;
    } catch (e) { setMsg({ t: 'er', x: e.message }); return false; }
    finally { setOcupado(false); }
  }

  async function enviarFoto(ev) {
    const arq = ev.target.files && ev.target.files[0];
    if (!arq) return;
    setOcupado(true); setMsg(null);
    try {
      const imagem = await reduzirFoto(arq);
      const r = await fetch('/api/fornecedor/foto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, imagem }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
      setM((x) => ({ ...x, foto_url: j.url }));
    } catch (e) { setMsg({ t: 'er', x: e.message }); }
    setOcupado(false); ev.target.value = '';
  }

  async function salvarModelo(ev) {
    ev.preventDefault();
    const ok = await agir({ acao: 'produto', produto: m }, m.id ? 'Modelo atualizado.' : 'Modelo enviado! Vamos conferir e colocar no site em breve.');
    if (ok) setM(MODELO_VAZIO);
  }

  const editar = (p) => { setM({ id: p.id, titulo: p.titulo_publico || '', categoria: p.categoria || '', material: p.material || '', tamanhos: p.tamanhos || '', descricao: p.descricao || '', foto_url: p.foto_url || '', preco: preco_br(p.preco_fornecedor), estoque_status: p.estoque_status || 'disponivel', prazo_postagem_dias: p.prazo_postagem_dias || '', prazo_confeccao_dias: p.prazo_confeccao_dias || '' }); setAba('modelos'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (!d && !erro) return <div className="fo"><style>{FORN_CSS}</style><div className="fo-w"><p>Carregando…</p></div></div>;
  if (!d) return <div className="fo"><style>{FORN_CSS}</style><div className="fo-w"><div className="fo-card"><h2>Link não disponível</h2><p>{erro}</p></div></div></div>;

  const e = d.empresa;
  const ativo = e.status === 'ativo';
  const pct = Number(e.comissao_pct) || 0;
  const pn = Number(String(m.preco).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
  const pedidosAbertos = d.pedidos.filter((p) => ['aguardando_pagamento', 'cliente_pagou', 'pago'].includes(p.status));
  const faltaPix = !e.pix_chave;

  return (
    <div className="fo">
      <style>{FORN_CSS}</style>
      <Head><title>Painel do fornecedor</title><meta name="robots" content="noindex" /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div className="fo-w">
        <h1>Painel de {e.nome_fantasia}</h1>
        {!ativo && <div className="fo-am">{e.status === 'pendente' ? 'Seu cadastro está em análise. Assim que for liberado, você poderá cadastrar os modelos.' : 'Seu cadastro está pausado. Fale com a loja.'}</div>}
        {ativo && faltaPix && <div className="fo-am"><b>Primeiro passo:</b> cadastre a sua chave PIX na aba “Minha empresa”. Sem ela os clientes não conseguem pagar.</div>}
        {msg && <div className={msg.t === 'ok' ? 'fo-ok' : 'fo-er'} role="status">{msg.x}</div>}

        <div className="fo-row" style={{ margin: '0 0 12px' }}>
          <div className="fo-card" style={{ margin: 0, flex: '1 1 150px' }}><div className="fo-mu">Pedidos para atender</div><b style={{ fontSize: 26 }}>{pedidosAbertos.length}</b></div>
          <div className="fo-card" style={{ margin: 0, flex: '1 1 150px' }}><div className="fo-mu">Modelos no site</div><b style={{ fontSize: 26 }}>{d.produtos.filter((p) => p.revisao === 'aprovado' && p.ativo).length}</b></div>
          <div className="fo-card" style={{ margin: 0, flex: '1 1 150px' }}><div className="fo-mu">Vendas confirmadas</div><b style={{ fontSize: 26 }}>{brl(d.vendas)}</b></div>
        </div>

        <div className="fo-tabs" role="tablist">
          {[['pedidos', '📦 Pedidos'], ['modelos', '👟 Meus modelos'], ['empresa', '🏭 Minha empresa'], ['acerto', '💰 Como você recebe'], ['ajuda', '❓ Como funciona']].map(([k, t]) => (
            <button key={k} className={aba === k ? 'on' : ''} onClick={() => { setAba(k); setMsg(null); }}>{t}</button>
          ))}
        </div>

        {aba === 'pedidos' && (
          <>
            {d.pedidos.length === 0 && <div className="fo-card">Ainda não há pedidos. Quando um cliente comprar um modelo seu, ele aparece aqui e avisamos você pelo WhatsApp.</div>}
            {d.pedidos.map((p) => {
              const st = STATUS_PEDIDO[p.status] || [p.status, '#64748b'];
              return (
                <div key={p.id} className="fo-card">
                  <div className="fo-row" style={{ justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>Pedido nº {p.numero} <span className="fo-mu" style={{ fontWeight: 400 }}>· {data(p.criado_em)}</span></h3>
                    <span className="fo-tag" style={{ background: st[1] }}>{st[0]}</span>
                  </div>
                  <p style={{ margin: '8px 0 4px' }}>{(p.itens || []).map((i, k) => <span key={k} style={{ display: 'block' }}>{i.quantidade}× {i.titulo}{i.tamanho ? ` (nº ${i.tamanho})` : ''}</span>)}</p>
                  {['pago', 'pronto_coleta', 'coletado'].includes(p.status) && (
                    <div className="fo-am" style={{ margin: '6px 0' }}>
                      <b>Dados para a nota fiscal (no nome do cliente final):</b><br />
                      {p.cliente_nome} · CPF {fmtCpf(p.cliente_cpf) || 'não informado'}<br />
                      {p.local_entrega ? <>Local de entrega que vai na nota: <b>{p.local_entrega}</b></> : <>Local de entrega: a loja vai informar pelo WhatsApp antes da coleta. Se não chegar, pergunte.</>}
                    </div>
                  )}
                  <p className="fo-mu" style={{ margin: '4px 0' }}>
                    Cliente: {p.cliente_nome} · WhatsApp {p.whatsapp}<br />
                    Entrega: {p.rua}, {p.numero_casa}{p.complemento ? ` ${p.complemento}` : ''} · {p.bairro} · {p.cidade}/{p.estado} · CEP {p.cep}
                    {p.observacao && <><br />Observação do cliente: {p.observacao}</>}
                  </p>
                  <p style={{ margin: '4px 0' }}>Você recebe pelo PIX: <b>{brl(p.preco_fornecedor_total)}</b> (o seu preço dos produtos). O cliente paga a comissão da loja, a margem do revendedor e o frete em outro PIX, para a loja. Você não paga comissão nem postagem.</p>
                  {p.codigo_rastreio && <p style={{ margin: '4px 0' }}>Rastreio: <b>{p.codigo_rastreio}</b></p>}
                  {p.status === 'cancelado' && p.motivo_cancelamento && <p className="fo-mu">Motivo: {p.motivo_cancelamento}</p>}

                  {['aguardando_pagamento', 'cliente_pagou'].includes(p.status) && ativo && (
                    <div className="fo-row" style={{ marginTop: 8 }}>
                      <button className="fo-btn" disabled={ocupado} onClick={() => agir({ acao: 'pedido', id: p.id, passo: 'confirmar_pagamento' }, 'Pagamento confirmado. Agora separe o pedido.')}>Recebi o PIX ✔</button>
                      {p.status === 'cliente_pagou' && <span className="fo-mu">O cliente avisou que pagou. Confira no seu banco antes de confirmar.</span>}
                    </div>
                  )}
                  {p.status === 'pago' && ativo && (
                    <div style={{ marginTop: 8 }}>
                      <label className="fo-chk" style={{ display: 'flex', gap: 8 }}><input type="checkbox" style={{ width: 'auto' }} checked={!!nota[p.id]} onChange={(ev) => setNota({ ...nota, [p.id]: ev.target.checked })} /> A nota fiscal está dentro da embalagem e o pedido está conferido</label>
                      <button className="fo-btn" style={{ marginTop: 8 }} disabled={ocupado || !nota[p.id]} onClick={() => agir({ acao: 'pedido', id: p.id, passo: 'pronto', nota_na_embalagem: true }, 'Pedido pronto! Vamos coletar com você.')}>Pedido pronto para coleta</button>
                    </div>
                  )}
                  {['aguardando_pagamento', 'cliente_pagou', 'pago'].includes(p.status) && ativo && (
                    <div style={{ marginTop: 10 }}>
                      {!cancelando[p.id] ? (
                        <button className="fo-btn fo-btn2" onClick={() => setCancelando({ ...cancelando, [p.id]: '' })}>Cancelar este pedido</button>
                      ) : (
                        <div>
                          <label htmlFor={'mot' + p.id}>Motivo (ex.: sem estoque no número pedido)</label>
                          <input id={'mot' + p.id} value={cancelando[p.id]} onChange={(ev) => setCancelando({ ...cancelando, [p.id]: ev.target.value })} maxLength={200} />
                          <p className="fo-mu">Se o cliente já pagou, você precisa devolver o PIX a ele.</p>
                          <button className="fo-btn" disabled={ocupado} onClick={async () => { if (await agir({ acao: 'pedido', id: p.id, passo: 'cancelar', motivo: cancelando[p.id] }, 'Pedido cancelado.')) setCancelando({ ...cancelando, [p.id]: undefined }); }}>Confirmar cancelamento</button>{' '}
                          <button className="fo-btn fo-btn2" onClick={() => setCancelando({ ...cancelando, [p.id]: undefined })}>Voltar</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {aba === 'modelos' && (
          <>
            {ativo && (
              <form className="fo-card" onSubmit={salvarModelo}>
                <h2>{m.id ? 'Editar modelo' : 'Cadastrar um modelo'}</h2>
                <div className="fo-row">
                  <div className="fo-foto">{m.foto_url ? <img src={m.foto_url} alt="" /> : '📷'}</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ marginTop: 0 }}>Foto do modelo</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={enviarFoto} disabled={ocupado} />
                    <p className="fo-mu" style={{ margin: '4px 0 0', fontSize: 14 }}>Fundo limpo e boa luz vendem mais. Use só fotos suas.</p>
                  </div>
                </div>
                <label htmlFor="mt">Nome do modelo</label>
                <input id="mt" value={m.titulo} onChange={(ev) => setM({ ...m, titulo: ev.target.value })} maxLength={120} required />
                <div className="fo-grid2">
                  <div><label htmlFor="mc">Tipo</label><input id="mc" list="cats" value={m.categoria} onChange={(ev) => setM({ ...m, categoria: ev.target.value })} maxLength={60} placeholder="Sandália, Bolsa…" /><datalist id="cats">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist></div>
                  <div><label htmlFor="mm">Material</label><input id="mm" value={m.material} onChange={(ev) => setM({ ...m, material: ev.target.value })} maxLength={80} placeholder="Couro, sintético…" /></div>
                </div>
                <label htmlFor="mz">Números disponíveis</label>
                <input id="mz" value={m.tamanhos} onChange={(ev) => setM({ ...m, tamanhos: ev.target.value })} maxLength={80} placeholder="Ex.: 34 ao 40" />
                <label htmlFor="md">Descrição</label>
                <textarea id="md" value={m.descricao} onChange={(ev) => setM({ ...m, descricao: ev.target.value })} maxLength={1500} />
                <label htmlFor="mp">O seu preço por par (o que você quer receber)</label>
                <input id="mp" value={m.preco} onChange={(ev) => setM({ ...m, preco: ev.target.value })} inputMode="decimal" placeholder="Ex.: 80,00" required />
                {pn > 0 && (
                  <div className="fo-calc">
                    <div><span>Você recebe</span><b>{brl(pn)}</b></div>
                    <div><span>Comissão da loja ({pct}%)</span><b>{brl(comissaoUnitaria(pn, pct))}</b></div>
                    <div><span>O cliente paga no site</span><b>{brl(precoCliente(pn, pct))}</b></div>
                  </div>
                )}
                <div className="fo-grid2">
                  <div><label htmlFor="mf">Dias de confecção (fazer o par depois do pedido)</label><input id="mf" value={m.prazo_confeccao_dias} onChange={(ev) => setM({ ...m, prazo_confeccao_dias: ev.target.value })} inputMode="numeric" placeholder="Ex.: 10" /></div>
                  <div className="fo-mu" style={{ alignSelf: 'end', fontSize: 14 }}>O cliente vê este prazo na vitrine. Seja realista: prazo cumprido vende mais do que prazo curto.</div>
                </div>
                <div className="fo-grid2">
                  <div><label htmlFor="me">Estoque</label><select id="me" value={m.estoque_status} onChange={(ev) => setM({ ...m, estoque_status: ev.target.value })}>{ESTOQUE.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>
                  <div><label htmlFor="mj">Dias para separar o pedido</label><input id="mj" value={m.prazo_postagem_dias} onChange={(ev) => setM({ ...m, prazo_postagem_dias: ev.target.value })} inputMode="numeric" placeholder="Ex.: 2" /></div>
                </div>
                <p className="fo-mu" style={{ fontSize: 14 }}>Modelos novos passam por uma conferência antes de ir para o site. Mudar preço, estoque e prazo vale na hora; mudar foto, nome ou descrição manda o modelo de novo para conferência.</p>
                <div className="fo-row"><button className="fo-btn" disabled={ocupado}>{m.id ? 'Salvar alterações' : 'Enviar modelo'}</button>{m.id && <button type="button" className="fo-btn fo-btn2" onClick={() => setM(MODELO_VAZIO)}>Cancelar edição</button>}</div>
              </form>
            )}
            {d.produtos.map((p) => {
              const rv = REVISAO[p.revisao] || REVISAO.pendente;
              return (
                <div key={p.id} className="fo-card fo-prod">
                  <div className="fo-th">{p.foto_url ? <img src={p.foto_url} alt="" /> : '👟'}</div>
                  <div>
                    <b>{p.titulo_publico}</b> <span className="fo-tag" style={{ background: rv[1] }}>{rv[0]}</span>{p.revisao === 'aprovado' && !p.ativo && <span className="fo-tag" style={{ background: '#64748b', marginLeft: 6 }}>Pausado</span>}
                    <div className="fo-mu">Você recebe {brl(p.preco_fornecedor)} · cliente paga {brl(p.preco_venda_sugerido)} · {(ESTOQUE.find(([k]) => k === p.estoque_status) || [])[1] || ''}</div>
                    <div className="fo-row" style={{ marginTop: 6 }}>
                      <button className="fo-btn fo-btn2" onClick={() => editar(p)} disabled={!ativo}>Editar</button>
                      {p.revisao === 'aprovado' && ativo && <button className="fo-btn fo-btn2" disabled={ocupado} onClick={() => agir({ acao: 'produto_pausar', id: p.id, ligar: !p.ativo })}>{p.ativo ? 'Tirar do site' : 'Voltar ao site'}</button>}
                    </div>
                  </div>
                </div>
              );
            })}
            {d.produtos.length === 0 && <div className="fo-card">Você ainda não cadastrou modelos.</div>}
          </>
        )}

        {aba === 'empresa' && perfil && (
          <form className="fo-card" onSubmit={(ev) => { ev.preventDefault(); agir({ acao: 'perfil', perfil }, 'Dados salvos.'); }}>
            <h2>Dados da empresa e PIX</h2>
            <p className="fo-mu">A chave PIX é para onde os clientes pagam. Confira com cuidado: o dinheiro vai direto para ela.</p>
            <label htmlFor="pn">Nome da empresa ou marca</label><input id="pn" value={perfil.nome_fantasia} onChange={(ev) => setPerfil({ ...perfil, nome_fantasia: ev.target.value })} />
            <label htmlFor="pr">Responsável</label><input id="pr" value={perfil.responsavel} onChange={(ev) => setPerfil({ ...perfil, responsavel: ev.target.value })} />
            <div className="fo-grid2">
              <div><label htmlFor="pw">WhatsApp</label><input id="pw" value={perfil.whatsapp} onChange={(ev) => setPerfil({ ...perfil, whatsapp: ev.target.value })} inputMode="tel" /></div>
              <div><label htmlFor="pe">E-mail</label><input id="pe" value={perfil.email} onChange={(ev) => setPerfil({ ...perfil, email: ev.target.value })} /></div>
            </div>
            <label htmlFor="pd">CNPJ ou CPF (só números)</label><input id="pd" value={perfil.documento} onChange={(ev) => setPerfil({ ...perfil, documento: ev.target.value })} inputMode="numeric" />
            <label htmlFor="pc">Endereço de coleta dos pedidos</label><input id="pc" value={perfil.endereco_coleta} onChange={(ev) => setPerfil({ ...perfil, endereco_coleta: ev.target.value })} />
            <label className="fo-chk" style={{ display: 'flex', gap: 8 }}><input type="checkbox" style={{ width: 'auto' }} checked={perfil.emite_nota} onChange={(ev) => setPerfil({ ...perfil, emite_nota: ev.target.checked })} /> Eu consigo emitir nota fiscal para o cliente</label>
            <h3 style={{ marginTop: 16 }}>Política de troca</h3>
            <p className="fo-mu">Quem vende é você, então a regra de troca é sua. Ela aparece para o cliente na vitrine, antes de comprar, e no regulamento do site.</p>
            <div className="fo-grid2">
              <div><label htmlFor="td">Troca por defeito: prazo em dias (mínimo recomendado: 30)</label><input id="td" value={perfil.troca_defeito_dias} onChange={(ev) => setPerfil({ ...perfil, troca_defeito_dias: ev.target.value })} inputMode="numeric" /></div>
              <div><label htmlFor="tf">Se o cliente trocar por tamanho/vontade, quem paga o frete?</label><select id="tf" value={perfil.troca_frete_vontade} onChange={(ev) => setPerfil({ ...perfil, troca_frete_vontade: ev.target.value })}><option value="comprador">O comprador</option><option value="fornecedor">Eu (fornecedor)</option></select></div>
            </div>
            <label className="fo-chk" style={{ display: 'flex', gap: 8 }}><input type="checkbox" style={{ width: 'auto' }} checked={perfil.troca_vontade} onChange={(ev) => setPerfil({ ...perfil, troca_vontade: ev.target.checked })} /> Aceito troca por tamanho ou vontade do cliente</label>
            {perfil.troca_vontade && (<><label htmlFor="tv">Prazo para pedir essa troca (dias)</label><input id="tv" value={perfil.troca_vontade_dias} onChange={(ev) => setPerfil({ ...perfil, troca_vontade_dias: ev.target.value })} inputMode="numeric" placeholder="Ex.: 7" /></>)}
            {!perfil.troca_vontade && <p className="fo-mu">Sem troca por tamanho: o site avisa o cliente antes da compra para ele conferir a tabela de medidas.</p>}
            <label htmlFor="to">Outras regras (opcional)</label><input id="to" value={perfil.troca_obs} onChange={(ev) => setPerfil({ ...perfil, troca_obs: ev.target.value })} maxLength={300} placeholder="Ex.: produto sem uso e com a caixa original" />
            <h3 style={{ marginTop: 16 }}>Chave PIX</h3>
            <div className="fo-grid2">
              <div><label htmlFor="pt">Tipo da chave</label><select id="pt" value={perfil.pix_tipo} onChange={(ev) => setPerfil({ ...perfil, pix_tipo: ev.target.value })}>{PIX_TIPOS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>
              <div><label htmlFor="pk">Chave</label><input id="pk" value={perfil.pix_chave} onChange={(ev) => setPerfil({ ...perfil, pix_chave: ev.target.value })} /></div>
            </div>
            <label htmlFor="px">Nome do titular da conta (como aparece no banco)</label><input id="px" value={perfil.pix_nome} onChange={(ev) => setPerfil({ ...perfil, pix_nome: ev.target.value })} maxLength={40} />
            <p style={{ marginTop: 14 }}><button className="fo-btn" disabled={ocupado || !ativo}>Salvar</button></p>
          </form>
        )}

        {aba === 'acerto' && (
          <div className="fo-card">
            <h2>Como você recebe</h2>
            <p className="fo-mu">O cliente paga em dois PIX. O <b>PIX 1</b> é o seu preço dos produtos e cai direto na sua conta. O <b>PIX 2</b> (comissão, margem do revendedor e frete) vai para a loja. Você não paga comissão nem postagem, não existe acerto semanal.</p>
            <p className="fo-mu">Vendas já confirmadas (seu preço dos produtos): <b>{brl(d.vendas)}</b></p>
            {d.pedidos.filter((p) => !['cancelado', 'aguardando_pagamento'].includes(p.status)).slice(0, 30).map((p) => (
              <div key={p.id} className="fo-row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--bd)', padding: '8px 0' }}>
                <span>Pedido {p.numero} · {data(p.criado_em)}</span>
                <b>{brl(p.preco_fornecedor_total)}</b>
              </div>
            ))}
          </div>
        )}

        {aba === 'ajuda' && (
          <div className="fo-card">
            <h2>Passo a passo</h2>
            <ol>
              <li>Na aba <b>Minha empresa</b>, confira os dados e cadastre a chave PIX.</li>
              <li>Na aba <b>Meus modelos</b>, cadastre cada modelo com foto, números e o seu preço. O painel mostra quanto o cliente vai pagar.</li>
              <li>Quando o modelo for aprovado, ele aparece na vitrine do site.</li>
              <li>Quando chegar um pedido, confira o PIX no seu banco e clique <b>Recebi o PIX</b>.</li>
              <li>Faça o pedido (confecção), emita a nota fiscal no nome e CPF do cliente final, com o local de entrega que aparecer no pedido, coloque a nota na embalagem e clique <b>Pedido pronto para coleta</b>.</li>
              <li>A loja coleta com você, com a nota no nome do cliente final, e leva até o cliente por rota de entrega ou pelos Correios.</li>
              <li>O PIX do seu preço cai direto na sua conta. A comissão e o frete ficam por conta do cliente, em outro PIX para a loja.</li>
            </ol>
            <p className="fo-mu">Se faltar estoque, cancele o pedido e devolva o PIX ao cliente. Dúvidas? Fale com a loja pelo WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store');
  const token = String(params.token || '');
  if (!/^[0-9a-f]{24}$/.test(token)) return { notFound: true };
  return { props: { token } };
}
