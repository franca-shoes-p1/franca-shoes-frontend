// Página pública: quem quer ser revendedor (vende com link próprio, recebe a margem depois da entrega).
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FORN_CSS } from '../../lib/FornecedorCss';
import { ESTADOS, brl } from '../../lib/varejo';
import { MENSALIDADE, TOLERANCIA_DIAS, PACOTES } from '../../lib/revendedores';

const VAZIO = { nome: '', whatsapp: '', email: '', cidade: '', estado: 'MG', local_entrega: '', aceite: false, site: '' };

export default function CadastroRevendedor() {
  const [f, setF] = useState(VAZIO);
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [feito, setFeito] = useState(false);
  const inicio = useRef(0);
  useEffect(() => { inicio.current = Date.now(); }, []);
  const muda = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const r = await fetch('/api/revendedor/cadastro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, tempo: Date.now() - inicio.current }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
      setFeito(true);
    } catch (e) { setMsg(e.message); }
    setOcupado(false);
  }

  return (
    <div className="fo">
      <style>{FORN_CSS}</style>
      <Head>
        <title>Seja revendedor de calçados de Franca</title>
        <meta name="description" content="Venda calçados de fábricas de Franca com o seu link e o seu preço. Você define a sua margem e recebe depois da entrega." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="fo-w">
        <div className="fo-hero">
          <h1>Venda calçados de fábricas de Franca com o seu link</h1>
          <p>Você escolhe a sua margem, atende o seu cliente e recebe a sua parte depois da entrega. A nota fiscal sai da fábrica, no nome do cliente final.</p>
          <p style={{ margin: 0 }}><a className="fo-btn" style={{ background: '#fff', color: '#1e3a8a' }} href="#cadastro">Quero ser revendedor</a></p>
        </div>

        <div className="fo-card">
          <h2>Como funciona</h2>
          <ul className="fo-pass">
            <li><b>1. Cadastro</b>Você pede o cadastro. Conferimos e liberamos o seu painel e o seu link de vendas.</li>
            <li><b>2. Sua margem</b>Você define quantos % quer ganhar sobre o preço da fábrica. O site mostra o preço final ao seu cliente.</li>
            <li><b>3. Pedido</b>O cliente compra pelo seu link e paga em dois PIX: o preço da fábrica vai direto para ela, e o restante vai para a loja.</li>
            <li><b>4. Entrega</b>A fábrica emite a nota fiscal. Nós buscamos na fábrica e entregamos a você em dia e hora marcados, na rodoviária ou por Correios. Você entrega ao cliente.</li>
            <li><b>5. Sua parte</b>Depois da entrega confirmada, repassamos a sua margem por PIX. O painel mostra o que está “a receber” e o que já foi recebido.</li>
          </ul>
          <p className="fo-mu" style={{ margin: 0 }}>O site está em fase de testes e não prometemos volume de vendas.</p>
        </div>

        <div className="fo-card">
          <h2>Regras</h2>
          <details open><summary>Assinatura mensal</summary><p>A assinatura é de {brl(MENSALIDADE)} por mês, paga por PIX e confirmada pela loja. Se vencer, o seu link continua valendo por {TOLERANCIA_DIAS} dias. Depois disso, quem entrar pelo seu link verá os preços normais, e as vendas deixam de ser atribuídas a você até regularizar.</p></details>
          <details><summary>Preço e margem</summary><p>Preço ao cliente = preço da fábrica + comissão da loja + a sua margem. A sua margem é decidida por você. Cada venda fica registrada no seu nome.</p></details>
          <details><summary>Entrega</summary><p>Atendemos as maiores rodoviárias do país e, onde não houver, enviamos por Correios para o seu endereço. A entrega na rodoviária tem dia e hora marcados, sem janela de espera. Você avisa o cliente; se ele não aparecer, a mercadoria segue pelos Correios com o frete por conta do cliente.</p></details>
          <details><summary>Trocas</summary><p>Cada fábrica tem a sua política de troca, mostrada em cada modelo. Seguimos o Código de Defesa do Consumidor.</p></details>
          <details><summary>Quero minha loja</summary><p>Se quiser uma loja própria, fora do nosso site, há pacotes: {PACOTES.map((p) => `${p.nome} (implantação ${brl(p.implantacao)} + ${brl(p.mensal)}/mês)`).join('; ')}. Valores iniciais, sujeitos a confirmação.</p></details>
        </div>

        <form className="fo-card" id="cadastro" onSubmit={enviar}>
          <h2>Pedir cadastro</h2>
          {feito ? (
            <div className="fo-ok">Recebemos o seu pedido! Vamos conferir e chamar você pelo WhatsApp com o link do seu painel.</div>
          ) : (
            <>
              <label htmlFor="n">Seu nome</label>
              <input id="n" value={f.nome} onChange={muda('nome')} maxLength={80} required />
              <div className="fo-grid2">
                <div><label htmlFor="w">WhatsApp (com DDD)</label><input id="w" value={f.whatsapp} onChange={muda('whatsapp')} inputMode="tel" placeholder="31 99999-9999" required /></div>
                <div><label htmlFor="e">E-mail (opcional)</label><input id="e" type="email" value={f.email} onChange={muda('email')} maxLength={120} /></div>
              </div>
              <div className="fo-grid2">
                <div><label htmlFor="c">Cidade</label><input id="c" value={f.cidade} onChange={muda('cidade')} maxLength={80} required /></div>
                <div><label htmlFor="u">Estado</label><select id="u" value={f.estado} onChange={muda('estado')}>{ESTADOS.map((u) => <option key={u}>{u}</option>)}</select></div>
              </div>
              <label htmlFor="l">Onde você recebe a mercadoria (rodoviária ou endereço)</label>
              <input id="l" value={f.local_entrega} onChange={muda('local_entrega')} maxLength={200} placeholder="Ex.: Rodoviária de Belo Horizonte" />
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true"><input tabIndex={-1} autoComplete="off" value={f.site} onChange={muda('site')} /></div>
              <label className="fo-chk"><input type="checkbox" checked={f.aceite} onChange={muda('aceite')} /> Li e concordo com as regras acima e autorizo o uso dos meus dados para o cadastro.</label>
              {msg && <div className="fo-er">{msg}</div>}
              <p style={{ marginTop: 14 }}><button className="fo-btn" disabled={ocupado}>{ocupado ? 'Enviando…' : 'Enviar pedido de cadastro'}</button></p>
            </>
          )}
        </form>
        <p className="fo-mu"><Link href="/calcados">← Ver a vitrine de calçados</Link></p>
      </div>
    </div>
  );
}
