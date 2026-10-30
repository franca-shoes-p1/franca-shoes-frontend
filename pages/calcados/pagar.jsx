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
  coletado: ['4', 'Pedido coletado na fábrica. A entrega será combinada com você'],
  enviado: ['5', 'Pedido enviado pelos Correios'],
  entregue: ['6', 'Pedido entregue'],
  cancelado: ['x', 'Pedido cancelado'],
};

export default function Pagar() {
  const { query, isReady } = useRouter();
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  const [qr, setQr] = useState('');
  const [qr2, setQr2] = useState('');
  const [copiado2, setCopiado2] = useState(false);
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

  const copia2 = d && d.pix2 ? d.pix2.copiaecola : '';
  useEffect(() => {
    if (!copia2) { setQr2(''); return; }
    QRCode.toDataURL(copia2, { margin: 1, width: 260 }).then(setQr2).catch(() => setQr2(''));
  }, [copia2]);
  async function copiar2() {
    try { await navigator.clipboard.writeText(copia2); setCopiado2(true); setTimeout(() => setCopiado2(false), 2500); } catch { setErro('Não consegui copiar. Selecione o código e copie manualmente.'); }
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(copia); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { setErro('Não consegui copiar. Selecione o código e copie manualmente.'); }
  }
  async function paguei() { setOcupado(true); await carregar('paguei'); setOcupado(false); }

  if (!isReady || (!d && !erro)) return <VarejoLayout titulo="Seu pedido"><p>Carregando…</p></VarejoLayout>;
  if (!d) return <VarejoLayout titulo="Seu pedido"><div className={styles.erro}>{erro}</div><Link href="/calcados" className={styles.botaoSecundario}>Ver os modelos</Link></VarejoLayout>;

  const { pedido: p, fornecedor: f, pix, pix2 } = d;
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
            <h2 style={{ marginTop: 22 }}>Pague em dois PIX</h2>
            <p style={{ margin: '6px 0' }}>
              O seu pedido tem dois pagamentos, cada um para quem recebe: o <b>PIX 1</b> é o preço do produto, direto para o fornecedor, e o <b>PIX 2</b> é o serviço de intermediação e entrega, para a loja. Pague os dois.
            </p>

            <h3 style={{ marginTop: 14 }}>PIX 1 · Produto · {brl(pix.valor)}</h3>
            <p style={{ margin: '6px 0' }}>Para <b>{f.nome}</b>{f.cnpj ? ` (CNPJ ${f.cnpj})` : ''}. Titular da conta: {pix.titular}.</p>
            {qr && <img src={qr} alt="QR Code do PIX 1" width={200} height={200} style={{ display: 'block', margin: '10px auto', border: '1px solid #e5e7eb', borderRadius: 8 }} />}
            <label className={styles.rotulo} htmlFor="pixcc">PIX 1 copia e cola</label>
            <textarea id="pixcc" className={styles.campo} readOnly rows={3} value={copia} onFocus={(e) => e.target.select()} />
            <button type="button" className={styles.botaoPrincipal} onClick={copiar}>{copiado ? '✓ Código copiado' : 'Copiar código do PIX 1'}</button>

            {pix2 ? (
              <>
                <h3 style={{ marginTop: 22 }}>PIX 2 · Intermediação e entrega · {brl(pix2.valor)}</h3>
                <p style={{ margin: '6px 0' }}>Para a loja. Titular da conta: {pix2.titular}. Inclui a margem do atendimento e o frete.</p>
                {qr2 && <img src={qr2} alt="QR Code do PIX 2" width={200} height={200} style={{ display: 'block', margin: '10px auto', border: '1px solid #e5e7eb', borderRadius: 8 }} />}
                <label className={styles.rotulo} htmlFor="pixcc2">PIX 2 copia e cola</label>
                <textarea id="pixcc2" className={styles.campo} readOnly rows={3} value={copia2} onFocus={(e) => e.target.select()} />
                <button type="button" className={styles.botaoPrincipal} onClick={copiar2}>{copiado2 ? '✓ Código copiado' : 'Copiar código do PIX 2'}</button>
              </>
            ) : d.pix2Falta ? (
              <p className={styles.aviso} style={{ marginTop: 14 }}>O PIX 2 ({brl(p.total - pix.valor)}) será enviado a você pelo WhatsApp da loja. Fale com a loja pelo botão abaixo.</p>
            ) : null}

            <p className={styles.aviso}>Confira o nome do titular na tela do seu banco antes de confirmar cada PIX. Depois de pagar os dois, clique em “Já paguei”.</p>
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
          {f.nome} é quem vende, recebe o pagamento e emite a nota fiscal. A {VAREJO.nomeLoja} intermedeia o pedido e faz a coleta e a entrega, por rota ou pelos Correios. O prazo inclui a confecção. Guarde este link para acompanhar.
        </p>
      </div>
    </VarejoLayout>
  );
}
