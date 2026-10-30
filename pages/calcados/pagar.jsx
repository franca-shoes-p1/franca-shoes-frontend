// Página do pedido de um fornecedor: o cliente paga por PIX direto ao fornecedor e acompanha o andamento.
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import QRCode from 'qrcode';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { brl, VAREJO, limparCarrinho } from '../../lib/varejo';

const ANDAMENTO = {
  aguardando_pagamento: ['1', 'Aguardando o seu PIX'],
  cliente_pagou: ['2', 'O fornecedor está conferindo o seu pagamento'],
  pago: ['3', 'Pagamento confirmado. O fornecedor está separando o seu pedido'],
  pronto_coleta: ['3', 'Pedido separado. Em breve será coletado para envio'],
  coletado: ['4', 'Pedido coletado. Preparando o envio pelos Correios'],
  enviado: ['5', 'Pedido enviado pelos Correios'],
  entregue: ['6', 'Pedido entregue'],
  cancelado: ['x', 'Pedido cancelado'],
};

export default function Pagar() {
  const { query, isReady } = useRouter();
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  const [qr, setQr] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(
    async (acao) => {
      if (!query.t) return;
      try {
        const r = await fetch(acao ? '/api/varejo/pagamento' : `/api/varejo/pagamento?t=${encodeURIComponent(query.t)}`, acao ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: query.t, acao }) } : undefined);
        const j = await r.json();
        if (!r.ok) throw new Error(j.erro || 'Erro');
        setD(j);
      } catch (e) {
        setErro(e.message || 'Não foi possível abrir o pedido.');
      }
    },
    [query.t]
  );

  useEffect(() => {
    if (!isReady) return;
    limparCarrinho();
    carregar();
  }, [isReady, carregar]);

  const copia = d && d.pix ? d.pix.copiaecola : '';
  useEffect(() => {
    if (!copia) { setQr(''); return; }
    QRCode.toDataURL(copia, { margin: 1, width: 260 }).then(setQr).catch(() => setQr(''));
  }, [copia]);

  async function copiar() {
    try { await navigator.clipboard.writeText(copia); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { setErro('Não consegui copiar. Selecione o código e copie manualmente.'); }
  }
  async function paguei() { setOcupado(true); await carregar('paguei'); setOcupado(false); }

  if (!isReady || (!d && !erro)) return <VarejoLayout titulo="Seu pedido"><p>Carregando…</p></VarejoLayout>;
  if (!d) return <VarejoLayout titulo="Seu pedido"><div className={styles.erro}>{erro}</div><Link href="/calcados" className={styles.botaoSecundario}>Ver os modelos</Link></VarejoLayout>;

  const { pedido: p, fornecedor: f, pix } = d;
  const and = ANDAMENTO[p.status] || ['', p.status];
  const zap = `https://wa.me/${f.whatsapp}?text=${encodeURIComponent(`Olá! Fiz o pedido nº ${p.numero} no site e paguei o PIX de ${brl(p.total)}.`)}`;

  return (
    <VarejoLayout titulo={`Pedido ${p.numero}`}>
      <div className={styles.caixa} style={{ maxWidth: 680 }}>
        <h1>Pedido nº {p.numero}</h1>
        <p className={styles.ok} style={{ marginTop: 10 }}>{and[1]}</p>
        {erro && <div className={styles.erro}>{erro}</div>}
        {p.status === 'cancelado' && p.motivo && <p style={{ marginTop: 10 }}>Motivo informado pelo fornecedor: {p.motivo}. Se você já pagou, peça o estorno do PIX ao fornecedor pelo WhatsApp abaixo.</p>}
        {p.rastreio && <p style={{ marginTop: 10 }}>Código de rastreio dos Correios: <b>{p.rastreio}</b></p>}

        <h2 style={{ marginTop: 18 }}>O que você comprou</h2>
        {p.itens.map((i, k) => (
          <div key={k} className={styles.linhaTotal}><span>{i.quantidade}× {i.titulo}{i.tamanho ? ` (nº ${i.tamanho})` : ''}</span><span>{brl(i.preco * i.quantidade)}</span></div>
        ))}
        <div className={styles.linhaTotal}><span>Frete</span><span>{brl(p.frete)}</span></div>
        <div className={`${styles.linhaTotal} ${styles.totalFinal}`}><span>Total</span><span>{brl(p.total)}</span></div>

        {pix && (
          <>
            <h2 style={{ marginTop: 22 }}>Pague por PIX</h2>
            <p style={{ margin: '6px 0' }}>O pagamento vai <b>direto para o fornecedor</b>: <b>{f.nome}</b>{f.cnpj ? ` (CNPJ ${f.cnpj})` : ''}. Titular da conta: {pix.titular}. O valor já vem preenchido: {brl(p.total)}.</p>
            {qr && <img src={qr} alt="QR Code do PIX" width={220} height={220} style={{ display: 'block', margin: '10px auto', border: '1px solid #e5e7eb', borderRadius: 8 }} />}
            <label className={styles.rotulo} htmlFor="pixcc">PIX copia e cola</label>
            <textarea id="pixcc" className={styles.campo} readOnly rows={4} value={copia} onFocus={(e) => e.target.select()} />
            <button type="button" className={styles.botaoPrincipal} onClick={copiar}>{copiado ? '✓ Código copiado' : 'Copiar código PIX'}</button>
            <p className={styles.aviso}>Confira o nome do titular na tela do seu banco antes de confirmar. Depois de pagar, clique no botão abaixo para avisar o fornecedor.</p>
            {p.status === 'aguardando_pagamento' && (
              <button type="button" className={styles.botaoSecundario} style={{ marginTop: 12 }} onClick={paguei} disabled={ocupado}>Já paguei</button>
            )}
          </>
        )}

        <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <a className={styles.botaoSecundario} href={zap} target="_blank" rel="noopener noreferrer">Falar com {f.nome} no WhatsApp</a>
          <button type="button" className={styles.botaoSecundario} onClick={() => carregar()}>Atualizar situação</button>
          <Link className={styles.botaoSecundario} href="/calcados">Continuar comprando</Link>
        </p>
        <p className={styles.itemMeta} style={{ marginTop: 14 }}>
          {f.nome} é quem vende, recebe o pagamento e emite a nota fiscal. A {VAREJO.nomeLoja} intermedeia o pedido, coleta e envia pelos Correios. Guarde este link para acompanhar.
        </p>
      </div>
    </VarejoLayout>
  );
}
