// Página pública para fornecedores de calçados e acessórios de Franca pedirem cadastro.
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FORN_CSS } from '../../lib/FornecedorCss';

const VAZIO = { nome_fantasia: '', responsavel: '', whatsapp: '', email: '', documento: '', endereco_coleta: '', emite_nota: false, aceite: false, site: '' };

export default function CadastroFornecedor() {
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
      const r = await fetch('/api/fornecedor/cadastro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, tempo: Date.now() - inicio.current }) });
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
        <title>Seja fornecedor no Franca Calçados</title>
        <meta name="description" content="Fábricas e lojas de calçados e acessórios de Franca: cadastre o seu catálogo, defina os preços e receba os pedidos direto, sem pagar mensalidade." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="fo-w">
        <div className="fo-hero">
          <h1>Venda os seus calçados e acessórios no Franca Calçados</h1>
          <p>Para fábricas, lojas e representantes de Franca. Você coloca o seu catálogo, controla o preço e recebe o pagamento direto dos clientes. Entrar é grátis.</p>
          <p style={{ margin: 0 }}><a className="fo-btn" style={{ background: '#fff', color: '#1e3a8a' }} href="#cadastro">Quero me cadastrar</a></p>
        </div>

        <div className="fo-card">
          <h2>Como funciona</h2>
          <ul className="fo-pass">
            <li><b>1. Cadastro</b>Você pede o cadastro aqui. Nós conferimos e liberamos o seu painel.</li>
            <li><b>2. Catálogo</b>Você coloca fotos, números e o seu preço. Você vê na hora quanto o cliente vai pagar.</li>
            <li><b>3. Pedido</b>O cliente compra no site e paga por PIX direto para você.</li>
            <li><b>4. Nota, coleta e entrega</b>Você faz o pedido, emite a nota fiscal no nome e CPF do cliente final e coloca na embalagem. Nós coletamos com você e levamos ao cliente, por rota de entrega ou pelos Correios.</li>
            <li><b>5. Acerto</b>Toda semana você acerta a nossa comissão (e a postagem, nos envios pelos Correios).</li>
          </ul>
          <p className="fo-mu" style={{ margin: 0 }}>O site ainda está em fase de testes e não prometemos volume de vendas. Você só paga comissão quando vender.</p>
        </div>

        <div className="fo-card">
          <h2>Regras para o fornecedor</h2>
          <details open><summary>Quem vende é você</summary><p>Você define preço, estoque e prazo de confecção, recebe o PIX do cliente na sua conta e emite a nota fiscal no nome do cliente final. Sem nota fiscal não conseguimos transportar a mercadoria, então só trabalhamos com quem emite. Nós não recebemos nem guardamos o dinheiro das vendas.</p></details>
          <details><summary>Comissão e preço</summary><p>Você digita o seu preço (o que quer receber por par). O site soma a nossa comissão e mostra o total ao cliente. A comissão padrão inicial é de 15% sobre o seu preço, por exemplo: R$ 100 vira R$ 115 para o cliente. Pode ser combinada de outra forma com cada fornecedor.</p></details>
          <details><summary>Nota, coleta, entrega e acerto</summary><p>Cada pedido traz o nome, o CPF e o local de entrega que devem constar na nota. Quando você marca o pedido como pronto, nós coletamos no seu endereço, na janela de horário combinada, levamos ao cliente por rota de entrega ou postamos pelos Correios. O frete pago pelo cliente vai junto no PIX que você recebe. Toda semana você paga por PIX a comissão, mais o custo real da postagem dos envios pelos Correios.</p></details>
          <details><summary>Trocas, devoluções e cancelamentos</summary><p>Seguem o Código de Defesa do Consumidor, inclusive o direito de arrependimento de 7 dias em compra pela internet. Como vendedor, você é responsável por troca, defeito e reembolso. Se faltar estoque, cancele o pedido no painel e devolva o PIX ao cliente.</p></details>
          <details><summary>Fotos, textos e qualidade</summary><p>Use só fotos e textos seus ou autorizados. Cada modelo novo é conferido antes de aparecer no site. Se você mudar foto ou descrição, ele volta para conferência.</p></details>
          <details><summary>Seus dados</summary><p>Usamos os seus dados só para operar o cadastro e os pedidos. O nome da sua empresa aparece no site como vendedor. O CNPJ aparece na página de pagamento. Os seus contatos internos não são divulgados.</p></details>
        </div>

        <form className="fo-card" id="cadastro" onSubmit={enviar}>
          <h2>Pedir cadastro</h2>
          {feito ? (
            <div className="fo-ok">Recebemos o seu pedido! Vamos conferir e chamar você pelo WhatsApp com o link do seu painel.</div>
          ) : (
            <>
              <label htmlFor="n">Nome da empresa ou marca</label>
              <input id="n" value={f.nome_fantasia} onChange={muda('nome_fantasia')} maxLength={80} required />
              <label htmlFor="r">Nome do responsável</label>
              <input id="r" value={f.responsavel} onChange={muda('responsavel')} maxLength={80} required />
              <div className="fo-grid2">
                <div><label htmlFor="w">WhatsApp (com DDD)</label><input id="w" value={f.whatsapp} onChange={muda('whatsapp')} inputMode="tel" placeholder="16 99999-9999" required /></div>
                <div><label htmlFor="e">E-mail (opcional)</label><input id="e" type="email" value={f.email} onChange={muda('email')} maxLength={120} /></div>
              </div>
              <label htmlFor="d">CNPJ ou CPF (opcional agora)</label>
              <input id="d" value={f.documento} onChange={muda('documento')} inputMode="numeric" placeholder="Só números" />
              <label htmlFor="c">Endereço onde buscaremos os pedidos (opcional agora)</label>
              <input id="c" value={f.endereco_coleta} onChange={muda('endereco_coleta')} maxLength={200} placeholder="Rua, número, bairro, Franca/SP" />
              <label className="fo-chk"><input type="checkbox" checked={f.emite_nota} onChange={muda('emite_nota')} /> Eu consigo emitir nota fiscal para o cliente</label>
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
