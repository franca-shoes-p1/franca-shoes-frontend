// Painel do revendedor (acesso pelo link secreto): link de vendas, margem, pedidos, assinatura, loja própria e conta.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';
import { FORN_CSS } from '../../lib/FornecedorCss';
import { ESTADOS, brl } from '../../lib/varejo';
import { SITE_PUBLICO } from '../../lib/pontos';
import { PIX_TIPOS } from '../../lib/fornecedores';
import { STATUS_REV, MARGEM_MAX } from '../../lib/revendedores';

const data = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');
const ASS = { ok: ['Em dia', '#16a34a'], tolerancia: ['Vencida (tolerância)', '#d97706'], vencida: ['Vencida', '#dc2626'], nunca: ['Aguardando 1º pagamento', '#64748b'] };
const ANDA = { aguardando_pagamento: 'Aguardando pagamento', cliente_pagou: 'Cliente pagou', pago: 'Em confecção', pronto_coleta: 'Pronto na fábrica', coletado: 'Com a loja', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' };

async function chamar(corpo) {
  const r = await fetch('/api/revendedor/painel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
  return j;
}

export default function PainelRevendedor() {
  const { query, isReady } = useRouter();
  const token = query.token;
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('link');
  const [pct, setPct] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [qr, setQr] = useState('');
  const [qrAss, setQrAss] = useState('');
  const [copiado, setCopiado] = useState('');
  const [obs, setObs] = useState('');

  const carregar = useCallback(async () => {
    try {
      const r = await fetch('/api/revendedor/painel?token=' + encodeURIComponent(token));
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
      setD(j); setPct(String(j.revendedor.margem_pct).replace('.', ','));
      setPerfil({ nome: j.revendedor.nome, whatsapp: j.revendedor.whatsapp, email: j.revendedor.email || '', cidade: j.revendedor.cidade, estado: j.revendedor.estado, local_entrega: j.revendedor.local_entrega || '', pix_tipo: j.revendedor.pix_tipo || 'cpf', pix_chave: j.revendedor.pix_chave || '', pix_nome: j.revendedor.pix_nome || '' });
    } catch (e) { setErro(e.message); }
  }, [token]);
  useEffect(() => { if (isReady && token) carregar(); }, [isReady, token, carregar]);

  const link = d ? `${SITE_PUBLICO}/calcados?rev=${d.revendedor.codigo}` : '';
  useEffect(() => { if (link) QRCode.toDataURL(link, { margin: 1, width: 240 }).then(setQr).catch(() => setQr('')); }, [link]);
  const pixAss = d ? d.assinatura.pix : '';
  useEffect(() => { if (pixAss) QRCode.toDataURL(pixAss, { margin: 1, width: 240 }).then(setQrAss).catch(() => setQrAss('')); }, [pixAss]);

  async function agir(corpo, ok) {
    setOcupado(true); setMsg(null);
    try { const j = await chamar({ token, ...corpo }); setD(j); if (ok) setMsg({ t: 'ok', x: ok }); return j; }
    catch (e) { setMsg({ t: 'er', x: e.message }); return null; }
    finally { setOcupado(false); }
  }
  async function copiar(txt, k) { try { await navigator.clipboard.writeText(txt); setCopiado(k); setTimeout(() => setCopiado(''), 2500); } catch (e) { setMsg({ t: 'er', x: 'Não consegui copiar. Selecione e copie manualmente.' }); } }

  if (!d && !erro) return <div className="fo"><style>{FORN_CSS}</style><div className="fo-w"><p>Carregando…</p></div></div>;
  if (!d) return <div className="fo"><style>{FORN_CSS}</style><div className="fo-w"><div className="fo-card"><h2>Link não disponível</h2><p>{erro}</p></div></div></div>;

  const r = d.revendedor;
  const ativo = r.status === 'ativo';
  const [stNome, stCor] = STATUS_REV[r.status] || [r.status, '#64748b'];
  const [asNome, asCor] = ASS[d.assinatura.status] || ['', '#64748b'];
  const pctNum = Number(String(pct).replace(',', '.')) || 0;
  const exemploFab = 100;
  const setP = (k) => (e) => setPerfil({ ...perfil, [k]: e.target.value });
  const zapLink = `https://wa.me/?text=${encodeURIComponent('Calçados direto das fábricas de Franca. Veja os modelos: ' + link)}`;

  return (
    <div className="fo">
      <style>{FORN_CSS}</style>
      <Head><title>Painel do revendedor</title><meta name="robots" content="noindex" /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div className="fo-w">
        <h1 style={{ margin: '0 0 4px' }}>Olá, {r.nome}</h1>
        <p className="fo-mu" style={{ margin: '0 0 12px' }}>
          <span className="fo-tag" style={{ background: stCor }}>{stNome}</span>{' '}
          <span className="fo-tag" style={{ background: asCor }}>Assinatura: {asNome}{d.assinatura.ate ? ` até ${data(d.assinatura.ate)}` : ''}</span>
        </p>
        {!ativo && <div className="fo-am">{r.status === 'pendente' ? 'Seu cadastro está em análise. Assim que for liberado, o seu link passa a valer.' : 'Seu cadastro está pausado. Fale com a loja.'}</div>}
        {ativo && ['nunca', 'vencida'].includes(d.assinatura.status) && <div className="fo-am">Seu link só aplica a sua margem com a assinatura em dia. Veja a aba <b>Assinatura</b>.</div>}
        {msg && <div className={msg.t === 'ok' ? 'fo-ok' : 'fo-er'} role="status">{msg.x}</div>}

        <div className="fo-row" style={{ margin: '0 0 12px' }}>
          <div className="fo-card" style={{ margin: 0, flex: '1 1 150px' }}><div className="fo-mu">A receber</div><b style={{ fontSize: 26 }}>{brl(d.resumo.aReceber)}</b></div>
          <div className="fo-card" style={{ margin: 0, flex: '1 1 150px' }}><div className="fo-mu">Em andamento</div><b style={{ fontSize: 26 }}>{brl(d.resumo.emAndamento)}</b></div>
          <div className="fo-card" style={{ margin: 0, flex: '1 1 150px' }}><div className="fo-mu">Já recebido</div><b style={{ fontSize: 26 }}>{brl(d.resumo.recebido)}</b></div>
        </div>

        <div className="fo-tabs" role="tablist">
          {[['link', '🔗 Meu link'], ['pedidos', '📦 Pedidos'], ['assinatura', '💳 Assinatura'], ['loja', '🏪 Minha loja'], ['conta', '👤 Minha conta'], ['ajuda', '❓ Como funciona']].map(([k, t]) => (
            <button key={k} role="tab" aria-selected={aba === k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>
          ))}
        </div>

        {aba === 'link' && (
          <>
            <div className="fo-card">
              <h2>Seu link de vendas</h2>
              <p className="fo-mu">Quem entrar por este link vê a vitrine com os seus preços, e as compras ficam no seu nome.</p>
              <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Seu link de vendas" />
              <p className="fo-row" style={{ marginTop: 10 }}>
                <button className="fo-btn" onClick={() => copiar(link, 'link')}>{copiado === 'link' ? '✓ Copiado' : 'Copiar link'}</button>
                <a className="fo-btn" href={zapLink} target="_blank" rel="noopener noreferrer">Enviar no WhatsApp</a>
                <a className="fo-btn" href={`${SITE_PUBLICO}/calcados?rev=${r.codigo}`} target="_blank" rel="noopener noreferrer">Ver a vitrine</a>
              </p>
              {qr && <img src={qr} alt="QR Code do seu link" width={160} height={160} style={{ display: 'block', margin: '8px 0' }} />}
            </div>
            <div className="fo-card">
              <h2>Sua margem</h2>
              <label htmlFor="mg">Margem sobre o preço da fábrica (%)</label>
              <input id="mg" value={pct} onChange={(e) => setPct(e.target.value)} inputMode="decimal" style={{ maxWidth: 140 }} />
              <p className="fo-mu">Exemplo: um par que a fábrica vende a R$ 100,00 você ganha <b>{brl(exemploFab * pctNum / 100)}</b> por par. (Máximo {MARGEM_MAX}%.) A mudança vale para novos pedidos.</p>
              <button className="fo-btn" disabled={ocupado} onClick={() => agir({ acao: 'margem', pct }, 'Margem atualizada.')}>Salvar margem</button>
            </div>
          </>
        )}

        {aba === 'pedidos' && (
          <div className="fo-card">
            <h2>Pedidos dos seus clientes</h2>
            {d.pedidos.length === 0 && <p className="fo-mu">Ainda não há pedidos.</p>}
            {d.pedidos.map((p) => (
              <div key={p.numero} style={{ borderTop: '1px solid var(--bd)', padding: '10px 0' }}>
                <div className="fo-row" style={{ justifyContent: 'space-between' }}>
                  <b>Pedido {p.numero} · {p.cliente_nome}</b>
                  <span className="fo-mu">{data(p.criado_em)}</span>
                </div>
                <div className="fo-mu">{(p.itens || []).map((i) => `${i.quantidade}× ${i.titulo || i.nome || 'par'}${i.tamanho ? ' ' + i.tamanho : ''}`).join(', ')} · {p.cidade}/{p.estado} · total do cliente {brl(p.total)}</div>
                <div>{ANDA[p.status] || p.status} · sua margem <b>{brl(p.margem_revendedor_total)}</b>{p.repassado_em ? ' · ✓ recebida' : p.status === 'entregue' && p.pix2_pago_em ? ' · a receber' : ''}</div>
                {p.entrega_dia && (
                  <div style={{ margin: '6px 0', padding: 8, border: '1px solid var(--bd)', borderRadius: 8 }}>
                    📍 <b>Entrega: {p.entrega_rodoviaria}, {new Date(p.entrega_dia).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</b> (hora marcada, sem espera)
                    {p.nao_compareceu_em && <div>O cliente não apareceu. A mercadoria segue pelos Correios, com o frete por conta do cliente.</div>}
                    {!p.cliente_avisado_em && !p.nao_compareceu_em && <p style={{ margin: '6px 0 0' }}><button className="fo-btn" disabled={ocupado} onClick={() => agir({ acao: 'avisei', numero: p.numero }, 'Registrado que você avisou o cliente.')}>Avisei o cliente</button></p>}
                    {p.cliente_avisado_em && <div className="fo-mu">Você avisou o cliente em {data(p.cliente_avisado_em)}.</div>}
                  </div>
                )}
                {(p.registros || []).map((x, i) => <div key={i} className="fo-mu">• {new Date(x.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}: {x.texto}</div>)}
                {p.whatsapp && <a href={`https://wa.me/${String(p.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp do cliente</a>}
              </div>
            ))}
          </div>
        )}

        {aba === 'assinatura' && (
          <div className="fo-card">
            <h2>Assinatura mensal · {brl(d.assinatura.valor)}</h2>
            <p className="fo-mu">Pague por PIX e avise a loja; depois da confirmação, o prazo avança 30 dias. Se vencer, o link continua valendo por alguns dias de tolerância.</p>
            {d.assinatura.pix ? (
              <>
                {qrAss && <img src={qrAss} alt="QR Code do PIX da assinatura" width={180} height={180} style={{ display: 'block', margin: '8px 0' }} />}
                <label htmlFor="pa">PIX copia e cola{d.assinatura.titular ? ` (titular: ${d.assinatura.titular})` : ''}</label>
                <textarea id="pa" readOnly rows={3} value={d.assinatura.pix} onFocus={(e) => e.target.select()} />
                <p><button className="fo-btn" onClick={() => copiar(d.assinatura.pix, 'ass')}>{copiado === 'ass' ? '✓ Código copiado' : 'Copiar código'}</button></p>
              </>
            ) : <p className="fo-am">A loja ainda vai enviar a chave PIX pelo WhatsApp.</p>}
          </div>
        )}

        {aba === 'loja' && (
          <div className="fo-card">
            <h2>Quero minha loja</h2>
            <p className="fo-mu">Uma loja de calçados pronta, só sua, com o catálogo das fábricas. Valores iniciais, a confirmar com a loja.</p>
            {d.pacotes.map((p) => (
              <div key={p.id} style={{ borderTop: '1px solid var(--bd)', padding: '10px 0' }}>
                <b>{p.nome}</b> · implantação {brl(p.implantacao)} + {brl(p.mensal)}/mês
                <ul>{p.itens.map((i) => <li key={i}>{i}</li>)}</ul>
                <button className="fo-btn" disabled={ocupado || !ativo} onClick={() => agir({ acao: 'loja', pacote: p.id, mensagem: obs }, 'Pedido enviado! A loja vai falar com você pelo WhatsApp.')}>Quero este pacote</button>
              </div>
            ))}
            <label htmlFor="ob">Recado para a loja (opcional)</label>
            <input id="ob" value={obs} onChange={(e) => setObs(e.target.value)} maxLength={500} />
          </div>
        )}

        {aba === 'conta' && perfil && (
          <form className="fo-card" onSubmit={(e) => { e.preventDefault(); agir({ acao: 'perfil', perfil }, 'Dados salvos.'); }}>
            <h2>Minha conta</h2>
            <label htmlFor="pn">Nome</label><input id="pn" value={perfil.nome} onChange={setP('nome')} maxLength={80} />
            <div className="fo-grid2">
              <div><label htmlFor="pw">WhatsApp</label><input id="pw" value={perfil.whatsapp} onChange={setP('whatsapp')} inputMode="tel" /></div>
              <div><label htmlFor="pe">E-mail</label><input id="pe" value={perfil.email} onChange={setP('email')} /></div>
            </div>
            <div className="fo-grid2">
              <div><label htmlFor="pc">Cidade</label><input id="pc" value={perfil.cidade} onChange={setP('cidade')} /></div>
              <div><label htmlFor="pu">Estado</label><select id="pu" value={perfil.estado} onChange={setP('estado')}>{ESTADOS.map((u) => <option key={u}>{u}</option>)}</select></div>
            </div>
            <label htmlFor="pl">Onde você recebe a mercadoria (rodoviária ou endereço). Vai na nota fiscal.</label>
            <input id="pl" value={perfil.local_entrega} onChange={setP('local_entrega')} maxLength={200} />
            <h3 style={{ marginTop: 16 }}>PIX para receber a sua margem</h3>
            <div className="fo-grid2">
              <div><label htmlFor="pt">Tipo da chave</label><select id="pt" value={perfil.pix_tipo} onChange={setP('pix_tipo')}>{PIX_TIPOS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>
              <div><label htmlFor="pk">Chave PIX</label><input id="pk" value={perfil.pix_chave} onChange={setP('pix_chave')} /></div>
            </div>
            <label htmlFor="pm">Nome como aparece no banco</label><input id="pm" value={perfil.pix_nome} onChange={setP('pix_nome')} maxLength={40} />
            <p style={{ marginTop: 14 }}><button className="fo-btn" disabled={ocupado}>Salvar</button></p>
          </form>
        )}

        {aba === 'ajuda' && (
          <div className="fo-card">
            <h2>Como funciona</h2>
            <ol>
              <li>Em <b>Minha conta</b>, confira os dados, o local de entrega e a chave PIX.</li>
              <li>Em <b>Meu link</b>, defina a sua margem e divulgue o link ou o QR Code.</li>
              <li>O cliente paga em dois PIX: o preço da fábrica (direto a ela) e o restante (à loja).</li>
              <li>A fábrica emite a nota no nome do cliente final e a loja entrega a mercadoria a você em dia e hora marcados.</li>
              <li>Você avisa o cliente e entrega. Se ele não aparecer, a mercadoria segue pelos Correios com o frete por conta dele.</li>
              <li>Depois da entrega confirmada, a loja repassa a sua margem por PIX.</li>
            </ol>
            <p className="fo-mu">Trocas seguem a política de cada fábrica, mostrada em cada modelo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
